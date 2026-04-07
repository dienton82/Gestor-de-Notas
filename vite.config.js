// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Gestor-de-Notas/',
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'https://stg.prolibu.com',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, '/v2')
      }
    }
  }
})
