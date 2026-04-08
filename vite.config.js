// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_APP_BASE_PATH || '/Gestor-de-Notas/',
    plugins: [vue(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://stg.prolibu.com',
          changeOrigin: true,
          secure: true,
          rewrite: path => path.replace(/^\/api/, '/v2')
        }
      }
    }
  }
})
