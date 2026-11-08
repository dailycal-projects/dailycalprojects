import { existsSync } from "node:fs";
import { type CollectionEntry, getCollection } from "astro:content";
import { articleText } from "./search-text";

export type Article = CollectionEntry<"articles">;

// `<yyyy-mm-dd>-<slug>`: the slug is lowercase words/numbers joined by single hyphens
const FILE_NAME = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Links to files and pages on this site that validate() checks: /data/, /interactive/ or /assets/
const LOCAL = String.raw`\/(?:assets|data|interactive)\/`;
const LOCAL_LINK = new RegExp(`^${LOCAL}`);
const LOCAL_IN_BODY = new RegExp(String.raw`["'(](${LOCAL}[^"')\s?#]+)`, "g");

/** Formats dates like "March 3, 2026". UTC, because frontmatter dates are parsed as UTC midnight. */
export const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Throws if any article's file name isn't `<yyyy-mm-dd>-<slug>.mdx` in a folder for its year (e.g.
 * 2026/2026-03-03-my-story.mdx), or it links to a data file or interactive that doesn't exist. (Images are checked by the content schema's image().) Lists every
 * problem at once, so they can all be fixed in one go.
 *
 * The file name's date is normally the publish date, but it isn't checked against `date`: some
 * older articles were renamed or republished after their file (and so their URL) was created.
 */
function validate(articles: Article[]): void {
  const problems: string[] = [];

  for (const article of articles) {
    const file = article.filePath ?? article.id;
    const name = file.replace(/^.*\//, "").replace(/\.mdx$/, "");
    if (!FILE_NAME.test(name)) {
      problems.push(
        `${file}: the file name must be <yyyy-mm-dd>-<slug>.mdx, with a lowercase, hyphenated slug (e.g. 2026-03-03-my-story.mdx).`,
      );
    }
    const folder = file.match(/([^/]+)\/[^/]+$/)?.[1];
    const year = name.slice(0, 4);
    if (FILE_NAME.test(name) && folder !== year) {
      problems.push(`${file}: the file must be in the folder for its year: articles/${year}/.`);
    }

    // Paths the article's body or link uses: /data/ files, /interactive/ pages (and /assets/ paths,
    // which were images before they moved to src/assets/images/, so a leftover one fails the build)
    const { link } = article.data;
    const paths = [
      ...(article.body ?? "").matchAll(LOCAL_IN_BODY).map((m) => m[1]),
      ...(link && LOCAL_LINK.test(link) ? [link] : []),
    ];
    for (const path of paths) {
      // In public/ (pages are served without .html, and folders by their index.html), or an
      // interactive's Astro page in src/pages/
      const p = decodeURI(path);
      const files = [
        `public${p}`,
        `public${p}.html`,
        `public${p}/index.html`,
        `src/pages${p}.astro`,
      ];
      if (!files.some((f) => existsSync(f))) {
        problems.push(`${file}: ${path} doesn't exist in public/ or src/pages/.`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Problems with articles:\n  ${problems.join("\n  ")}`);
  }
}

/** Every article, validated and sorted newest first. Use this instead of getCollection(). */
export async function getArticles(): Promise<Article[]> {
  const articles = await getCollection("articles");
  validate(articles);
  return articles.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
  );
}

/** Where an article's card links: its own page, or its `link` if it has one. */
export function articlePath(article: Article): string {
  return article.data.link ?? `/article/${article.id}`;
}

/** What src/components/Head.astro needs for an article's page. */
export interface ArticleHead {
  headline: string;
  description: string | undefined;
  image: ImageMetadata;
  imageAlt: string;
  date: Date;
  byline: string[];
  keywords: string[] | undefined;
}

export function articleHead(article: Article): ArticleHead {
  const { title, featuredImage, date, byline, keywords } = article.data;
  return {
    headline: title,
    description: articleDescription(article),
    image: featuredImage,
    imageAlt: featuredImageAlt(article),
    date,
    byline,
    keywords,
  };
}

/** An article's featured image alt text, falling back to a description built from its title. */
export function featuredImageAlt(article: Article): string {
  return article.data.featuredImageAlt ?? `Featured image for "${article.data.title}"`;
}

// Search results show about 155-160 characters of a description
const DESCRIPTION_LENGTH = 160;

/**
 * An article's description for search results and social previews: its `description`, or its
 * subhead, or else the start of its first paragraph.
 */
function articleDescription(article: Article): string | undefined {
  const { description, subhead } = article.data;
  if (description?.trim()) {
    return description.trim();
  }
  if (subhead?.trim()) {
    return subhead.trim();
  }

  // The first paragraph of prose, skipping notes and short lines like credits
  const paragraph = articleText(article.body ?? "").find(
    (block) => !block.heading && !block.note && block.text.length >= 40,
  )?.text;
  if (!paragraph || paragraph.length <= DESCRIPTION_LENGTH) {
    return paragraph;
  }
  // Cut at a word boundary; end with an ellipsis unless that's the end of a sentence
  const cut = paragraph.slice(0, DESCRIPTION_LENGTH - 1);
  const words = cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "");
  return /[.!?]["”’]?$/.test(words) ? words : `${words}…`;
}
