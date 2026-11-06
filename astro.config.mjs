// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

import { satteri } from "@astrojs/markdown-satteri";

import { articleDates } from "./src/lib/article-dates.mjs";
import { browserOnlyPackages } from "./src/lib/browser-only-packages.mjs";
import { keepD3SideEffects } from "./src/lib/keep-d3-side-effects.mjs";
import searchIndex from "./src/lib/search-index.mjs";
import { unwrapJsxParagraphs } from "./src/lib/unwrap-jsx-paragraphs.mjs";

// Each article's publish date, for the sitemap's <lastmod>; the homepage changes with the newest
const dates = articleDates();
const newestDate = [...dates.values()].sort().at(-1);

/** A built page's path: "https://data.dailycal.org/a" -> "/a" */
const sitePath = (page) => new URL(page).pathname;

export default defineConfig({
  // Canonical links, social previews and the sitemap always point here, even in a PR preview
  site: "https://data.dailycal.org",

  // Pages have no trailing slash: /article/x, built as article/x.html (Cloudflare serves it there,
  // and redirects /article/x/ to it)
  trailingSlash: "never",
  build: {
    format: "file",
  },

  markdown: {
    // <p>...</p> etc. in .mdx render like MDX 1 did; see src/lib/unwrap-jsx-paragraphs.mjs
    processor: satteri({ mdastPlugins: [unwrapJsxParagraphs] }),
  },

  devToolbar: {
    enabled: false,
  },

  vite: {
    // Gatsby-style environment variables that some visuals read (Gatsby exposed GATSBY_* variables
    // to the browser as process.env.GATSBY_*), from the build's environment
    define: Object.fromEntries(
      ["GATSBY_CARTO_KEY", "GATSBY_PACK_BASE"].map((key) => [
        `process.env.${key}`,
        JSON.stringify(process.env[key] ?? ""),
      ]),
    ),
    plugins: [
      // Leaflet etc. can't be imported on the server; see src/lib/browser-only-packages.mjs
      browserOnlyPackages({ sourceGlob: "src/visuals/**/*.{js,jsx,ts,tsx}" }),
      // d3.select(...).transition() needs d3-transition kept; see src/lib/keep-d3-side-effects.mjs
      keepD3SideEffects(),
    ],
    build: {
      // Some articles' visuals bundle their data into their JavaScript (up to ~4.1 MB). Each only
      // loads on its own article, so the default 500 kB warning doesn't apply.
      chunkSizeWarningLimit: 4200,
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      // /editors/ holds internal tools that robots.txt disallows; /search is noindex
      filter: (page) => !sitePath(page).startsWith("/editors/") && sitePath(page) !== "/search",
      serialize(item) {
        const path = sitePath(item.url);
        const date = path === "/" ? newestDate : dates.get(path.match(/^\/article\/([^/]+)$/)?.[1]);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    // The /search page's index; see src/lib/search-index.mjs
    searchIndex(),
  ],
});
