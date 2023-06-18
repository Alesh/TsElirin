import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8500',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: { include: [] },
  },
  optimizeDeps: {
    force: true,
    disabled: false,
  },
  plugins: [react()],
});
