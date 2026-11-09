/**
 * Every article as a search record, for src/lib/search-index.mjs, which builds the search index from
 * this file after the build and then deletes it (so it's never deployed). Its images are the
 * homepage card's size and crop (see src/components/ArticleCard.astro), so search results can show
 * them.
 */
import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import { articlePath, dateFormat, featuredImageAlt, getArticles } from "../lib/articles";
import { articleText, type TextBlock } from "../lib/search-text";

interface SearchRecord {
  /** Where the result links: a path on this site, or a URL on another site. */
  href: string;
  title: string;
  /** e.g. "March 3, 2026" */
  date: string;
  image: string;
  imageSrcset: string;
  imageAlt: string;
  /** "Name, Name" */
  byline: string;
  /** Short text searched before the body: subhead, description, keywords. */
  about: string[];
  /** The article's prose. Empty for an article with a link, whose text is elsewhere. */
  body: TextBlock[];
}

export const GET: APIRoute = async () => {
  const records: SearchRecord[] = await Promise.all(
    (await getArticles()).map(async (article) => {
      const { title, date, featuredImage, subhead, description, byline, keywords, link } =
        article.data;
      const image = await getImage({
        src: featuredImage,
        width: 450,
        height: 250,
        fit: "cover",
        position: "attention",
        densities: [1, 2],
      });
      return {
        href: articlePath(article),
        title,
        date: dateFormat.format(date),
        image: image.src,
        imageSrcset: image.srcSet.attribute,
        imageAlt: featuredImageAlt(article),
        byline: byline.join(", "),
        about: [subhead, description, keywords?.join(", ")].filter(
          (text): text is string => !!text?.trim(),
        ),
        body: link ? [] : articleText(article.body ?? ""),
      };
    }),
  );
  return new Response(JSON.stringify(records), {
    headers: { "Content-Type": "application/json" },
  });
};
