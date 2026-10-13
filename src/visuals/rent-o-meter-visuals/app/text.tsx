// Turns the sentences in strings.js into what the screen shows. See the top of strings.js for the markup.
import type { ReactNode } from "react";

type Vars = Record<string, string | number>;

const TAG = /<(num|word|b|em)>(.*?)<\/\1>/gs;
const VAR = /\{(\w+)\}/g;

/** Plain text: fills in {name} values. */
export function fmt(template: string, vars: Vars = {}): string {
  return template.replace(VAR, (_, name: string) => {
    if (!(name in vars)) {
      console.warn(`strings: no value for {${name}} in "${template}"`);
      return "";
    }
    return String(vars[name]);
  });
}

/** Picks the singular or plural sentence for a count and fills it in; {n} is the count. */
export function pl(entry: { one: string; other: string }, n: number, vars: Vars = {}): string {
  return fmt(n === 1 ? entry.one : entry.other, { n, ...vars });
}

/** Styled text: fills in {name} values and turns <num>, <word>, <b> and <em> into styled elements. */
export function rich(template: string, vars: Vars = {}): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of template.matchAll(TAG)) {
    const at = m.index ?? 0;
    if (at > last) out.push(fmt(template.slice(last, at), vars));
    const inner = fmt(m[2], vars);
    const k = key++;
    last = at + m[0].length;
    if (m[1] === "num") out.push(<span key={k} className="num">{inner}</span>);
    else if (m[1] === "word") {
      const punctuation = template.slice(last).match(/^[,.;:!?]+/)?.[0] ?? "";
      if (punctuation) {
        out.push(
          <span key={k} className="word-with-punctuation">
            <span className="word">{inner}</span>{punctuation}
          </span>,
        );
        last += punctuation.length;
      } else out.push(<span key={k} className="word">{inner}</span>);
    } else if (m[1] === "b") out.push(<strong key={k}>{inner}</strong>);
    else out.push(<em key={k}>{inner}</em>);
  }
  if (last < template.length) out.push(fmt(template.slice(last), vars));
  return out;
}
