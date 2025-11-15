import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite config in plain JavaScript (ESM)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
