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

**Previews:** every pull request from a branch in this repository gets its own copy of the site at `https://pr<number>.datadev.dailycal.org` (e.g. `pr131.datadev.dailycal.org`), updated on every push and deleted when the pull request is closed or merged ([`.github/workflows/preview.yml`](.github/workflows/preview.yml)). The workflow comments the address on the pull request. Previews are [Cloudflare Workers Previews](https://developers.cloudflare.com/workers/previews/) of the `data` Worker, so they're served exactly like the real site, redirects included, but kept out of search engines. Pull requests from forks aren't previewed, since GitHub doesn't give them the repository's secrets; push the branch to this repository instead. To preview a branch from your own machine: `npm run build && npx wrangler preview --name <name>`, which serves it at `https://<name>.datadev.dailycal.org`.

Previews need a one-time setup: in Cloudflare, the `data` Worker's **Domains** tab has the custom domain `datadev.dailycal.org`, enabled for **Preview** only; and the GitHub repository has the secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (an API token that can edit Workers Scripts).

The site is always served from the root of its domain, so internal links are plain paths like `/article/...`.

## Project structure

```
src/
  content/articles/   One .mdx file per article
  assets/images/      Every article's images, in a folder per article named after its short slug
                      (its file name without the date, e.g. nobel/)
  assets/site/        Images that aren't an article's: the logos, and /apply's puzzle hint
  components/         Reusable components (charts, images, links, SEO)
  config/             Site-wide settings (see "Site configuration")
  layouts/            PageLayout (header/footer/<head>) and the article layouts
  lib/                Helpers: article loading/validation, the search index, build plugins
  pages/              Every page and its URL (file-based routing); pages/interactive/ holds the
                      interactives built here (see "Interactives")
  styles/             Global and article CSS
  visuals/            Articles' visuals (React components), one folder per project (see "Visuals")
scripts/              optimize-image.mjs: the command-line image optimizer
public/               Static files served as-is: the favicon, fonts, the data files visuals fetch
                      (data/<short slug>/) and interactives built elsewhere (interactive/<name>/)
```

| URL | Page |
| :-- | :-- |
| `/` | Homepage: every article, newest first |
| `/article/<yyyy-mm-dd>-<slug>` | An article (pages have no trailing slash; `/article/<slug>/` redirects to it) |
| `/<yyyy-mm-dd>-<slug>/` | 301 redirect to `/article/<yyyy-mm-dd>-<slug>` (the old site's article URLs) |
| `/interactive/<name>` | An interactive on a page of its own (see "Interactives") |
| `/search?q=<query>` | Search (see "Search") |
| `/apply` | Where the Data Department's recruiting flyer points: the application, and a form for the flyer's puzzle (hidden from search engines) |
| `/editors/image-optimization` | In-browser image optimizer for editors (hidden from search engines) |
| `/sitemap-index.xml`, `/robots.txt` | Generated at build time from `site` in `astro.config.mjs`. Don't add a `public/robots.txt` |

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
| `byline` | Author names, e.g. `["Jane Doe", "John Smith"]`. At least one. | Yes, unless the article has a `link` |
| `featuredImage` | The featured (hero) image: its path relative to the article, e.g. `"../../assets/images/my-story/cover.jpg"`. Also used on homepage cards and in social previews. | Yes |
| `featuredImageAlt` | Alt text describing the featured image, for screen readers and social previews. Defaults to `Featured image for "<title>"`, so please set it. | No |
| `description` | Short summary for search engines' results and social previews, also searched by the site's own search. Defaults to `subhead`, then the start of the article's first paragraph (then the site description, for an article with no prose). | No |
| `keywords` | `["keyword one", "keyword two"]`. Populates `<meta name="keywords">`, and is searched by the site's search. | No |
| `layout` | `true` (the default) renders the article in the [article layout](#layouts). `false` renders the article's body alone as the whole page, for an article that's one full-page visual. | No |
| `link` | Where the article's homepage card goes instead of its own page: an [interactive](#interactives) (e.g. `"/interactive/election-2026/index.html"`, which must exist or the build fails; link a folder by its `index.html`, since the dev server doesn't serve folders) or a URL on another site. An article with a `link` gets no page of its own, so it needs only `date`, `title` and `featuredImage`, and its body isn't shown. | No |

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

### Adding images

Every image goes in `src/assets/images/<short slug>/`, where the short slug is the article's file name without the date (e.g. `src/assets/images/my-story/` for `2026-05-01-my-story.mdx`), including images its visuals use. Images that aren't an article's, like the logos, are in `src/assets/site/`. [Optimize](#optimizing-images) it first, then:

- `featuredImage` (and `secondaryFeaturedImage`) in frontmatter: its path relative to the article, `featuredImage: "../../assets/images/my-story/cover.jpg"`, and
- inline images: import the image at the top of the article, then pass it to `<ArticleImage>`, or to Astro's `<Image>` (`import { Image } from "astro:assets"`) for an image without a caption:

  ```mdx
  import protest from "../../assets/images/my-story/protest.jpg";

  <ArticleImage src={protest} alt="Students march on Sproul Plaza" />
  ```

At build time, Astro resizes each image to the sizes it's shown at and converts it to WebP (and social previews to JPEG/PNG), so readers download a fraction of the file. Optimizing images before they're committed still matters: it keeps the repository small and the build fast, since every image is processed on every build. The build fails if an article refers to an image that doesn't exist, or links to a file in `public/data/` or an interactive that doesn't exist.

The only images outside `src/assets/` are the ones apps built elsewhere load by URL at run time (the 2026 election results in `public/interactive/` and the rent-o-meter's in `public/data/`), and `public/favicon.ico`.

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
- **Data files** a visual imports go next to it, e.g. `import data from "./data/data.csv?url"` (Vite fingerprints them, so browsers can cache them for good). Data an app fetches by URL at run time goes in `public/data/<short slug>/`, referenced by its site path, e.g. `fetch("/data/my-story/data.csv")`.

### A visual's story text goes in the `.mdx`

Write a story's text in its `.mdx` and have the visual place it, instead of writing it in the component, so [search](#search) can find it and editors can edit it without touching code. Pass each piece as a named slot:

```mdx
<CandidateFinanceVisuals client:load>
<Fragment slot="intro">

First paragraph, in Markdown.

Second paragraph.

</Fragment>
<Fragment slot="end">Text on one line, with no paragraph around it.</Fragment>
</CandidateFinanceVisuals>
```

The component gets each slot as a prop of the same name (here `intro` and `end`), already rendered to HTML, and puts it where the text goes: `<div className="story-prose">{intro}</div>`. It can't change the HTML, so style the paragraphs with CSS (`.story-prose p { ... }`). Leave the blank lines inside a `<Fragment>` around paragraphs, or they won't become paragraphs. Shiny-hunters, candidate and AC Transit work this way (AC Transit numbers its passages `step1` to `step25`, and `steps.js` names each one's slot).

### Interactives

An interactive that needs a page of its own, instead of a spot in an article, lives at `/interactive/<name>`. There are two kinds:

- **Built here:** the code goes in `src/visuals/<project>/` like any visual, and `src/pages/interactive/<name>.astro` is a few lines that render it, only there to give it its URL (e.g. `src/pages/interactive/gghenge.astro`). Vite bundles and minifies it with the rest of the site.
- **Built elsewhere:** an app with its own repository and build (e.g. the 2026 election results, from election-night-tracker) is copied in, as built, to `public/interactive/<name>/`, and served as it is. Copy in a new build to update it; don't edit the files here.

An article can link to an interactive from its body (`[Check out the interactive map](/interactive/gghenge)`), or be nothing but a homepage card for it, with `link` set to its URL (see [Frontmatter](#frontmatter)). Either way, the build fails if the interactive doesn't exist.

### Visuals from the old Gatsby site

Until 2026 this site was built with Gatsby. Its articles' visuals were moved into `src/visuals/` with as few changes as possible, so a few pieces of compatibility infrastructure keep that code working:

- **`src/lib/compat/`**: stand-ins for APIs that no longer exist or changed, so the old code only needed its imports changed: `mui-styles.js` (Material UI's old `makeStyles`/`withStyles`) and `material-ui.jsx` (Material UI with v4's default look, for the visuals written for v4). Gatsby's `Link`/`withPrefix` became plain links, and `react-helmet` became React 19's `<meta>`/`<link>` handling and `react-dom`'s `preload()`/`preinit()`.
- **`src/styles/legacy-typography.css`**: the old site's global base styles, which those visuals were designed on top of, scoped to article bodies and blank pages.
- **`src/lib/browser-only-packages.mjs`**: replaces Leaflet, react-leaflet and sigma with an inert stand-in when pages are rendered at build time, since they crash outside a browser even when only imported.
- **`src/lib/keep-d3-side-effects.mjs`**: keeps d3-transition in the bundle, so `d3.select(...).transition()` works.
- **`src/lib/unwrap-jsx-paragraphs.mjs`**: renders text inside JSX elements like `<p>...</p>` in `.mdx` the way the old site did (without wrapping it in another paragraph).
- Some charts set recharts props marked `// recharts 3: ...` where recharts 3 changed a default, so they look the same as before.
- `leaflet.heat` stays on 0.2: the Clery story map extends its 0.2 internals, and 1.0 is a rewrite.

`src/visuals/`, the old Gatsby components in `src/components/` and `src/styles/` that some visuals use (`ArticleFooter.jsx`, `ButtonList.jsx`, `customTheme.js`, `theme.js`, `button.module.css`, `darkStory.css`), and the articles themselves are excluded from formatting (see `.prettierignore` and `eslint.config.js`), so they stay as they were written.

### Old articles hosted on projects.dailycal.org

The old site also listed articles that were hosted elsewhere (their `oldLink` frontmatter). Those 30 now live on [projects.dailycal.org](https://projects.dailycal.org), each at `/<its file name>/`, and their articles here are only homepage cards: each one's `link` goes there.

### Old URLs

The old site served articles at `/<file name>/` instead of `/article/<file name>`. [`public/_redirects`](public/_redirects) 301-redirects those old URLs for every article the old site hosted, so existing links to them (e.g. from dailycal.org) and search results keep working.

## Search

`/search?q=<query>` searches every article's title, byline, subhead, `description`, `keywords` and text, in the browser, with [Pagefind](https://pagefind.app). `npm run build` builds the index into `dist/pagefind/` at the end (`src/lib/search-index.mjs`), so search only works in the built site: in `npm run dev` the page says so. To try it, run `npm run build` and then `npx wrangler dev`.

- **An article's text is what's written in its `.mdx`** (`src/lib/search-text.ts`): paragraphs, headings, lists and tables, including inside HTML elements and components (a scrollytelling component's steps). It never comes from the built page, so text that visuals draw (chart axes, legends, tooltips) isn't searched. Text written inside a visual's component isn't searched, so [write a visual's story text in the `.mdx`](#a-visuals-story-text-goes-in-the-mdx). An article with no text of its own, like a tool or an interactive's card, is found by its title, byline, `subhead`, `description` and `keywords`.
- **The 30 articles hosted on projects.dailycal.org** get their text from that site's search index (`https://projects.dailycal.org/search-index.json`), downloaded during the build, and each is one result that links there. If it can't be downloaded, the build warns and they're searched by title, subhead and byline only.

## Analytics

Every page loads Google Tag Manager (container `GTM-W9R66S6S`), which loads Google Analytics; set up what's tracked in Tag Manager, not here. `npm run build` adds the loader to the top of each page's `<head>` once the site is built (`src/lib/analytics.mjs`), so it's in every page however its `<head>` is written, including interactives copied in prebuilt, and no layout or component needs it. It only runs on `data.dailycal.org`, so pull request previews, `npx wrangler dev` and `npm run dev` don't count as visits. It leaves out `/editors/` and the election results' Instagram Live loop (`EXCLUDE` in that file).

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
