/**
 * Stand-ins for the parts of Gatsby's API that the visuals from the old Gatsby site use, so their
 * code works unchanged with only `from "gatsby"` changed to import this file.
 */
import { withBase } from "../path";

/** Gatsby's withPrefix(): a site path with the site's base prepended. */
export const withPrefix = withBase;

/** Gatsby's <Link to="/path">, as a plain link. */
export function Link({ to, children, ...rest }) {
  return (
    <a href={withBase(to)} {...rest}>
      {children}
    </a>
  );
}
