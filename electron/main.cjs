const path = require('node:path');
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const http = require('node:http');

const isDev = !app.isPackaged;
let staticServer;
const gatewayUrl = isDev
  ? process.env.GAZELLA_API_BASE_URL || 'http://localhost:4000'
  : "http://localhost:4000";

const proxiedPrefixes = [
  '/api/auth',
  '/oidc',
  '/accounts',
  '/socials',
  '/articles',
  '/projects',
  '/media',
];

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  return contentTypes[extension] || 'application/octet-stream';
}

function startStaticServer() {
  const distDir = path.join(__dirname, '..', 'dist');

  staticServer = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://localhost:4173');

    if (proxiedPrefixes.some((prefix) => requestUrl.pathname.startsWith(prefix))) {
      const proxyRequest = http.request(`${gatewayUrl}${requestUrl.pathname}${requestUrl.search}`, {
        method: request.method,
        headers: {
          ...request.headers,
          host: new URL(gatewayUrl).host,
          origin: 'http://localhost:4173',
          referer: 'http://localhost:4173/',
        },
      }, (proxyResponse) => {
        const headers = { ...proxyResponse.headers };

        if (headers.location && typeof headers.location === 'string' && headers.location.startsWith(gatewayUrl)) {
          headers.location = headers.location.replace(gatewayUrl, '');
        }

        response.writeHead(proxyResponse.statusCode || 500, headers);
        proxyResponse.pipe(response);
      });

      proxyRequest.on('error', () => {
        response.writeHead(502, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Gazella gateway is not available.' }));
      });

      request.pipe(proxyRequest);
      return;
    }

    const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
    const candidatePath = path.join(distDir, safePath);
    const filePath = fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()
      ? candidatePath
      : path.join(distDir, 'index.html');

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(500);
        response.end('Unable to load application.');
        return;
      }

      response.writeHead(200, { 'Content-Type': getContentType(filePath) });
      response.end(content);
    });
  });

  return new Promise((resolve) => {
    staticServer.listen(4173, 'localhost', resolve);
  });
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
  } else {
    await startStaticServer();
    await mainWindow.loadURL('http://localhost:4173');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (staticServer) {
    staticServer.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
