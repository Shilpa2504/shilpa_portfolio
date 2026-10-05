import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, relative } from 'node:path';
import { createMediaManifest } from './scripts/media-manifest.mjs';

export default defineConfig(({ mode }) => {
  const { VITE_SITE_URL } = loadEnv(mode, process.cwd(), 'VITE_');
  const site = VITE_SITE_URL ? new URL(VITE_SITE_URL) : null;
  if (site && !['http:', 'https:'].includes(site.protocol)) throw new Error('VITE_SITE_URL must be an HTTP(S) URL.');
  const origin = site?.origin;
  const uploadDirectory = resolve(process.cwd(), 'public/uploads');
  const assetDirectory = resolve(process.cwd(), 'public/assets');
  return {
    define: { __PORTFOLIO_MEDIA__: JSON.stringify(createMediaManifest(uploadDirectory)) },
    plugins: [react(), {
      name: 'portfolio-local-media',
      configureServer(server) {
        let restartTimer: ReturnType<typeof setTimeout> | undefined;
        /** Refreshes the build-time manifest when original upload files arrive. */
        const update = (file: string) => {
          const path = relative(resolve(process.cwd(), 'public'), file);
          if (path.startsWith('..') || !/\.(png|jpe?g|webp|pdf)$/i.test(path)) { return; }
          clearTimeout(restartTimer);
          restartTimer = setTimeout(() => { void server.restart(); }, 300);
        };
        server.watcher.add(uploadDirectory);
        server.watcher.add(assetDirectory);
        server.watcher.on('add', update).on('unlink', update).on('change', update);
        server.httpServer?.once('close', () => {
          clearTimeout(restartTimer);
          server.watcher.off('add', update).off('unlink', update).off('change', update);
        });
      },
    }, {
      name: 'portfolio-production-seo',
      transformIndexHtml(html) {
        if (!origin) return html;
        return {
          html: html.replaceAll('content="/social-card.png"', `content="${origin}/social-card.png"`),
          tags: [
            { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:url', content: `${origin}/` }, injectTo: 'head' },
          ],
        };
      },
      generateBundle() {
        if (!origin) return;
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>` });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` });
      },
    }],
    build: { target: 'es2022' },
  };
});