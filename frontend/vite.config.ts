import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/iakoa-app/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'UNKNOWN_AT_RULE') return
        warn(warning)
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Proxy de développement : le navigateur n'appelle que localhost:5173, Vite
    // relaie « /api/* » vers le backend en local (évite les soucis réseau WSL2 et
    // rend les requêtes same-origin → cookies/CORS simplifiés).
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
