import { withBase } from "../lib/path";

/**
 * A wrapper of the HTML <a> tag that runs `href` through withBase() (see src/lib/path.ts), so
 * internal links keep working when the site is built under a subpath (e.g. in a fork deployed to
 * GitHub Pages). External, `mailto:`, `tel:` and `#anchor` links are left unchanged.
 *
 * Specify the destination with href as you would in HTML, but other properties (such as className)
 * have to use the React naming.
 */
export function Link({ href, style, children, ...rest }) {
  const formattedHref =
    typeof href === "string" && href.trim().length > 0 ? withBase(href) : undefined;

  return (
    <a href={formattedHref} style={style ?? { color: "var(--palette-dark-blue)" }} {...rest}>
      {children}
    </a>
  );
}
