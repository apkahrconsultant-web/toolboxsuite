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
        'bg-remover': resolve(__dirname, 'bg-remover.html'),
        'pdf-to-word': resolve(__dirname, 'pdf-to-word.html'),
        'word-to-pdf': resolve(__dirname, 'word-to-pdf.html'),
        'excel-to-pdf': resolve(__dirname, 'excel-to-pdf.html'),
        'pdf-to-excel': resolve(__dirname, 'pdf-to-excel.html'),
        'compressor': resolve(__dirname, 'image-compressor.html'),
        'pdf-merger': resolve(__dirname, 'pdf-merger.html'),
        'resizer': resolve(__dirname, 'resizer.html'),
        'jpg-to-png': resolve(__dirname, 'jpg-to-png.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
});
