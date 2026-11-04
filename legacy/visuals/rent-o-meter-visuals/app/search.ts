import type { Dataset, SearchEntry } from "./data";
import { normalizeAddress } from "./data";

/** Addresses that start with what was typed first, then ones where every typed word starts a word. */
export function searchAddresses(ds: Dataset, text: string, limit = 7): SearchEntry[] {
  const q = normalizeAddress(text);
  if (q.length < 2) return [];
  const tokens = q.split(" ");
  const starts: SearchEntry[] = [];
  const words: SearchEntry[] = [];
  for (const e of ds.search) {
    if (e.key.startsWith(q)) starts.push(e);
    else if (starts.length <= limit) {
      const ks = e.key.split(" ");
      if (tokens.every((t) => ks.some((k) => k.startsWith(t)))) words.push(e);
    }
    if (starts.length > limit) break;
  }
  return [...starts, ...words].slice(0, limit);
}
