import { defineConfig } from 'vite';
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
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
});
