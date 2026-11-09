/**
 * Builds the site's search index (with Pagefind) at the end of `astro build`, into dist/pagefind/,
 * which the /search page loads.
 *
 * It doesn't crawl the built pages: they include the text visuals render at build time (chart axes,
 * legends), and the projects.dailycal.org stories have no page here. Instead each article is one
 * record from dist/search-records.json (src/pages/search-records.json.ts). Its text is its title
 * (weighted highest) and byline, then its subhead, description, keywords and the prose of its .mdx
 * (src/lib/search-text.ts). Pagefind only searches text, not metadata, so the title and byline have
 * to be in it; the /search page leaves them out of the passage it shows with each result. The
 * metadata (title, byline, date, link, image) is what the page shows for each result.
 *
 * The articles whose card links to projects.dailycal.org get their text from that site's own index
 * (PROJECTS_INDEX), so each is one result with its full text. If it can't be downloaded, the build
 * warns and those articles are searchable by title, subhead and byline only.
 */
import { readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";

const PROJECTS_INDEX = "https://projects.dailycal.org/search-index.json";

/** HTML-escapes text for an element's content or a double-quoted attribute. */
const escape = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** projects.dailycal.org's index, as Map<story URL, text>, or undefined if it can't be downloaded. */
async function projectsText(logger) {
  try {
    const response = await fetch(PROJECTS_INDEX, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { records } = await response.json();
    if (!Array.isArray(records)) throw new Error("it has no records");
    return new Map(
      records
        .filter((r) => typeof r?.url === "string" && typeof r.content === "string")
        .map((r) => [r.url, r.content]),
    );
  } catch (error) {
    logger.warn(
      `Couldn't download ${PROJECTS_INDEX} (${error.message}), so the stories on projects.dailycal.org are searchable by title, subhead and byline only.`,
    );
    return undefined;
  }
}

/** A record as a small HTML page for Pagefind: metadata (for search, and showing the result), then its text. */
function recordHTML(record, text) {
  const meta = {
    title: record.title,
    byline: record.byline,
    date: record.date,
    href: record.href,
    image: record.image,
    image_srcset: record.imageSrcset,
    image_alt: record.imageAlt,
    image_position: record.imagePosition,
  };
  const paragraphs = text
    ? text.split("\n").map((line) => ({ heading: false, text: line }))
    : record.body;
  return `<html lang="en"><head>${Object.entries(meta)
    .map(([key, value]) => `<meta data-pagefind-meta="${key}[content]" content="${escape(value)}">`)
    .join("")}</head><body>
<h1 data-pagefind-weight="10">${escape(record.title)}</h1>
<p data-pagefind-weight="5">${escape(record.byline)}</p>
${record.about.map((line) => `<p>${escape(line)}</p>`).join("\n")}
${paragraphs
  .filter((block) => block.text.trim())
  .map((block) =>
    block.heading ? `<h2>${escape(block.text)}</h2>` : `<p>${escape(block.text)}</p>`,
  )
  .join("\n")}
</body></html>`;
}

/** @returns {import("astro").AstroIntegration} */
export default function searchIndex() {
  return {
    name: "search-index",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const recordsFile = fileURLToPath(new URL("search-records.json", dir));
        const records = JSON.parse(await readFile(recordsFile, "utf8"));
        await rm(recordsFile);

        const projects = await projectsText(logger);
        if (projects) {
          const cards = new Set(records.map((r) => r.href));
          for (const url of projects.keys()) {
            if (!cards.has(url)) {
              logger.warn(
                `${url} is in ${PROJECTS_INDEX} but no article links to it, so it isn't searchable.`,
              );
            }
          }
        }

        const { index, errors } = await pagefind.createIndex({ forceLanguage: "en" });
        if (!index) throw new Error(`Pagefind: ${errors.join(", ")}`);
        let fromProjects = 0;
        for (const record of records) {
          const text = projects?.get(record.href);
          if (text) fromProjects++;
          if (projects && !text && record.href.startsWith("https://projects.dailycal.org/")) {
            logger.warn(
              `${record.href} isn't in ${PROJECTS_INDEX}, so it's searchable by title, subhead and byline only.`,
            );
          }
          // Pagefind needs a unique URL per record; results link to the href in their metadata
          const added = await index.addHTMLFile({
            url: `/${encodeURIComponent(record.href)}`,
            content: recordHTML(record, text),
          });
          if (added.errors.length) throw new Error(`Pagefind: ${added.errors.join(", ")}`);
        }
        const written = await index.writeFiles({
          outputPath: fileURLToPath(new URL("pagefind", dir)),
        });
        if (written.errors.length) throw new Error(`Pagefind: ${written.errors.join(", ")}`);
        await pagefind.close();
        logger.info(
          `Indexed ${records.length} articles for search (${fromProjects} with text from projects.dailycal.org).`,
        );
      },
    },
  };
}
