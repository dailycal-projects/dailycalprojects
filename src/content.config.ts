import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Articles: one .mdx file per article in ./src/content/articles, named `<yyyy-mm-dd>-<slug>.mdx`.
 *
 * The frontmatter is validated here, so a typo'd or missing field fails the build instead of
 * shipping a broken page. The file name is validated in src/lib/articles.ts.
 */
const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "*.mdx" }),
  // Images are paths relative to the article file, e.g. "../../assets/images/my-story.jpg":
  // image() fails the build if the file doesn't exist, and optimizes it at build time
  schema: ({ image }) =>
    z
      // strictObject: an unknown (e.g. misspelled) frontmatter key fails the build
      .strictObject({
        date: z.coerce.date(),
        title: z.string().trim().min(1),
        // Required unless the article has a link (checked below)
        byline: z.array(z.string().trim().min(1)).default([]),
        featuredImage: image(),
        featuredImageAlt: z.string().trim().min(1).optional(),
        imageAttribution: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        // false renders the article's body alone as the whole page, with no header, title,
        // byline or footer (for articles that are one full-page visual)
        layout: z.boolean().default(true),
        // Where the article's homepage card goes instead of its own page: an interactive (e.g.
        // "/interactive/election-2026/index.html") or a URL on another site. An article with a link gets no
        // page of its own, so its body isn't shown; the old site's oldLink.
        link: z.string().trim().min(1).optional(),

        // Only used by the article layout (layout: true)
        subhead: z.string().optional(),
        hideHeroImage: z.boolean().default(false),
        // Shown as the article page's hero image instead of featuredImage, which is still used
        // for cards and social previews
        secondaryFeaturedImage: image().optional(),
        imageCaption: z.string().optional(),
        bylineLinks: z.array(z.string()).default([]),
        aboutStory: z.string().optional(),
        jointDept: z.string().optional(),
      })
      .refine((data) => data.link !== undefined || data.byline.length > 0, {
        message: "byline needs at least one author.",
        path: ["byline"],
      })
      .refine(
        (data) => data.bylineLinks.length === 0 || data.bylineLinks.length === data.byline.length,
        {
          message:
            'bylineLinks must have one entry per byline name (use "" for an author with no custom link), or be left out.',
          path: ["bylineLinks"],
        },
      ),
});

export const collections = { articles };
