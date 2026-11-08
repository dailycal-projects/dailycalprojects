/**
 * The text of an article that search indexes: its prose (paragraphs, headings, lists, quotes,
 * tables), read from the .mdx source instead of the built page. Built pages also contain whatever
 * visuals render at build time (chart axes, legends, tooltips), which would make searches for "1"
 * or "2024" match every chart. A visual's text comes from its code, not the .mdx, so this takes
 * all the text written in the .mdx, at any depth, including inside HTML elements (`<p>`, `<h2>`,
 * ...) and components (a scrollytelling component's steps are the story's prose), but never
 * components' props, imports, `{expressions}` or code.
 */
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

export interface TextBlock {
  /** A heading in the article (ranked higher by search). */
  heading: boolean;
  /** A paragraph entirely in italics, usually a note, e.g. "_This is part of a series..._". */
  note?: boolean;
  text: string;
}

// Minimal mdast shape: the parts of a node this file reads
interface Node {
  type: string;
  name?: string | null;
  value?: string;
  children?: Node[];
}

const parser = unified().use(remarkParse).use(remarkMdx);

// HTML elements that hold graphics or code, not prose
const NOT_PROSE = new Set([
  "svg",
  "script",
  "style",
  "iframe",
  "video",
  "audio",
  "canvas",
  "code",
  "pre",
]);

/** The text inside an inline node: text, inline code, and the text of links and HTML elements. */
function inlineText(node: Node): string {
  switch (node.type) {
    case "text":
    case "inlineCode":
      return node.value ?? "";
    case "break":
      return " ";
    case "mdxTextExpression":
      // {" "} is how JSX writes a space; other expressions aren't text
      return /^\s*(["'`])\s*\1\s*$/.test(node.value ?? "") ? " " : "";
    case "mdxJsxTextElement":
      return node.name && NOT_PROSE.has(node.name)
        ? ""
        : (node.children ?? []).map(inlineText).join("");
    default:
      return (node.children ?? []).map(inlineText).join("");
  }
}

function collect(node: Node, blocks: TextBlock[]): void {
  switch (node.type) {
    case "paragraph":
    case "tableCell": {
      const text = inlineText(node).replace(/\s+/g, " ").trim();
      const content = (node.children ?? []).filter(
        (child) => !(child.type === "text" && !child.value?.trim()),
      );
      const note = content.length > 0 && content.every((child) => child.type === "emphasis");
      if (text) blocks.push({ heading: false, note, text });
      return;
    }
    case "heading": {
      const text = inlineText(node).replace(/\s+/g, " ").trim();
      if (text) blocks.push({ heading: true, text });
      return;
    }
    case "mdxJsxFlowElement":
      if (node.name && NOT_PROSE.has(node.name)) return;
      if (node.name && /^h[1-6]$/.test(node.name)) {
        const text = inlineText(node).replace(/\s+/g, " ").trim();
        if (text) blocks.push({ heading: true, text });
        return;
      }
      // An element written on one line (`<p>Text</p>`) has its text directly inside it, not in a
      // paragraph
      if (
        (node.children ?? []).every(
          (child) => !child.type.startsWith("mdxJsxFlow") && child.type !== "paragraph",
        )
      ) {
        const text = inlineText(node).replace(/\s+/g, " ").trim();
        if (text) blocks.push({ heading: false, text });
        return;
      }
      break;
    case "code":
    case "html":
    case "mdxjsEsm":
    case "mdxFlowExpression":
      return;
  }
  for (const child of node.children ?? []) collect(child, blocks);
}

/** An article's prose, in order, as paragraphs and headings of plain text. */
export function articleText(body: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  collect(parser.parse(body) as Node, blocks);
  return blocks;
}
