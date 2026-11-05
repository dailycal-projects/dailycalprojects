# Endorsement web

Adapted from https://github.com/rexheng/nganalysis for the November 2, 2026 story.

`EndorsementWeb.jsx` renders a box (`host.css`) and, in the browser, calls `mount()` from `main.ts`, which
draws the app (`template.html`, `style.css`, `embed.css`) into a shadow root on that box. The shadow root keeps
the article's styles out of the app and the app's styles out of the article, the job an iframe did before.

The app was built to fill a page of its own, so inside the box:

- its breakpoints and `cqh`/`cqw` units measure the box (`container-type: size` in `host.css`), as they measured
  the iframe's viewport. `@container` rules in the CSS and `widthQuery()` in `main.ts` stand in for media queries.
- the mobile details sheet is positioned in the box, not fixed to the window.
- it doesn't keep its state in the URL (that would rewrite the article's URL), and its keyboard shortcuts only
  apply while focus is inside it.

`graph.json` is a fixed snapshot copied from the source repository, bundled into the app's JavaScript, which only
loads on this article. Organization logo services are disabled. Fonts are in `public/fonts/` (`fonts.css`).
