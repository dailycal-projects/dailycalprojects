import type { Building, Dataset, Unit } from "./data";
import { strings } from "./strings";
import { fmt } from "./text";

/** Bedroom group used for every comparison: 0 studio, 1, 2, 3, 4 = four or more. */
export function bedKey(beds: number): number | null {
  return beds < 0 ? null : Math.min(beds, 4);
}

export function bedLabel(k: number, plural = false): string {
  const b = strings.bedrooms;
  if (k === 0) return plural ? b.studios : b.studio;
  if (k >= 4) return plural ? b.fourPlusPlural : b.fourPlus;
  return fmt(plural ? b.beds : b.bed, { n: k });
}

/** An exact bedroom count, no 4+ group: "studio", "5 bed". */
export function bedsLabel(beds: number, plural = false): string {
  const b = strings.bedrooms;
  if (beds === 0) return plural ? b.studios : b.studio;
  return fmt(plural ? b.beds : b.bed, { n: beds });
}

/** The person using the app: their unit (if they picked one with data) plus rent and move-in. */
export type Me = {
  building: Building;
  unit: Unit | null;
  beds: number; // exact bedrooms (your building is compared on these)
  k: number; // bedKey(beds), for comparisons outside your building
  rent: number;
  tenure: number | null;
  before: boolean;
};

export function isMe(me: Me, u: Unit): boolean {
  return !!me.unit && me.unit.b === u.b && me.unit.i === u.i;
}

export type Verdict = { word: "more" | "less" | "same"; pct: number; count: number; n: number }; // count of n

/** "you pay more/less than XX% of them": whichever share is larger. Ties count for neither. */
export function verdict(values: number[], rent: number): Verdict {
  const n = values.length;
  if (!n) return { word: "same", pct: 0, count: 0, n };
  const below = values.filter((v) => v < rent).length;
  const above = values.filter((v) => v > rent).length;
  if (!below && !above) return { word: "same", pct: 100, count: n, n };
  return below >= above
    ? { word: "more", pct: Math.round((100 * below) / n), count: below, n }
    : { word: "less", pct: Math.round((100 * above) / n), count: above, n };
}

export function mean(v: number[]): number {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

// --- your building ---------------------------------------------------------------------------------

export type BuildingStory = {
  peers: Unit[]; // exactly your bedrooms (no 4+ group), has rent, not you
  verdict: Verdict;
  highest: Unit[];
  lowest: Unit[];
  ranked: Unit[]; // same bedrooms incl. you, rent high -> low
  cheapest: Unit | null;
};

export function buildingStory(me: Me): BuildingStory {
  const same = me.building.units.filter((u) => u.rent > 0 && u.beds === me.beds);
  const peers = same.filter((u) => !isMe(me, u));
  const ranked = [...peers];
  if (me.unit) ranked.push({ ...me.unit, rent: me.rent, tenure: me.tenure, before: me.before });
  ranked.sort((a, b) => b.rent - a.rent);
  const nHi = Math.min(3, Math.ceil(ranked.length / 2));
  const nLo = Math.min(3, ranked.length - nHi);
  const cheapest = peers.length ? peers.reduce((a, b) => (b.rent < a.rent ? b : a)) : null;
  return {
    peers,
    verdict: verdict(
      peers.map((u) => u.rent),
      me.rent,
    ),
    highest: ranked.slice(0, nHi),
    lowest: ranked.slice(ranked.length - nLo).reverse(),
    ranked,
    cheapest,
  };
}

// --- buildings like each other (the map's similar-buildings filter) ------------------------------------------------------------------------

const SIZE_EDGES = [1, 2, 5, 10, 20, 50, 100];
export function sizeBucket(total: number): number {
  let k = 0;
  for (let i = 0; i < SIZE_EDGES.length; i++) if (total >= SIZE_EDGES[i]) k = i;
  return k;
}
export function sizeLabel(total: number): string {
  const k = sizeBucket(total);
  const lo = SIZE_EDGES[k];
  const hi = SIZE_EDGES[k + 1];
  if (lo === 1) return strings.building.sizeOne;
  return hi ? fmt(strings.building.sizeRange, { lo, hi: hi - 1 }) : fmt(strings.building.sizeOpen, { lo });
}

/** Same era: the same 20-year band when both are known, otherwise the same rent-control status
 * (for multi-unit buildings, fully covered = built before 1980). */
export function sameEra(a: Building, b: Building): boolean {
  if (a.era !== null && b.era !== null) return a.era === b.era;
  return a.controlled === b.controlled;
}

export function eraLabel(b: Building): string {
  if (b.era !== null) return strings.building.eras[b.era];
  return b.controlled ? strings.building.rentControlled : strings.building.notRentControlled;
}

/** Same size band and same era: what the story's "buildings like yours" used to match on, without the
 * district or move-in window. */
export function isLike(a: Building, b: Building): boolean {
  return sizeBucket(a.total) === sizeBucket(b.total) && sameEra(a, b);
}

// --- box plot -------------------------------------------------------------------------------------

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// --- rent-o-meter ---------------------------------------------------------------------------------

export type Rentometer = {
  expected: number; // what this apartment rents for to someone who moved in when you did (now, if unknown)
  now: number; // what it would rent for to someone moving in now
  lo: number; // middle half of how far real rents land from the estimate
  hi: number;
  diff: number; // your rent minus the estimate
  outside: boolean; // your rent is outside lo..hi
};

const round25 = (n: number) => Math.round(n / 25) * 25;

export function rentometer(ds: Dataset, me: Me): Rentometer {
  const b = me.building;
  const seg = b.controlled ? "controlled" : "market";
  // the rent-o-meter tells 4 and 5+ bedrooms apart, unlike the match (which pools 4+)
  const beds = me.beds;
  const now = b.expected[Math.min(beds, b.expected.length - 1)];
  let expected = now;
  if (me.unit && me.unit.expected > 0 && me.tenure === me.unit.tenure && me.unit.tenure !== null) {
    expected = me.unit.expected; // the registry's move-in: estimated for this unit
  } else if (me.tenure !== null) {
    // a typed move-in year (Finder sets tenure = asof year - year + 0.5), or a rent you corrected (tenure 1)
    const year = Math.floor(Number(ds.asof.slice(0, 4)) - me.tenure + 0.5);
    const m = ds.byYear[seg];
    expected = Math.round((now * m[Math.max(0, Math.min(year - ds.byYear.from, m.length - 1))]) / 5) * 5;
  }
  const [lo, hi] = ds.rentRange[seg];
  const r = { expected, now, lo: round25(expected * lo), hi: round25(expected * hi), diff: me.rent - expected };
  return { ...r, outside: me.rent < r.lo || me.rent > r.hi };
}
