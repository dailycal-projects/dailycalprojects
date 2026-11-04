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
 * "/article/x" -> "/dailycal-data/article/x" when built for a fork under a subpath.
 *
 * Astro rewrites bundled asset URLs (`_astro/` files) automatically, but not `<a href>` targets or
 * `public/` files referenced by an absolute path, so every internal link and `public/` reference
 * must go through this helper. External URLs, `mailto:`/`tel:` links and `#anchors` are returned
 * unchanged.
 *
 * Pages have no trailing slash (/article/x, built as article/x.html). A folder in `public/` with
 * its own index.html is linked with one (/data/<slug>/), which its relative links need.
 */
export function withBase(path = "/"): string {
  if (isExternal(path)) {
    return path;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
