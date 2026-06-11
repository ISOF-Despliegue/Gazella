import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindscss from '@tailwindcss/vite'

const TARGET = 'http://localhost:4000';
const DEV_ORIGIN = 'http://localhost:5173';

function createProxy() {
    return {
        target: TARGET,
        changeOrigin: true,
        configure: (proxy: any) => {
            proxy.on('proxyReq', (proxyReq: Request, req: Request, _res: Response) => {
                console.log('Proxying request to backend:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: any, req: Request) => {
                if (proxyRes.headers.location) {
                    proxyRes.headers.location = proxyRes.headers.location.replace(
                        TARGET,
                        DEV_ORIGIN
                    );
                }
                console.log(`Received proxy response: ${proxyRes.statusCode}, ${req.url}`);
            });
            proxy.on('error', (err: any, _req: Request, _res: Response) => {
                console.error('Error on proxy:', err);
            });
        },
    };
}

export default defineConfig({
    base: './',
    plugins: [react(), tailwindscss()],
    server: {
        port: 5173,
        proxy: {
            '/api/auth': createProxy(),
            '/oidc': createProxy(),
            '/accounts': createProxy(),
            '/socials': createProxy(),
            '/articles': createProxy(),
            '/projects': createProxy(),
            '/my-projects': createProxy(),
            '/my-enrollments': createProxy(),
            '/media': createProxy(),
        },
    },
})