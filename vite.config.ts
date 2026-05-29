import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/oidc': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/accounts': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socials': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/articles': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})