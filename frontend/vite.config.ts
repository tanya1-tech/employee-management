import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [vue()],
  
  css: {
    postcss: './postcss.config.js',
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      }
    }
  },
  
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    // ✅ Force CSS processing
    sourcemap: false,
    minify: 'terser',
  },
  
  // ✅ Add this
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
})