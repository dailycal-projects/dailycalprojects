/**
 * Each article's publish date, read straight from its frontmatter, for astro.config.mjs (which runs
 * before content collections exist): used as the sitemap's <lastmod> dates.
 */
import { readFileSync, globSync } from "node:fs";
import { basename } from "node:path";

/** Map of article id (its file name, without .mdx) to its `date` frontmatter, as "yyyy-mm-dd". */
export function articleDates(directory = "src/content/articles") {
  const dates = new Map();
  for (const file of globSync(`${directory}/*.mdx`)) {
    const frontmatter = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const date = frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (date) {
      dates.set(basename(file, ".mdx"), date);
    }
  }
  return dates;
}
