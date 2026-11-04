# Daily Californian Data

Source for [data.dailycal.org](https://data.dailycal.org/): investigative stories, data analysis and graphics by The Daily Californian's Data Team.

## Install, build, deploy

**Requirements:** Node >=22.23.4.

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `http://localhost:4321` (runs in the background; stop it with `npx astro dev stop`) |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Serve the built `dist/` locally, to check the real production output |
| `npm run lint` | Check code style with ESLint and Prettier |
| `npm run lint:fix` | Fix ESLint and Prettier style errors |
| `npm run optimize -- <image> [<image> ...]` | Optimize images (see [Optimizing images](#optimizing-images)) |

Always run `npm run build` and `npm run lint` before pushing. The build fails on content problems (a misspelled frontmatter field, a badly named file, etc.), and says exactly what to fix.

**Deploying** is automatic: Netlify builds and publishes every push to `master` to data.dailycal.org, using the settings in [`netlify.toml`](netlify.toml).

**Forks** deploy to GitHub Pages for previewing changes before they're merged: in a fork, [`.github/workflows/deploy.yaml`](.github/workflows/deploy.yaml) runs on every branch, and `astro.config.mjs` builds the site for `https://<owner>.github.io/<repo>/` instead of `data.dailycal.org`. In your fork, set Settings → Pages to deploy from the `gh-pages` branch. Because the site can live under a subpath like that, every internal link and `public/` file reference must go through `withBase()` (`src/lib/path.ts`), or the `<Link>` component (`src/components/Link.jsx`) in `.mdx`/`.jsx` files. Images imported through `astro:assets` handle this on their own.

## Project structure

```
src/
  content/articles/   One .mdx file per article
  assets/images/      Article images (featured and inline)
  assets/site/        Site logos
  components/         Reusable components (charts, images, links, SEO)
  config/             Site-wide settings (see "Site configuration")
  layouts/            PageLayout (header/footer/<head>) and the article layouts
  lib/                Helpers: article loading/validation, withBase()
  pages/              Every page and its URL (file-based routing)
  styles/             Global and article CSS
  visuals/            Articles' visuals (React components), one folder per project
scripts/optimize.ts   Command-line image optimizer
public/               Static files served as-is: the favicon, and standalone interactives
                      (e.g. public/election-2026/ is served at /election-2026/)
legacy/               The old Gatsby site's source, for articles not yet ported (see below)
```

| URL | Page |
| :-- | :-- |
| `/` | Homepage: every article, newest first |
| `/article/<yyyy-mm-dd>-<slug>/` | An article |
| `/<yyyy-mm-dd>-<slug>/` | Redirects to `/article/<yyyy-mm-dd>-<slug>/` (the old site's article URLs) |
| `/editors/image-optimization/` | In-browser image optimizer for editors (hidden from search engines) |
| `/sitemap-index.xml`, `/robots.txt` | Generated at build time from `site`/`base` in `astro.config.mjs`. Don't add a `public/robots.txt` |

## Adding an article

Every article is one `.mdx` file (frontmatter + body) in `src/content/articles/`, named `<yyyy-mm-dd>-<slug>.mdx`, e.g. `src/content/articles/2026-03-03-ophdreport.mdx`:

- The date should be the article's publish date (its `date` frontmatter).
- The slug must be lowercase words and numbers joined by hyphens.
- It's served at `/article/<yyyy-mm-dd>-<slug>/`, so don't rename it once it's published.

The build fails if a file name isn't in this form, listing every bad file name.

### Frontmatter

Unknown fields fail the build, so a misspelled field can't be silently ignored.

| Field | Description | Required |
| :-- | :-- | :-- |
| `date` | Publish date, `"YYYY-MM-DD"`. Determines the order on the homepage. | Yes |
| `title` | The headline. | Yes |
| `byline` | Author names, e.g. `["Jane Doe", "John Smith"]`. At least one. | Yes |
| `featuredImage` | The featured (hero) image: a path relative to the `.mdx` file, e.g. `"../../assets/images/my-story.jpg"`. Also used on homepage cards and in social previews. | Yes |
| `featuredImageAlt` | Alt text describing the featured image, for screen readers and social previews. Defaults to `Featured image for "<title>"`, so please set it. | No |
| `description` | Short summary for search results and social previews. Defaults to `subhead`, then the site description. | No |
| `keywords` | `["keyword one", "keyword two"]`. Populates `<meta name="keywords">`. | No |
| `layout` | `true` (the default) renders the article in the [article layout](#layouts). `false` renders the article's body alone as the whole page, for an article that's one full-page visual. | No |

These are only used by the article layout (`layout: true`):

| Field | Description |
| :-- | :-- |
| `subhead` | A short subheading under the title. |
| `imageAttribution` | Credit for the featured image, e.g. `"Jane Doe \| Staff"`. |
| `hideHeroImage` | `true` hides the featured image on the article page itself (it still shows on cards and in social previews). Use this when the body opens with its own image or graphic. Default `false`. |
| `secondaryFeaturedImage` | An image to show at the top of the article page instead of `featuredImage` (which is still used for cards and social previews). |
| `imageCaption` | Caption shown under the featured image. |
| `bylineLinks` | One URL per `byline` name, in the same order. Use `""` for an author who should link to their Daily Cal profile (the default for everyone when this is left out). Must be the same length as `byline`, or the build fails. |
| `aboutStory` | Extra text for the "About this Story" box at the end, e.g. where the data came from. |
| `jointDept` | Another department's name, e.g. `"News"`, for an article made jointly with the Data Department. |

### Example

```mdx
---
date: "2026-05-01"
title: "My Headline"
subhead: "A short dek explaining the piece"
description: "One or two sentences for search results and social previews."
byline: ["Jane Doe", "John Smith"]
bylineLinks: ["", "https://example.com/john"]
featuredImage: "../../assets/images/2026-05-01-my-story/cover.jpg"
featuredImageAlt: "Students walk past Sather Gate"
imageAttribution: "Jane Doe | Staff"
aboutStory: "Data for this story came from the UC Office of the President."
---

import DatawrapperChart from "../../components/DatawrapperChart.jsx";
import ArticleImage from "../../components/ArticleImage.astro";
import protest from "../../assets/images/2026-05-01-my-story/protest.jpg";

The body is regular Markdown/MDX. Paragraphs, **bold**, _italics_ and [links](https://dailycal.org) all work.

<DatawrapperChart client:load chartId="MvImD/7/" />

<ArticleImage src={protest} alt="Students march on Sproul Plaza" caption="Students march on Sproul Plaza." attribution="Jane Doe | Staff" />
```

### Components

- **`<DatawrapperChart>`** (`src/components/DatawrapperChart.jsx`): embeds a Datawrapper chart by its ID, resizing to fit the chart. It needs `client:load`.
- **`<ArticleImage>`** (`src/components/ArticleImage.astro`): an image with an optional `caption` and `attribution`. Or a **group** of images side by side, sharing one caption: `<ArticleImage images={[{ src: a, alt: "..." }, { src: b, alt: "..." }]} columns={2} caption="..." />`. Groups stack into one column on phones. `src` can be an imported image (recommended, since Astro resizes it for each screen) or an external URL.
- **`<Link>`** (`src/components/Link.jsx`): a link that works under a fork's subpath. Use it for links to other pages on this site.

### Adding images

Put an article's images in `src/assets/images/` (in a folder named after the article if it has several, e.g. `src/assets/images/2026-05-01-my-story/`), [optimize](#optimizing-images) them first, and reference them by a path relative to the `.mdx` file:

- `featuredImage` as a plain string in frontmatter: `featuredImage: "../../assets/images/2026-05-01-my-story/cover.jpg"`, and
- inline images with an `import` at the top of the `.mdx` file, passed to `<ArticleImage src={...} />`.

Astro builds resized WebP versions of these for each screen size, so the original is only stored in the repository.

## Optimizing images

Source photos straight off a camera or phone are typically 10-25MB, which is a lot to store in the repository for something that renders at a few hundred pixels wide. Before committing an image, convert it to a web-optimized JPEG:

- it's scaled down so its long edge is at most 2560px (never scaled up),
- any transparent areas are flattened onto white, since JPEG has no transparency, and
- it's compressed with mozjpeg at quality 85, keeping full-resolution color (4:4:4) so colored edges in illustrations and text stay crisp.

Either:

- **In the browser:** open [data.dailycal.org/editors/image-optimization](https://data.dailycal.org/editors/image-optimization/) (or `http://localhost:4321/editors/image-optimization/` while `npm run dev` is running) and choose an image. Your browser converts it on your own machine, without uploading it anywhere. The page shows the old and new resolution and file size; switch between Original and Optimized to compare the two, then download the optimized `.jpg`. Use Chrome or Safari: Firefox ignores some embedded color profiles, which shifts colors slightly. HEIC (iPhone photos) and TIFF files only open in Safari. Or,
- **On the command line:** `npm run optimize -- path/to/image.png [more images...]` converts each image to a `.jpg` next to it with the same settings, and deletes the original (add `--keep-original` to keep it).

Don't optimize SVGs (they're already small), or images that need their transparency (e.g. a logo or map icon drawn over something that isn't white): keep those as PNGs.

## Legacy articles

Until 2026 this site was built with Gatsby. Its source is kept in `legacy/` (with the same layout it had under `src/`, so the relative imports between its folders still read correctly) until every article is ported to the new site. Nothing in `legacy/` is built, linted or deployed: an article only appears on the site once it's in `src/content/articles/`.

To port an article, e.g. `legacy/articles/2025-06-18-campus-busyness.mdx`:

1. Move it with `git mv legacy/articles/<file>.mdx src/content/articles/<file>.mdx`, so git keeps its history.
2. Convert its frontmatter to the [new fields](#frontmatter): `bylineName` becomes `byline`, `bylineUrl` becomes `bylineLinks`, and Gatsby-only fields like `noTemplate` are removed. Run `npm run build` to see what's left to fix.
3. [Optimize](#optimizing-images) its images into `src/assets/images/`, and delete the originals from `legacy/images/` once no other legacy article uses them.
4. Rewrite any visuals it imports from `legacy/visuals/` as components in `src/components/` (Datawrapper charts can use `<DatawrapperChart>`), or as a standalone page in `public/`.

The old site served articles at `/<file name>/` instead of `/article/<file name>/`. [`src/pages/[legacySlug].astro`](src/pages/[legacySlug].astro) redirects those old URLs for every article in `src/content/articles/`, so existing links to a ported article (e.g. from dailycal.org) keep working.

## Layouts

An article's `layout` frontmatter picks how it's rendered:

- **`layout: true`** (the default): [`src/layouts/ArticleLayout.astro`](src/layouts/ArticleLayout.astro), the site header and footer around the title, date, hero image, byline, body and "About this Story" box.
- **`layout: false`**: [`src/layouts/BlankArticleLayout.astro`](src/layouts/BlankArticleLayout.astro), the article's body alone as the whole page (with the article's SEO tags, but no header, title, byline or footer). The page itself doesn't scroll and the body fills the window, so the visual handles its own layout and scrolling. The body is usually just one component:

  ```mdx
  ---
  title: "See how AC Transit ridership recovered from the pandemic"
  layout: false
  # ...the other required fields
  ---

  import AcTransitStory from "../../visuals/ac-transit-visuals/AcTransitStory";

  <AcTransitStory client:load />
  ```

## Site configuration (`src/config/`)

- **`site.ts`**: the site name, default description, contact email, GitHub/donate links, and where author bylines link by default.

## Other configuration

- **Footer links** are the `footerLinks` array in `src/layouts/PageLayout.astro`.
- **SEO** (title, description, canonical URL, Open Graph/X cards, JSON-LD) is rendered by `src/components/Seo.astro` from the props each page passes to `PageLayout`. The default social image is the Daily Cal logo; articles use their featured image.
- **Colors and fonts** are CSS variables in `src/styles/global.css`.

## Contact

The Data Department can be contacted at [projects@dailycal.org](mailto:projects@dailycal.org).
