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
| `npm run deploy` | Build and deploy the site to Cloudflare (see [Deploying](#install-build-deploy)) |

Always run `npm run build` and `npm run lint` before pushing. GitHub Actions also runs both on every commit and pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)). The build fails on content problems (a misspelled frontmatter field, a badly named file, etc.), and says exactly what to fix.

**Deploying:** the site is entirely static, with nothing running on a server. It's hosted on Cloudflare as a Worker named `data` that only serves static assets (configured in [`wrangler.jsonc`](wrangler.jsonc)), so hosting it costs nothing. `npm run deploy` builds the site and uploads `dist/` with `wrangler deploy` (run `npx wrangler login` first).

**Redirects** are real HTTP 301s, listed in [`public/_redirects`](public/_redirects), which Cloudflare reads.

**Subpaths:** when `GITHUB_REPOSITORY` names a fork (e.g. a build in a fork's GitHub Actions), `astro.config.mjs` builds the site for `https://<owner>.github.io/<repo>/` instead of `data.dailycal.org`. Because the site can live under a subpath like that, every internal link and `public/` file reference must go through `withBase()` (`src/lib/path.ts`), or the `<Link>` component (`src/components/Link.jsx`) in `.mdx`/`.jsx` files. Imported images (everything in `src/assets/images/`) handle this on their own.

## Project structure

```
src/
  content/articles/   One .mdx file per article
  assets/images/      Every image, in a folder per article named after its short slug (its file
                      name without the date, e.g. nobel/), and the site's logos (site/)
  components/         Reusable components (charts, images, links, SEO)
  config/             Site-wide settings (see "Site configuration")
  layouts/            PageLayout (header/footer/<head>) and the article layouts
  lib/                Helpers: article loading/validation, withBase()
  pages/              Every page and its URL (file-based routing)
  styles/             Global and article CSS
  visuals/            Articles' visuals (React components), one folder per project (see "Visuals")
scripts/              optimize-image.mjs: the command-line image optimizer
public/               Static files served as-is: the favicon, and each article's data files and
                      standalone pages (data/<short slug>/, e.g. public/data/election-2026/)
legacy/               The old Gatsby site's leftover source, for reference (see "Visuals")
```

| URL | Page |
| :-- | :-- |
| `/` | Homepage: every article, newest first |
| `/article/<yyyy-mm-dd>-<slug>` | An article (pages have no trailing slash; `/article/<slug>/` redirects to it) |
| `/<yyyy-mm-dd>-<slug>/` | 301 redirect to `/article/<yyyy-mm-dd>-<slug>` (the old site's article URLs) |
| `/editors/image-optimization` | In-browser image optimizer for editors (hidden from search engines) |
| `/sitemap-index.xml`, `/robots.txt` | Generated at build time from `site`/`base` in `astro.config.mjs`. Don't add a `public/robots.txt` |

## Adding an article

Every article is one `.mdx` file (frontmatter + body) in `src/content/articles/`, named `<yyyy-mm-dd>-<slug>.mdx`, e.g. `src/content/articles/2026-03-03-ophdreport.mdx`:

- The date should be the article's publish date (its `date` frontmatter).
- The slug must be lowercase words and numbers joined by hyphens.
- It's served at `/article/<yyyy-mm-dd>-<slug>`, so don't rename it once it's published.

The build fails if a file name isn't in this form, listing every bad file name.

### Frontmatter

Unknown fields fail the build, so a misspelled field can't be silently ignored.

| Field | Description | Required |
| :-- | :-- | :-- |
| `date` | Publish date, `"YYYY-MM-DD"`. Determines the order on the homepage. | Yes |
| `title` | The headline. | Yes |
| `byline` | Author names, e.g. `["Jane Doe", "John Smith"]`. At least one. | Yes |
| `featuredImage` | The featured (hero) image: its path relative to the article, e.g. `"../../assets/images/my-story/cover.jpg"`. Also used on homepage cards and in social previews. | Yes |
| `featuredImageAlt` | Alt text describing the featured image, for screen readers and social previews. Defaults to `Featured image for "<title>"`, so please set it. | No |
| `description` | Short summary for search results and social previews. Defaults to `subhead`, then the start of the article's first paragraph (then the site description, for an article with no prose). | No |
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
featuredImage: "../../assets/images/my-story/cover.jpg"
featuredImageAlt: "Students walk past Sather Gate"
imageAttribution: "Jane Doe | Staff"
aboutStory: "Data for this story came from the UC Office of the President."
---

import DatawrapperChart from "../../components/DatawrapperChart.jsx";
import ArticleImage from "../../components/ArticleImage.astro";
import protest from "../../assets/images/my-story/protest.jpg";

The body is regular Markdown/MDX. Paragraphs, **bold**, _italics_ and [links](https://dailycal.org) all work.

<DatawrapperChart client:load chartId="MvImD/7/" />

<ArticleImage src={protest} alt="Students march on Sproul Plaza" caption="Students march on Sproul Plaza." attribution="Jane Doe | Staff" />
```

### Components

- **Visuals** in `src/visuals/`: see [Visuals](#visuals).
- **`<DatawrapperChart>`** (`src/components/DatawrapperChart.jsx`): embeds a Datawrapper chart by its ID, resizing to fit the chart. It needs `client:load`.
- **`<ArticleImage>`** (`src/components/ArticleImage.astro`): an image with an optional `caption` and `attribution`. Or a **group** of images side by side, sharing one caption: `<ArticleImage images={[{ src: a, alt: "..." }, { src: b, alt: "..." }]} columns={2} caption="..." />`. Groups stack into one column on phones. `src` is an imported image (see [Adding images](#adding-images)).
- **`<Link>`** (`src/components/Link.jsx`): a link that works under a fork's subpath. Use it for links to other pages on this site.

### Adding images

Every image goes in `src/assets/images/<short slug>/`, where the short slug is the article's file name without the date (e.g. `src/assets/images/my-story/` for `2026-05-01-my-story.mdx`), including images its visuals use. Images used across the site, like the logos, are in `src/assets/images/site/`. [Optimize](#optimizing-images) it first, then:

- `featuredImage` (and `secondaryFeaturedImage`) in frontmatter: its path relative to the article, `featuredImage: "../../assets/images/my-story/cover.jpg"`, and
- inline images: import the image at the top of the article, then pass it to `<ArticleImage>`, or to Astro's `<Image>` (`import { Image } from "astro:assets"`) for an image without a caption:

  ```mdx
  import protest from "../../assets/images/my-story/protest.jpg";

  <ArticleImage src={protest} alt="Students march on Sproul Plaza" />
  ```

At build time, Astro resizes each image to the sizes it's shown at and converts it to WebP (and social previews to JPEG/PNG), so readers download a fraction of the file. Optimizing images before they're committed still matters: it keeps the repository small and the build fast, since every image is processed on every build. The build fails if an article refers to an image that doesn't exist, or to a file in `public/data/` that doesn't exist.

The only images outside `src/assets/images/` are inside standalone pages and apps in `public/data/` that load them by URL at run time (the 2026 election results app and the rent-o-meter, both built elsewhere and copied in), and `public/favicon.ico`.

## Optimizing images

Source photos straight off a camera or phone are typically 10-25MB, which is a lot to store in the repository (and to process on every build) for something that renders at a few hundred pixels wide. Before committing an image, convert it to a web-optimized JPEG:

- it's scaled down so its long edge is at most 2560px (never scaled up), and
- it's compressed with mozjpeg at quality 85, keeping full-resolution color (4:4:4) so colored edges in illustrations and text stay crisp.

An image with transparent areas (e.g. a logo, map icon or cutout drawn over something) becomes a WebP instead, at the same quality with its transparency kept, since JPEG has no transparency.

Either:

- **In the browser:** open [data.dailycal.org/editors/image-optimization](https://data.dailycal.org/editors/image-optimization) (or `http://localhost:4321/editors/image-optimization` while `npm run dev` is running) and choose an image. Your browser converts it on your own machine, without uploading it anywhere. The page shows the old and new resolution and file size; switch between Original and Optimized to compare the two, then download the optimized `.jpg`. It flattens transparent areas onto white, so use the command line for images that need their transparency. Use Chrome or Safari: Firefox ignores some embedded color profiles, which shifts colors slightly. HEIC (iPhone photos) and TIFF files only open in Safari. Or,
- **On the command line:** `npm run optimize -- path/to/image.png [more images...]` converts each image to a `.jpg` (or `.webp`, if it has transparent areas) next to it, and deletes the original (add `--keep-original` to keep it). An image that's already optimized (re-encoding it would save less than 10%) is left as it is, so it's safe to run on a whole folder: `find src/assets/images -type f ! -name '*.svg' -print0 | xargs -0 npm run optimize --`.

Don't optimize SVGs: they're already small.

## Visuals

An article's interactive graphics are React components in `src/visuals/<project>/`, one folder per project, imported at the top of its `.mdx` file like any other component:

```mdx
import BikeTheftMap from "../../visuals/theft-visuals/bikeTheftMap";

<BikeTheftMap client:only="react" />
```

Astro renders components to HTML at build time and doesn't send their JavaScript to the browser unless told to. Give a visual a directive if it needs to run in the browser:

- **`client:load`**: for anything interactive (state, effects, event handlers, charts that measure the page, d3). It's rendered at build time and then made interactive as the page loads.
- **`client:only="react"`**: for visuals that can't render outside a browser at all, e.g. Leaflet maps. Rendered only in the browser.
- **No directive**: for visuals that are only HTML (an iframe, a static timeline), which then cost no JavaScript.

A few things to know when writing or porting a visual:

- **JSX goes in `.jsx`/`.tsx` files**, not `.js`.
- **Props passed to a `client:` visual must be plain data** (strings, numbers, arrays, objects): a function can't be sent to the browser.
- **An `.mdx` file can read its own frontmatter** as `props.frontmatter`, e.g. `<Story title={props.frontmatter.title} />`. `date` is `"yyyy-mm-dd"`, and the byline is also available under the old site's names, `bylineName`/`bylineUrl`.
- **Images** go in the article's `src/assets/images/<short slug>/` folder (see [Adding images](#adding-images)). A visual imports one for use as a URL (`<img src={icon} />`) with `?url`: `import icon from "../../assets/images/my-story/icon.webp?url"`. Without it, Astro imports an object with the image's details. Visuals' images are served as they are, not resized at build time, so [optimize](#optimizing-images) them.
- **Environment variables:** two AC Transit visuals read Gatsby-style `GATSBY_CARTO_KEY` (a Carto basemap key) and `GATSBY_PACK_BASE` (where its data bundle is hosted) as `process.env.*`; `astro.config.mjs` passes them in from the build's environment. Both are optional.
- **Data files and standalone pages** go in `public/data/<short slug>/`, and are referenced by their site path through `withBase()` (or `<Link>`), e.g. `fetch(withBase("/data/my-story/data.csv"))`.

### Visuals from the old Gatsby site

Until 2026 this site was built with Gatsby. Its articles' visuals were moved into `src/visuals/` with as few changes as possible, so a few pieces of compatibility infrastructure keep that code working:

- **`src/lib/compat/`**: stand-ins for APIs that no longer exist or changed, so the old code only needed its imports changed: `mui-styles.js` (Material UI's old `makeStyles`/`withStyles`) and `material-ui.jsx` (Material UI with v4's default look, for the visuals written for v4). Gatsby's `Link`/`withPrefix` became plain links and `withBase()`, and `react-helmet` became React 19's `<meta>`/`<link>` handling and `react-dom`'s `preload()`/`preinit()`.
- **`src/styles/legacy-typography.css`**: the old site's global base styles, which those visuals were designed on top of, scoped to article bodies and blank pages.
- **`src/lib/browser-only-packages.mjs`**: replaces Leaflet, react-leaflet and sigma with an inert stand-in when pages are rendered at build time, since they crash outside a browser even when only imported.
- **`src/lib/keep-d3-side-effects.mjs`**: keeps d3-transition in the bundle, so `d3.select(...).transition()` works.
- **`src/lib/unwrap-jsx-paragraphs.mjs`**: renders text inside JSX elements like `<p>...</p>` in `.mdx` the way the old site did (without wrapping it in another paragraph).
- Some charts set recharts props marked `// recharts 3: ...` where recharts 3 changed a default, so they look the same as before.
- `leaflet.heat` stays on 0.2: the Clery story map extends its 0.2 internals, and 1.0 is a rewrite.

`src/visuals/`, the old Gatsby components in `src/components/` and `src/styles/` that some visuals use (`ArticleFooter.jsx`, `ButtonList.jsx`, `customTheme.js`, `theme.js`, `button.module.css`, `darkStory.css`), and the articles themselves are excluded from formatting (see `.prettierignore` and `eslint.config.js`), so they stay as they were written.

### Old articles that only linked to dailycal.org

The old site also listed articles that were published on dailycal.org (their `oldLink` frontmatter). Those aren't hosted here, and are kept, unused, in `legacy/articles/`, with the old site's components, templates, pages and images in `legacy/` for reference. Nothing in `legacy/` is built, linted or deployed.

### Old URLs

The old site served articles at `/<file name>/` instead of `/article/<file name>`. [`public/_redirects`](public/_redirects) 301-redirects those old URLs for every article the old site hosted, so existing links to them (e.g. from dailycal.org) and search results keep working.

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
