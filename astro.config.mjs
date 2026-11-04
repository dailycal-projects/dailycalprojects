// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

import { satteri } from "@astrojs/markdown-satteri";

import { articleDates } from "./src/lib/article-dates.mjs";
import { browserOnlyPackages } from "./src/lib/browser-only-packages.mjs";
import { keepD3SideEffects } from "./src/lib/keep-d3-side-effects.mjs";
import { unwrapJsxParagraphs } from "./src/lib/unwrap-jsx-paragraphs.mjs";

// Get git repo info (GITHUB_REPOSITORY is set in GitHub Actions; elsewhere, e.g. on Cloudflare or
// locally, this builds for the main site)
const MAIN_REPO = "dailycal-projects/dailycalprojects";
const MAIN_SITE = "https://data.dailycal.org";

const repository = process.env.GITHUB_REPOSITORY ?? MAIN_REPO;
const [owner, name] = repository.split("/");
const isFork = repository !== MAIN_REPO;

const base = isFork ? `/${name}` : "/";

console.log(`Building for repo ${repository} (fork: ${isFork})`);

// Each article's publish date, for the sitemap's <lastmod>; the homepage changes with the newest
const dates = articleDates();
const newestDate = [...dates.values()].sort().at(-1);

/** A built page's path, without the base: "https://x.github.io/repo/a/" -> "/a/" */
const sitePath = (page) => `/${new URL(page).pathname.slice(base.length).replace(/^\//, "")}`;

export default defineConfig({
  site: isFork ? `https://${owner}.github.io` : MAIN_SITE,
  base,

  markdown: {
    // <p>...</p> etc. in .mdx render like MDX 1 did; see src/lib/unwrap-jsx-paragraphs.mjs
    processor: satteri({ mdastPlugins: [unwrapJsxParagraphs] }),
  },

  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [
      // Leaflet etc. can't be imported on the server; see src/lib/browser-only-packages.mjs
      browserOnlyPackages({ sourceGlob: "src/visuals/**/*.{js,jsx,ts,tsx}" }),
      // d3.select(...).transition() needs d3-transition kept; see src/lib/keep-d3-side-effects.mjs
      keepD3SideEffects(),
    ],
    build: {
      // Some articles' visuals bundle their data into their JavaScript (up to ~4 MB). Each only
      // loads on its own article, so the default 500 kB warning doesn't apply.
      chunkSizeWarningLimit: 4096,
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      // /editors/ holds internal tools that robots.txt disallows
      filter: (page) => !sitePath(page).startsWith("/editors/"),
      serialize(item) {
        const path = sitePath(item.url);
        const date =
          path === "/" ? newestDate : dates.get(path.match(/^\/article\/([^/]+)\/$/)?.[1]);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
  ],
});
