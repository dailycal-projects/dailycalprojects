/**
 * A Markdown (Sätteri mdast) plugin that keeps MDX from wrapping the text inside JSX elements like
 * <p> in paragraphs.
 *
 * MDX 2+ parses the lines inside a JSX element as Markdown, so
 *
 *   <p className="lede">
 *     Some text...
 *   </p>
 *
 * renders as <p class="lede"><p>Some text...</p></p>, which isn't valid HTML: browsers end the outer
 * <p> early, adding empty paragraphs and spacing. MDX 1 (which the older articles were written for)
 * kept that text as it was. For elements that can't contain paragraphs, this unwraps them,
 * separating several with a space.
 */
const NO_PARAGRAPHS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "a",
  "em",
  "strong",
  "b",
  "i",
  "u",
  "small",
  "label",
  "button",
  "cite",
  "q",
  "sub",
  "sup",
]);

export const unwrapJsxParagraphs = {
  name: "unwrap-jsx-paragraphs",

  paragraph(node, ctx) {
    const parent = ctx.parent(node);
    const inJsx = parent?.type === "mdxJsxFlowElement" || parent?.type === "mdxJsxTextElement";
    if (!inJsx || !NO_PARAGRAPHS.has(parent.name)) {
      return;
    }
    const index = ctx.indexOf(node);
    const afterParagraph = index > 0 && parent.children[index - 1]?.type === "paragraph";
    ctx.replaceNode(node, [
      ...(afterParagraph ? [{ type: "text", value: " " }] : []),
      ...node.children,
    ]);
  },
};
