import { defineConfig } from 'vite';

// base './' keeps asset paths relative so the build works on any host
// (GitHub Pages sub-path, a company server, or a CDN).
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
