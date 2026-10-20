# Dark stories

Import `darkStory.css` after the piece's local styles and add `dark-story` to
its full-page scroll container. The stylesheet is scoped to that root; ordinary
article templates are unaffected.

Opt page elements into the shared classes:

- `dark-story-masthead`: homepage link containing the white Daily Cal wordmark.
- `dark-story-content`: narrative body, including any full-width graphics.
- `dark-story-header`: headline, date, byline, and optional introduction.
- `dark-story-date`, `dark-story-byline`: publication metadata.
- `dark-story-prose`: a 640px text column with responsive gutters.
- `dark-story-copy`, `dark-story-lede`: narrative text, including MDX copy.
- `dark-story-card`: the visual treatment of a scrolling passage.
- `dark-story-button`, `dark-story-scroll-cue`: navigation within the story.
- `dark-story-footer`: a wrapper around the existing `ArticleFooter` component.

The `--dark-story-*` properties define the palette, fonts, measure, and gutters.
The measure is the text width, excluding the gutters. A story may override
these properties locally when needed.

Headlines fill the same text column as article prose and use normal wrapping;
balanced wrapping must not shorten their lines independently of that column.

AC Transit's `host.css` maps the source app's palette names onto these shared
properties. Its generated upstream styles remain intact, with the shared
stylesheet providing the site's presentation after them. Clery's `host.css`
keeps only its layout and viewer adjustments.

Map/chart colors, controls, graphic sizes, sticky positioning, scroll step
heights, and view routing stay with each piece. The shared classes describe
presentation and do not require another React template or change the shared
footer component.
