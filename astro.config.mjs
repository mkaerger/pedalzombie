// @ts-check
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * <lastmod> for the sitemap: the last commit that touched a page's sources.
 * Google ignores lastmod when it is just the build time, so every page maps
 * to the files it is rendered from. Needs the full git history (CI checks out
 * with fetch-depth 0); without git the sitemap is written without dates.
 */
const PEDAL_DIR = 'src/pedals';
const pedalFileBySlug = new Map(
  readdirSync(PEDAL_DIR)
    .filter((f) => f.endsWith('.ts'))
    .flatMap((f) => {
      const slug = readFileSync(`${PEDAL_DIR}/${f}`, 'utf8').match(/^\s*slug:\s*'([^']+)'/m)?.[1];
      return slug ? [[slug, `${PEDAL_DIR}/${f}`]] : [];
    }),
);
const LAYOUT = ['src/layouts', 'src/components/Consent.astro'];
const EDITOR = ['src/pages/[editor].astro', 'src/editor', 'src/components/EditorAbout.astro', `${PEDAL_DIR}/shared.ts`, `${PEDAL_DIR}/automatone.ts`];

/** @param {string} pathname */
function sourcesOf(pathname) {
  const editor = pathname.match(/^\/([a-z0-9]+-editor)\/$/)?.[1];
  if (editor) return [...LAYOUT, ...EDITOR, pedalFileBySlug.get(editor) ?? PEDAL_DIR];
  if (pathname === '/') return [...LAYOUT, 'src/pages/index.astro', 'src/components/PedalCard.astro', PEDAL_DIR];
  const page = pathname.replace(/\//g, '');
  return [...LAYOUT, `src/pages/${page}.mdx`, `src/pages/${page}.astro`, ...(page === 'setup' ? ['src/components/SetupChain.astro', 'src/components/SetupVideo.astro'] : [])];
}

/** @param {string[]} paths */
function lastCommit(paths) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out ? new Date(out) : undefined;
  } catch {
    return undefined;
  }
}

// Static build only: the site is hosted on Strato Basic (Apache, no Node.js).
export default defineConfig({
  site: 'https://pedalzombie.com',
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !/\/(legal|privacy|404)\/?$/.test(page),
      serialize: (item) => {
        const lastmod = lastCommit(sourcesOf(new URL(item.url).pathname));
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      },
    }),
  ],
});
