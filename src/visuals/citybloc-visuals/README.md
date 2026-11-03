# City Council voting graphics

Adapted from https://github.com/eshabansiya/dailycal-citybloc (graphics by Esha Bansiya).

The seven React components appear in `2026-10-28-citybloc.mdx` in this order:
Topics, Dissents, Agreement, BlocUnity, BlocMoves, SplitSides, MotionExplorer.

Each component uses the original chart markup, CSS and interaction code from its
`*-graphic.js` module. CityblocGraphic mounts that code in a shadow root to isolate
styles, selectors and IDs from the article and other instances. It removes the
DOM, resize listeners and generated CSV URLs on unmount. Rendering is client side
so Gatsby server rendering never accesses browser APIs. Data and embedded portrait
assets are bundled locally in JSON; the temporary source clone is not required.
