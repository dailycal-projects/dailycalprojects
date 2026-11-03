# Clery story and crime-log viewer

The article is `src/articles/2026-10-14-clery.mdx`. It uses the full-page
template, as AC Transit does, and passes the scrolling story to `CleryStory`.
The full-page template supplies `props.frontmatter` to MDX; Clery passes its
title, date, byline names/profile links, and about-story text to `CleryStory`.
`CleryScrolly` also receives the frontmatter date to set the analysis cutoff.
Edit those values in the MDX frontmatter rather than duplicating them in JSX.
The opening copy and scroll passages are in the MDX, following
`src/articles/2026-10-14-clery_plain_text.md`. `CleryScrolly` keeps the story map
pinned while the passages scroll beside it (over it on mobile). Add further
passages inside that component as the story develops.

Views of the same article:

- `/2026-10-14-clery/`: the default story.
- `/2026-10-14-clery/?view=dashboard`: the incident map and draggable timeline.
- `/2026-10-14-clery/?view=table`: the searchable, sortable incident table.
- `?view=table&case=...`: a shared incident link.

The dashboard is adapted from `~/downloads/coding/ucpd_crime_log`. Its Astro
layouts became `Dashboard.js`; its scripts and statute links are in `scripts/`.
The shared loader combines the current public Google Sheet with the older
archive (spreadsheet `1ccCXzUZKwDrQiQrAvXG9pBfg6Ek4S0NURqNaN9YxH_g`,
tab `713202959`), covering June 3, 2026 and earlier. It removes identical rows
while retaining distinct reports with the same case number. Both sheets are
available through the dashboard's Archival Drive link. Report links come from the current sheet's HTML
export; older rows without report links remain searchable. D3's installed CSV
parser replaces Papa Parse.
Successful data loads are reused between views; failed loads can be retried
by reloading. No backend or additional package is required.

The viewer timeline shows four months across its width at every screen size.
The initial orange selection starts two-thirds across the screen, leaving
empty time on the right. That padding does not allow selecting future dates.
Its default 72-hour window ends at the latest report timestamp in the data.
Drag its background to pan through the archive; a click (without dragging)
snaps the selected range to that date. Panning preserves the selected dates.
The orange band still moves the selection, and its left edge resizes it.
Dragging that selection beyond the visible four months brings the dates into view.

Dashboard reports sharing coordinates occupy compact slots in concentric rings,
16 pixels apart. Only reports in the selected time range occupy slots. Surviving
dots keep their slots when possible; outer dots fill inner gaps when the group
shrinks, and newly appearing reports fill available slots. Hidden reports never
reserve space. Thin lines connect displaced dots to their original coordinates.
Screen offsets are reapplied after zooming. The story is unaffected.

The page scripts now have explicit mount/cleanup functions, scoped DOM queries,
and view links within this article. Map instances, tours, listeners, requests,
and scheduled frames are released when leaving a view. The module imports are
safe for Gatsby's server render, and the dashboard is loaded only in its views.

The story map includes located crimes from the year leading up to the MDX
publication date, matching the first passage. For `2026-10-14`, this includes
October 14, 2025 through October 13, 2026. Publication day is excluded, and new
reports do not advance this window. The historical comparison also excludes
reports on or after publication, without modifying the viewer's cached data.
The viewer's map timeline and searchable table include the full archive.
Reports labeled `Campus` or `Campus; Campus` remain in the archive and table but are
excluded from all map dots and heatmaps because they lack a specific location.
The story has no sidebar or timeline. It starts over main campus and shares its map
tiles, incident markers, hover details, and sharing actions with the dashboard.
Scroll-wheel zoom is disabled in the story so the wheel scrolls the passages.
The opening uses colorful dots with no heatmap, followed by two examples of
UCPD descriptions. Passages with `data-case` open the
matching report and connect it to their text card. A hidden MDX blockquote with
`data-clery-statute` supplies the white definition callout and its connector to
the matching statute chip. These annotations track scrolling and map movement,
and disappear when their scene ends. Reports without coordinates use a docked
card instead of assigning an invented location.

The opening camera stays fixed throughout the description examples, code
explanation, and INFO/RULES/CIVIL passages. Only their annotations and visible
dots change. The first automatic camera move is the campus/University Village
overview. The later outside-assist passage opts into an incident-specific camera
with `data-camera="incident"`. Camera targets change only when their destination
changes; quickly scrolling among opening passages never starts or interrupts a
flight. Incident framing uses fixed coordinates rather than moving popup positions.
The story uses flyTo animation without Leaflet's separate CSS zoom animation.

The ending has separate `data-crime-prefix` passages for INFO, RULES, and
CIVIL reports in the same past-year window. Each keeps matching dots interactive
and hides the remaining dots. Matching reports are drawn on top, and
their category name is highlighted in hover previews and pinned popups, matching
the highlight in the narrative card. INFO, RULES, and CIVIL matching checks the
start of the full crime description, ignoring case and leading whitespace.
Categories appearing only in later pipe-separated charges do not match.

The final `reporting-hotspots` passage zooms out to include main campus and
University Village. It uses the same past-year window as the opening, with white
dots aggregated by coordinates and no heatmap. Dot area is proportional to
report count (radius = 1.875 pixels × square root of count).
The dots retain that screen radius throughout map flights, compensating for
Leaflet's scaling of their parent SVG. Only the busiest
location within 40 screen pixels is interactive, recalculated after zooming;
ties use location name and coordinates. All dots remain visible. Hovering or
tapping outlines the selected dot in black and shows the location name, report
count, and common crime types. Scrolling back restores the category dots and
campus framing without a fade.

The outside-assist passage highlights report `26-02400` and flies to its mapped
location. The closing `latest-reports` passage returns to the original campus
view and shows the 100 most recent mapped reports from the live dataset, with
another link to the interactive viewer. This closing preview is separate from
the publication-anchored date window used for the preceding analysis.

The historical heatmap experiment is still disabled by omitting its passage
from MDX; its implementation remains available. When present, the `yearly-heatmap` passage
pins its card for approximately three viewport heights of scrolling, advancing
one calendar year at a time from 2020 through the last report before publication.
Each year uses its own mapped reports, one white dot per exact location, and a
Leaflet.heat overlay with the same intensity scale across years. Dot area is
proportional to the number of reports at that location in the selected year
(radius = 1.875 pixels × square root of count), using one scale across years.
Hovering an aggregate dot shows the most common location label, that year's
report count, and the five most common crime types with their report counts.
Statute codes group description variants; each type counts once per report.
Up to two other location labels are included when the same coordinates have
several names. Clicking or tapping pins the same summary. Changing the year
replaces the dots and closes the previous summary. The active year
appears in the heatmap legend rather than the narrative sentence. Empty years are
included. Scrolling back restores the past-year view. The dashboard does not
use this overlay or scroll behavior.

`styles/dashboard.css` is generated and scoped to `.clery-viewer`, which is used
by both maps and the dashboard table. The story imports `src/styles/darkStory.css`
for the shared dark palette, typography, reading columns, masthead, cards, and
footer; `host.css` contains its layout and viewer adjustments. See
`src/styles/darkStory.md` for the shared classes. Regenerate the
viewer styles with:

```
node src/visuals/clery-visuals/scope-css.js ~/downloads/coding/ucpd_crime_log
```

The original repository is not changed. When pulling future script updates,
retain the mount/cleanup functions and replace standalone page URLs with
`viewHref` query links.
