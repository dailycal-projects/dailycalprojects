import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Articles: one .mdx file per article in a folder for its year in ./src/content/articles, named
 * `<yyyy>/<yyyy-mm-dd>-<slug>.mdx`.
 *
 * The frontmatter is validated here, so a typo'd or missing field fails the build instead of
 * shipping a broken page. The file name and folder are validated in src/lib/articles.ts.
 */
const articles = defineCollection({
  loader: glob({
    base: "./src/content/articles",
    // Every .mdx file, in any folder, so one in the wrong folder fails validation
    pattern: "**/*.mdx",
    // The id (and URL) is the file name alone, without its year folder: 2026/2026-03-03-x.mdx is
    // /article/2026-03-03-x
    generateId: ({ entry }) => entry.replace(/^.*\//, "").replace(/\.mdx$/, ""),
  }),
  // Images are paths relative to the article file, e.g. "../../../assets/images/2026/my-story/cover.jpg":
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
        aboutStory: z.string().optional(),
        jointDept: z.string().optional(),
      })
      .refine((data) => data.link !== undefined || data.byline.length > 0, {
        message: "byline needs at least one author.",
        path: ["byline"],
      }),
});

/** The longest an author's role can be, so it fits on one line of their card on /team. */
export const ROLE_MAX_LENGTH = 40;

/**
 * Authors: one .mdx file per person in ./src/content/authors, named `<firstname-lastname>.mdx`
 * after their name (e.g. "Ji Yeon Woo" is ji-yeon-woo.mdx). The body is their bio. Who's on the
 * team now is in src/config/team.json. The file name, picture and the team are validated in
 * src/lib/authors.ts.
 */
const authors = defineCollection({
  loader: glob({ base: "./src/content/authors", pattern: "*.mdx" }),
  schema: ({ image }) =>
    z.strictObject({
      // As it's written in article bylines, e.g. "Ian MacGregor"
      name: z.string().trim().min(1),
      // Shown on their card, whether they're on the team now or not, e.g. "Deputy Data Editor"
      role: z
        .string()
        .trim()
        .min(1)
        .max(
          ROLE_MAX_LENGTH,
          `role must be at most ${ROLE_MAX_LENGTH} characters, to fit on its card.`,
        ),
      // The semester they joined the Data Team, e.g. "Fall 2024"
      joined: z
        .string()
        .trim()
        .regex(/^(Spring|Summer|Fall) \d{4}$/, 'joined must be a semester, e.g. "Fall 2024".'),
      // Their picture: a square .jpg or .webp in src/assets/authors/ named after their file, e.g.
      // "../../assets/authors/ji-yeon-woo.jpg"
      image: z
        .string()
        .regex(
          /^\.\.\/\.\.\/assets\/authors\/[a-z0-9-]+\.(jpg|webp)$/,
          'image must be a .jpg or .webp in src/assets/authors/, e.g. "../../assets/authors/ji-yeon-woo.jpg".',
        )
        .pipe(image())
        .optional(),
      // Their email address, linked as "Email" after their links
      email: z.email("email must be an email address, e.g. jwoo@dailycal.org.").optional(),
      // Links shown on their page, by label, e.g. { LinkedIn: "https://www.linkedin.com/in/..." }
      links: z
        .record(
          z.string().trim().min(1),
          z.url({
            protocol: /^https?$/,
            error: "links must be http(s) URLs (put an email in email).",
          }),
        )
        .default({}),
    }),
});

export const collections = { articles, authors };
