// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      // Toda a vez que o frontend fizer um pedido que começa com /api,
      // o Vite vai redireccioná-lo para o backend em localhost:3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,  // necessário para alguns servidores
      }
    }
  }
})