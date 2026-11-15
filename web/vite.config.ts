import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '../app/src/main/assets/www',
    emptyOutDir: true,
    target: 'chrome80',
    cssTarget: 'chrome80',
    sourcemap: false,
    assetsInlineLimit: 0,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
