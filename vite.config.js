import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    // Proxy requests (like HTML) to Hugo's server
    proxy: {
      '/': {
        target: 'http://localhost:1313',
        changeOrigin: true,
      }
    }
  }
});