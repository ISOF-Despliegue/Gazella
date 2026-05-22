import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': 'http://localhost:4000',
      '/oidc': 'http://localhost:4000',
      '/accounts': 'http://localhost:4000',
      '/socials': 'http://localhost:4000',
      '/articles': 'http://localhost:4000',
    },
  },
})
