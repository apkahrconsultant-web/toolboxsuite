import { defineConfig } from 'vite';
import { resolve } from 'path';
import sitemapPlugin from './vite-plugin-sitemap.js';

export default defineConfig({
  plugins: [
    sitemapPlugin({
      // ← Replace with your production domain before deploying
      siteUrl: 'https://toolboxsuite.com',
    }),
  ],
  build: {
    chunkSizeWarningLimit: 5000, // ML model bundles are large
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'remove-background': resolve(__dirname, 'remove-background.html'),
        'pdf-to-word': resolve(__dirname, 'pdf-to-word.html'),
        'word-to-pdf': resolve(__dirname, 'word-to-pdf.html'),
        'excel-to-pdf': resolve(__dirname, 'excel-to-pdf.html'),
        'pdf-to-excel': resolve(__dirname, 'pdf-to-excel.html'),
        'image-compressor': resolve(__dirname, 'image-compressor.html'),
        'pdf-merger': resolve(__dirname, 'pdf-merger.html'),
        'image-resizer': resolve(__dirname, 'image-resizer.html'),
        'jpg-to-png': resolve(__dirname, 'jpg-to-png.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
});
