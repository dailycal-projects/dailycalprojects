import { type CollectionEntry, getCollection } from "astro:content";

export type Article = CollectionEntry<"articles">;

// `<yyyy-mm-dd>-<slug>`: the slug is lowercase words/numbers joined by single hyphens
const FILE_NAME = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Formats dates like "March 3, 2026". UTC, because frontmatter dates are parsed as UTC midnight. */
export const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Throws if any article's file name isn't `<yyyy-mm-dd>-<slug>.mdx`. Lists every problem at once,
 * so they can all be fixed in one go.
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
  }

  if (problems.length > 0) {
    throw new Error(`Invalid article file names:\n  ${problems.join("\n  ")}`);
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

/** The site path of an article's page (pass it through withBase() before using it in a link). */
export function articlePath(article: Article): string {
  return `/article/${article.id}`;
}

/** An article's featured image alt text, falling back to a description built from its title. */
export function featuredImageAlt(article: Article): string {
  return article.data.featuredImageAlt ?? `Featured image for "${article.data.title}"`;
}
