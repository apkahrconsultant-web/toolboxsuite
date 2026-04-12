/**
 * Vite Plugin — Auto-generate sitemap.xml
 *
 * Scans the built index.html for all `data-tab` attributes on tab buttons,
 * then generates a sitemap.xml with a <url> entry for each tool.
 * Whenever you add a new tool tab to index.html, the sitemap is
 * automatically updated on the next build — zero maintenance.
 */
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://toolboxsuite.com'; // ← Change to your production domain

/**
 * Map each tab ID to a human-friendly tool name and optional priority.
 * If a new tab isn't listed here it still gets included with defaults.
 */
const TOOL_META = {
  'bg-remover':        { slug: 'background-remover',  priority: '1.0' },
  'pdf-to-word':       { slug: 'pdf-to-word',         priority: '0.9' },
  'word-to-pdf':       { slug: 'word-to-pdf',         priority: '0.9' },
  'excel-to-pdf':      { slug: 'excel-to-pdf',        priority: '0.9' },
  'pdf-to-excel':      { slug: 'pdf-to-excel',        priority: '0.9' },
  'image-compressor':  { slug: 'image-compressor',    priority: '0.8' },
  'pdf-merger':        { slug: 'pdf-merger',           priority: '0.8' },
  'image-resizer':     { slug: 'image-resizer',        priority: '0.8' },
  'jpg-to-png':        { slug: 'jpg-to-png',           priority: '0.8' },
};

export default function sitemapPlugin(options = {}) {
  const siteUrl = options.siteUrl || SITE_URL;

  return {
    name: 'vite-plugin-sitemap',
    enforce: 'post',

    closeBundle() {
      const outDir = options.outDir || 'dist';
      const indexPath = path.resolve(outDir, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('[sitemap] dist/index.html not found — skipping sitemap generation.');
        return;
      }

      const html = fs.readFileSync(indexPath, 'utf-8');

      // Extract every data-tab="..." value
      const tabRegex = /data-tab="([^"]+)"/g;
      const tabs = [];
      let match;
      while ((match = tabRegex.exec(html)) !== null) {
        tabs.push(match[1]);
      }

      if (tabs.length === 0) {
        console.warn('[sitemap] No tool tabs detected — skipping.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const urls = [
        // Homepage
        `  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
      ];

      tabs.forEach((tabId) => {
        const meta = TOOL_META[tabId] || { slug: tabId, priority: '0.7' };
        urls.push(`  <url>
    <loc>${siteUrl}/#${meta.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${meta.priority}</priority>
  </url>`);
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

      const sitemapPath = path.resolve(outDir, 'sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
      console.log(`[sitemap] ✅ Generated sitemap.xml with ${tabs.length + 1} URLs`);
    },
  };
}
