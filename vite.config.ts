import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    // Dedicated port — avoids "5173 already in use" when other Vite apps run
    port: 5180,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['sql.js'],
  },
});
