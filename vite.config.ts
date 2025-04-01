import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import loggingpatcher from 'vite-logging-patchers'

export default defineConfig({
  plugins: [react(),loggingpatcher()],
  base: '',
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
    static: {
      directory: 'public',
      serveDirectory: true
    }
  },
  build: {
    assetsDir: 'assets',
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
