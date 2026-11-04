import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { templateNames } from "./config/templates";

/**
 * Articles: one .mdx file per article in ./src/content/articles, named `<yyyy-mm-dd>-<slug>.mdx`.
 *
 * The frontmatter is validated here, so a typo'd or missing field fails the build instead of
 * shipping a broken page. The file name is validated against `date` in src/lib/articles.ts.
 */
const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "*.mdx" }),
  schema: ({ image }) =>
    z
      // strictObject: an unknown (e.g. misspelled) frontmatter key fails the build
      .strictObject({
        date: z.coerce.date(),
        title: z.string().trim().min(1),
        byline: z.array(z.string().trim().min(1)).min(1, "byline needs at least one author."),
        featuredImage: image(),
        featuredImageAlt: z.string().trim().min(1).optional(),
        imageAttribution: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        template: z.enum(templateNames).default("default"),

        // Specific to the default template
        subhead: z.string().optional(),
        hideHeroImage: z.boolean().default(false),
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
