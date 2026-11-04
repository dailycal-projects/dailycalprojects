/**
 * Matches URLs that must never be prefixed with the site's base: anything with a scheme
 * ("https:", "mailto:", "tel:", ...), protocol-relative URLs ("//cdn.example.com") and in-page
 * anchors ("#section").
 */
const EXTERNAL_OR_SPECIAL = /^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i;

/** Returns true if a URL points off-site (or is an in-page anchor), so it shouldn't get the base. */
export function isExternal(url: string): boolean {
  return EXTERNAL_OR_SPECIAL.test(url);
}

/**
 * Prefix a root-absolute site path with the configured `base` (`import.meta.env.BASE_URL`), e.g.
 * "/article/x" -> "/dailycal-data/article/x/" when built in a fork deployed to GitHub Pages.
 *
 * Astro rewrites bundled asset URLs (`astro:assets` images, `_astro/` files) automatically, but not
 * `<a href>` targets or `public/` files referenced by an absolute path, so every internal link and
 * `public/` reference must go through this helper.
 *
 * - External URLs, `mailto:`/`tel:` links and `#anchors` are returned unchanged.
 * - Page paths (no file extension) get a trailing slash, since pages are built as
 *   `<path>/index.html` and GitHub Pages would otherwise answer every link to them with a redirect
 *   to the slashed URL first. File paths (e.g. "/favicon.ico") are left alone.
 */
export function withBase(path = "/"): string {
  if (isExternal(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;

  // Split off any ?query or #hash so the trailing slash goes before it
  const split = suffix.search(/[?#]/);
  let pathname = split === -1 ? suffix : suffix.slice(0, split);
  const rest = split === -1 ? "" : suffix.slice(split);

  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (lastSegment && !lastSegment.includes(".")) {
    pathname += "/";
  }

  return `${base}${pathname}${rest}`;
}
