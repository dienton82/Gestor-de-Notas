// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Gestor-de-Notas/',   // ← Asegúrate de que coincide con tu repo
  plugins: [
    vue(),
    tailwindcss()
  ]
})