import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TARGET = 'http://localhost:4000';
const DEV_ORIGIN = 'http://localhost:5173';

function createProxy() {
    return {
        target: TARGET,
        changeOrigin: true,
        configure: (proxy: any) => {
            proxy.on('proxyRes', (proxyRes: any) => {
                if (proxyRes.headers.location) {
                    proxyRes.headers.location = proxyRes.headers.location.replace(
                        TARGET,
                        DEV_ORIGIN
                    );
                }
            });
        },
    };
}

export default defineConfig({
    base: './',
    plugins: [react()],
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