// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

/** Production origin — used for canonical URLs, the sitemap and Open Graph tags. */
export const SITE_URL = 'https://naufalhamzah.github.io';

/**
 * DEPLOY BASE — this repository is NOT named `<user>.github.io`, so GitHub Pages
 * publishes it under a path (`https://naufalhamzah.github.io/naufalhamzah/`)
 * rather than at the domain root. Every link and image must carry that prefix.
 *
 * Derived from the environment rather than hardcoded, because the prefix must be
 * PRESENT when deploying and ABSENT in development: hardcoding it makes
 * `npm run dev` serve under the prefix, and emptying it locally and forgetting to
 * restore it ships a site whose every link points at the domain root. GitHub
 * Actions sets `GITHUB_ACTIONS=true` and a local dev run does not, so the two can
 * never disagree.
 *
 * Astro rewrites only the URLs IT generates (bundled CSS/JS); hand-written
 * strings go through `withBase()` / `asset()` in `src/utils/url.ts`.
 *
 * Moving to a custom domain or a renamed `<user>.github.io` repo makes this a
 * no-op — the helpers pass their input straight through.
 */
export const BASE_PATH = process.env.GITHUB_ACTIONS ? '/naufalhamzah' : '';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,

  // Static-first: every page is pre-rendered to plain HTML at build time.
  output: 'static',

  integrations: [
    sitemap(),
    // React is used for exactly ONE island: the project category filter, which
    // needs real client-side state. Everything else is static Astro markup.
    react(),
  ],

  // Disabled on purpose: the toolbar renders a floating bar over the bottom of
  // every dev page and injects ~15 extra script requests per route, which hides
  // content during layout review and makes a dev network trace look nothing like
  // production. The site ships only the /projects React island and one small
  // inline script on the homepage (the hero's pointer drift).
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },
});
