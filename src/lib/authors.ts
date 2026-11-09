import { type CollectionEntry, getCollection } from "astro:content";
import { z } from "astro/zod";
import { site } from "../config/site";
import team from "../config/team.json";
import { type Article, getArticles } from "./articles";

type AuthorEntry = CollectionEntry<"authors">;

/** A role on the team now, from src/config/team.json, highest first. */
const TEAM_ROLES = ["editor", "deputyEditor", "reporter"] as const;
type TeamRole = (typeof TEAM_ROLES)[number];

/** The editors' roles, as shown on their cards and pages. */
export const EDITOR_ROLE_LABELS: Partial<Record<TeamRole, string>> = {
  editor: "Editor",
  deputyEditor: "Deputy Editor",
};

/** Everyone who has a file in src/content/authors/ or a byline on an article. */
export interface Author {
  /** Their name in lowercase words joined by hyphens, e.g. "ji-yeon-woo": their page's URL. */
  slug: string;
  name: string;
  /** Their src/content/authors/ file, if they have one. */
  entry?: AuthorEntry;
  /** The articles with them in the byline, newest first. */
  articles: Article[];
  /** Their role on the team now, if they're on it. */
  teamRole?: TeamRole;
}

/** Bylines that credit a group rather than a person: they don't link anywhere or get a page. */
const GROUP_BYLINES = new Set(["Daily Cal Staff", "Editorial Board"]);

/** Pages in /team/ that aren't an author's, so their names can't be an author's slug. */
const RESERVED_SLUGS = new Set(["past"]);

/** src/config/team.json: who's on the team now, by name, spelled as in their bylines. */
const TeamSchema = z.strictObject({
  editor: z.string(),
  deputyEditors: z
    .array(z.string())
    .min(1, "list 1 to 3 deputyEditors.")
    .max(3, "list 1 to 3 deputyEditors."),
  reporters: z.array(z.string()),
});

/** "Ji Yeon Woo" -> "ji-yeon-woo" (and "José" -> "jose"). */
function authorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const authorPath = (slug: string) => `/team/${slug}`;

/** Where a byline name links: the author's page, or nowhere for a group (e.g. "Editorial Board"). */
export function bylinePath(name: string): string | undefined {
  return GROUP_BYLINES.has(name) ? undefined : authorPath(authorSlug(name));
}

/** Sorts by last name (the name's last word), then by full name. */
function byLastName(a: Author, b: Author): number {
  const last = (author: Author) => author.name.split(/\s+/).at(-1) ?? "";
  return last(a).localeCompare(last(b)) || a.name.localeCompare(b.name);
}

/**
 * Their links by label: their file's `links`, their `email`, and their Daily Californian profile
 * if their links don't include one.
 */
export function authorLinks(author: Author): [label: string, url: string][] {
  const { links = {}, email } = author.entry?.data ?? {};
  const entries = Object.entries(links);
  const hasProfile = entries.some(([, url]) => /^https?:\/\/(www\.)?dailycal\.org\//.test(url));
  return [
    ...entries,
    ...(email ? [["Email", `mailto:${email}`] as [string, string]] : []),
    ...(hasProfile
      ? []
      : [["The Daily Californian", site.authorProfileUrl(author.name)] as [string, string]]),
  ];
}

/** The file an image was imported from, e.g. "/.../src/assets/authors/ji-yeon-woo.jpg". */
function imageFile(image: ImageMetadata): string {
  return (image as ImageMetadata & { fsPath?: string }).fsPath ?? image.src.split("?")[0];
}

/**
 * Every author, from the author files and the articles' bylines, validated. Throws listing every
 * problem at once:
 * - an author file isn't named after the name in it, or its picture isn't square or isn't named
 *   after it,
 * - a byline spells a name differently from another byline or the author's file (e.g. "Ian
 *   Macgregor" and "Ian MacGregor"), which would give one person two names,
 * - team.json doesn't have one editor and one to three deputy editors, lists someone twice, or
 *   spells a name differently from their bylines or author file.
 */
export async function getAuthors(): Promise<Author[]> {
  const [entries, articles] = await Promise.all([getCollection("authors"), getArticles()]);
  const problems: string[] = [];
  const authors = new Map<string, Author>();
  // Where each author's name was first spelled, for problems about spelling it differently
  const spelledIn = new Map<string, string>();

  for (const entry of entries) {
    const file = entry.filePath ?? entry.id;
    const { name, image } = entry.data;
    const slug = authorSlug(name);
    const fileName = file.replace(/^.*\//, "").replace(/\.mdx$/, "");
    if (fileName !== slug) {
      problems.push(`${file}: the file must be named after the author's name: ${slug}.mdx.`);
    }
    if (RESERVED_SLUGS.has(slug)) {
      problems.push(`${file}: /team/${slug} is already a page, so it can't be an author's.`);
    }
    if (image) {
      const imageName = imageFile(image)
        .replace(/^.*\//, "")
        .replace(/\.[^.]+$/, "");
      if (imageName !== slug) {
        problems.push(`${file}: the picture must be named after the author: ${slug}.jpg.`);
      }
      if (image.width !== image.height) {
        problems.push(
          `${file}: the picture must be square, but it's ${image.width}×${image.height}.`,
        );
      }
    }
    authors.set(slug, { slug, name, entry, articles: [] });
    spelledIn.set(slug, file);
  }

  for (const article of articles) {
    const file = article.filePath ?? article.id;
    for (const name of new Set(article.data.byline)) {
      if (GROUP_BYLINES.has(name)) {
        continue;
      }
      const slug = authorSlug(name);
      if (RESERVED_SLUGS.has(slug)) {
        problems.push(`${file}: /team/${slug} is already a page, so it can't be an author's.`);
      }
      let author = authors.get(slug);
      if (!author) {
        author = { slug, name, articles: [] };
        authors.set(slug, author);
        spelledIn.set(slug, file);
      } else if (author.name !== name) {
        problems.push(
          `${file}: the byline "${name}" is spelled differently from "${author.name}" in ${spelledIn.get(slug)}. Spell it the same way everywhere.`,
        );
      }
      author.articles.push(article);
    }
  }

  const roster = TeamSchema.safeParse(team);
  if (!roster.success) {
    problems.push(`src/config/team.json: ${z.prettifyError(roster.error).replace(/\n/g, " ")}`);
  } else {
    const { editor, deputyEditors, reporters } = roster.data;
    const byRole: [TeamRole, string[]][] = [
      ["editor", [editor]],
      ["deputyEditor", deputyEditors],
      ["reporter", reporters],
    ];
    for (const [role, names] of byRole) {
      for (const name of names) {
        const slug = authorSlug(name);
        if (RESERVED_SLUGS.has(slug)) {
          problems.push(
            `src/config/team.json: /team/${slug} is already a page, so it can't be an author's.`,
          );
        }
        // Someone with no author file or byline yet gets a page with just their name
        let author = authors.get(slug);
        if (!author) {
          author = { slug, name, articles: [] };
          authors.set(slug, author);
        }
        if (author.name !== name) {
          problems.push(
            `src/config/team.json: "${name}" is spelled differently from "${author.name}" in ${spelledIn.get(slug)}. Spell it the same way everywhere.`,
          );
        } else if (author.teamRole) {
          problems.push(`src/config/team.json: "${name}" is listed more than once.`);
        } else {
          author.teamRole = role;
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Problems with authors:\n  ${problems.join("\n  ")}`);
  }
  return [...authors.values()];
}

/**
 * The team now: the editor, then deputy editors, then reporters, each by last name, except that
 * reporters with a byline come before those without one.
 */
export function currentTeam(authors: Author[]): Author[] {
  const rank = (author: Author) => TEAM_ROLES.indexOf(author.teamRole!);
  const unpublishedReporter = (author: Author) =>
    Number(author.teamRole === "reporter" && author.articles.length === 0);
  return authors
    .filter((author) => author.teamRole)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        unpublishedReporter(a) - unpublishedReporter(b) ||
        byLastName(a, b),
    );
}

/**
 * Everyone who isn't on the team now, grouped by the year of their latest article, newest first,
 * and in each year by their latest article, newest first. Those with no articles come last, in a
 * group with no year, by last name.
 */
export function pastTeam(authors: Author[]): { year?: number; authors: Author[] }[] {
  const latest = (author: Author) => author.articles[0]?.data.date.valueOf() ?? -Infinity;
  const groups: { year?: number; authors: Author[] }[] = [];
  for (const author of authors
    .filter((author) => !author.teamRole)
    .sort((a, b) => latest(b) - latest(a) || byLastName(a, b))) {
    // In UTC, like the dates the site shows
    const year = author.articles[0]?.data.date.getUTCFullYear();
    let group = groups.at(-1);
    if (!group || group.year !== year) groups.push((group = { year, authors: [] }));
    group.authors.push(author);
  }
  return groups;
}
