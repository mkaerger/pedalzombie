// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Static build only: the site is hosted on Strato Basic (Apache, no Node.js).
export default defineConfig({
  site: 'https://pedalzombie.com',
  output: 'static',
  build: { format: 'directory' },
  integrations: [react(), mdx(), sitemap({ filter: (page) => !/\/(legal|privacy|404)\/?$/.test(page) })],
});