import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Get API URL from environment or use default
const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      }
    }
  }
})