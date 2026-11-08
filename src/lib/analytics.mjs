/**
 * Adds Google Tag Manager (which loads Google Analytics) to every page, at the end of `astro build`:
 * it inserts the loader at the top of the <head> of each .html file in dist/. Doing it after the
 * build, rather than in a layout, covers every page whatever writes its <head>, including the
 * interactives copied in prebuilt (public/interactive/), which shouldn't be edited by hand.
 *
 * The loader only runs on the live site's domain (`site` in astro.config.mjs), so pull request
 * previews and local servers don't count as visits, and `npm run dev` never includes it.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const CONTAINER_ID = "GTM-W9R66S6S";

/**
 * Pages that aren't for readers, relative to dist/: internal tools, and the election results loop
 * staff capture for Instagram Live.
 */
const EXCLUDE = [/^editors\//, /^interactive\/election-2026\/broadcast\.html$/];

/** Google's Tag Manager loader, run only on `hostname`. */
const loader = (hostname) =>
  `<script>if(location.hostname===${JSON.stringify(hostname)}){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(CONTAINER_ID)});}</script>`;

/** @returns {import("astro").AstroIntegration} */
export default function analytics() {
  let hostname;
  return {
    name: "analytics",
    hooks: {
      "astro:config:done": ({ config }) => {
        hostname = new URL(config.site).hostname;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter(
          (path) => path.endsWith(".html") && !EXCLUDE.some((pattern) => pattern.test(path)),
        );
        const script = loader(hostname);
        for (const path of pages) {
          const file = `${root}/${path}`;
          const html = await readFile(file, "utf8");
          if (html.includes(CONTAINER_ID)) continue;
          // The opening <head> tag (not <header>)
          const head = /<head(?=[\s>])[^>]*>/i.exec(html);
          if (!head)
            throw new Error(`Analytics: ${path} has no <head> to add Google Tag Manager to.`);
          const at = head.index + head[0].length;
          await writeFile(file, html.slice(0, at) + script + html.slice(at));
        }
        logger.info(`Added Google Tag Manager to ${pages.length} pages (for ${hostname} only).`);
      },
    },
  };
}
