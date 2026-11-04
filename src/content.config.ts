import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// An image in public/ by its site path (e.g. "/assets/images/my-story.jpg"), or a full URL.
// src/lib/articles.ts checks that public/ files exist.
const imagePath = z.union([
  z.string().regex(/^\/(?!\/)/, 'must be a path starting with "/", e.g. "/assets/images/x.jpg"'),
  z.url(),
]);

/**
 * Articles: one .mdx file per article in ./src/content/articles, named `<yyyy-mm-dd>-<slug>.mdx`.
 *
 * The frontmatter is validated here, so a typo'd or missing field fails the build instead of
 * shipping a broken page. The file name is validated in src/lib/articles.ts.
 */
const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "*.mdx" }),
  schema: z
    // strictObject: an unknown (e.g. misspelled) frontmatter key fails the build
    .strictObject({
      date: z.coerce.date(),
      title: z.string().trim().min(1),
      byline: z.array(z.string().trim().min(1)).min(1, "byline needs at least one author."),
      featuredImage: imagePath,
      featuredImageAlt: z.string().trim().min(1).optional(),
      imageAttribution: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      // false renders the article's body alone as the whole page, with no header, title,
      // byline or footer (for articles that are one full-page visual)
      layout: z.boolean().default(true),

      // Only used by the article layout (layout: true)
      subhead: z.string().optional(),
      hideHeroImage: z.boolean().default(false),
      // Shown as the article page's hero image instead of featuredImage, which is still used
      // for cards and social previews
      secondaryFeaturedImage: imagePath.optional(),
      imageCaption: z.string().optional(),
      bylineLinks: z.array(z.string()).default([]),
      aboutStory: z.string().optional(),
      jointDept: z.string().optional(),
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
