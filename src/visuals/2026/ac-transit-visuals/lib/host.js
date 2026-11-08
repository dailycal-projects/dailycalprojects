// How the components reach the page they sit on.
//
// In the Next app each view is a page of its own that scrolls the window. On
// data.dailycal.org all three live in one article: AcTransitStory switches
// between them, and scrolls its own container because the site's full-page
// template locks html and body. It registers that container and its view
// switcher here, and the components read them instead of assuming `window`
// and a route per view.
import { createElement } from "react";

let root = null;
let navigate = null;

export function setHost(element, go) {
  root = element;
  navigate = go;
}

/** What scrolls: the article's container, or the window outside one. */
export function scrollRoot() {
  return root || window;
}

/** The element the theme's custom properties are declared on. */
export function themeElement() {
  return root || document.documentElement;
}

export function viewHref(view) {
  return view === "story" ? "?" : `?view=${view}`;
}

/** A link to another view. A plain click switches in place; a modified click
    or a middle click follows the href, so opening in a new tab still works. */
export function ViewLink({ view, children, ...props }) {
  const onClick = (event) => {
    if (!navigate || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(view);
  };
  return createElement("a", { ...props, href: viewHref(view), onClick }, children);
}
