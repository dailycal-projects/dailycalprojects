# Endorsement web

Adapted from https://github.com/rexheng/nganalysis for the November 2, 2026 story.
`EndorsementWeb` embeds the locally bundled application to isolate the graph's
viewport, keyboard listeners, styles and URL state from the article.

`graph.json` is a fixed snapshot copied from the source repository. It is imported
into the JavaScript bundle; the graphic does not fetch data or poll for updates.
Organization logo services are disabled. Fonts and runtime assets are local.

The source title and analysis navigation were removed. The article wrapper uses
up to 1200px on desktop, shrinks with the viewport and gives phone users a
contained expandable details panel. The main background is transparent.

To rebuild after editing source or intentionally replacing the snapshot:

    npm install --prefix src/visuals/endorsementweb-visuals
    npm run build --prefix src/visuals/endorsementweb-visuals

Commit the generated files in `public/data/2026-11-02-endorsementweb/` with source changes.
