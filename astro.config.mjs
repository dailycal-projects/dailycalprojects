// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// Get git repo info (GITHUB_REPOSITORY is set in GitHub Actions; elsewhere, e.g. on Netlify or
// locally, this builds for the main site)
const MAIN_REPO = "dailycal-projects/dailycalprojects";
const MAIN_SITE = "https://data.dailycal.org";

const repository = process.env.GITHUB_REPOSITORY ?? MAIN_REPO;
const [owner, name] = repository.split("/");
const isFork = repository !== MAIN_REPO;

const base = isFork ? `/${name}` : "/";

console.log(`Building for repo ${repository} (fork: ${isFork})`);

/** A built page's path, without the base: "https://x.github.io/repo/a/" -> "/a/" */
const sitePath = (page) => `/${new URL(page).pathname.slice(base.length).replace(/^\//, "")}`;

export default defineConfig({
  site: isFork ? `https://${owner}.github.io` : MAIN_SITE,
  base,

  redirects: {
    "/article": "/",
  },

  devToolbar: {
    enabled: false,
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      // /editors/ holds internal tools that robots.txt disallows. Leave out redirects: /article,
      // and old Gatsby article URLs (/<yyyy-mm-dd>-<slug>/, see src/pages/[legacySlug].astro)
      filter: (page) => {
        const path = sitePath(page);
        return (
          !path.startsWith("/editors/") &&
          !/^\/article\/?$/.test(path) &&
          !/^\/\d{4}-\d{2}-\d{2}-[^/]+\/?$/.test(path)
        );
      },
    }),
  ],
});
