/* Runtime for the string catalog in ./strings.js.

   Two entry points:

     t("explorer.weeklyTitle")              -> a plain string
     t("map.ridersPerWeekday", { n: 420 })  -> "420 riders / wkday"
     <T id="methodology.observed" c={[<b className="obs" />]} />

   `t` is for anywhere a string is required: aria-labels, document titles, the
   HTML blobs Leaflet popups take. `T` is for prose that carries inline markup,
   which is most of the writing in this app -- it keeps the sentence whole in
   the catalog instead of splitting it across JSX text nodes, so a copy edit is
   one edit and a translator sees a full sentence.

   In a catalog string, `<0>bold bit</0>` refers to c[0], and `{name}` to
   vars.name. A value passed in `vars` may itself be a React node. */
import { cloneElement, createElement, Fragment, isValidElement } from "react";

import { strings } from "./strings";

/** Resolve a dotted id against the catalog. Missing ids render as the id. */
export function lookup(id) {
  const value = id
    .split(".")
    .reduce((node, key) => (node == null ? node : node[key]), strings);
  if (typeof value !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] missing or non-string id: ${id}`);
    }
    return id;
  }
  return value;
}

const VAR = /\{(\w+)\}/g;
const TAG = /<(\d+)>([\s\S]*?)<\/\1>|<(\d+)\s*\/>/g;

/** Substitute {vars}. Returns a string, or an array when a var is a node. */
function substitute(text, vars) {
  if (!vars || !text.includes("{")) return text;
  const parts = [];
  let last = 0;
  let match;
  VAR.lastIndex = 0;
  while ((match = VAR.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(match[1] in vars ? vars[match[1]] : match[0]);
    last = VAR.lastIndex;
  }
  if (!parts.length) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts.every((p) => typeof p === "string") ? parts.join("") : parts;
}

/** Expand <n>...</n> against the components in `c`, recursively. */
function build(text, components, vars) {
  const out = [];
  const re = new RegExp(TAG.source, "g");
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) out.push(substitute(text.slice(last, match.index), vars));
    const index = Number(match[1] ?? match[3]);
    const element = components[index];
    const inner = match[2];
    if (!isValidElement(element)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] no component for <${index}> in: ${text.slice(0, 60)}`);
      }
      if (inner != null) out.push(substitute(inner, vars));
    } else if (inner == null) {
      out.push(cloneElement(element, { key: `t${key++}` }));
    } else {
      out.push(cloneElement(element, { key: `t${key++}` }, ...build(inner, components, vars)));
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(substitute(text.slice(last), vars));
  return out.flat();
}

/** A catalog string as a plain string. */
export function t(id, vars) {
  const raw = lookup(id);
  const done = substitute(raw, vars);
  return typeof done === "string" ? done : done.join("");
}

/** A catalog string as React nodes, with inline markup restored. */
export function T({ id, c = [], vars }) {
  const nodes = build(lookup(id), c, vars);
  return createElement(Fragment, null, ...nodes);
}

/** Every id in the catalog, dotted -- used by the coverage check. */
export function allIds(node = strings, prefix = "") {
  const ids = [];
  for (const [key, value] of Object.entries(node)) {
    const id = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") ids.push(id);
    else if (value && typeof value === "object") ids.push(...allIds(value, id));
  }
  return ids;
}
