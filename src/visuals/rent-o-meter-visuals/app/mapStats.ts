import type { Building, Dataset } from "./data";
import { bedKey } from "./stats";
import { strings } from "./strings";

/** Per-building numbers behind the rent map. Rents are the same ones the story compares
 * (current rent, or rent ceiling for rent-controlled units); see build_dc_app_data.py. */
export type BuildingStat = {
  rents: number; // units with a usable rent and known bedrooms
  avg: number; // mean rent of those units, unadjusted
  adj: number | null; // mean of rent / berkeley median for the same bedrooms; 1 = typical
  meter: number | null; // mean of rent / the rent-o-meter's estimate for the same bedrooms; 1 = as expected
};

export function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function buildingStats(ds: Dataset): { stats: BuildingStat[]; medians: number[] } {
  const byBeds: number[][] = [[], [], [], [], []];
  for (const u of ds.rents) byBeds[bedKey(u.beds)!].push(u.rent);
  const medians = byBeds.map((v) => (v.length ? median(v) : 0));

  const stats = ds.buildings.map((b: Building): BuildingStat => {
    let n = 0, sum = 0, adjSum = 0, meterSum = 0;
    for (const u of b.units) {
      if (u.rent > 0 && u.beds >= 0) {
        n++;
        sum += u.rent;
        adjSum += u.rent / medians[bedKey(u.beds)!];
        meterSum += u.rent / b.expected[Math.min(u.beds, b.expected.length - 1)];
      }
    }
    return {
      rents: n,
      avg: n ? sum / n : 0,
      adj: n ? adjSum / n : null,
      meter: n ? meterSum / n : null,
    };
  });
  return { stats, medians };
}

/** What the map's colors compare rents to. */
export type Basis = "typical" | "meter";

/** The stats with `adj` swapped for the rent-o-meter ratio, so the colors, blocks, tooltips and landlord
 * numbers all follow the chosen comparison without knowing about it. */
export function onBasis(stats: BuildingStat[], basis: Basis): BuildingStat[] {
  return basis === "typical" ? stats : stats.map((s) => ({ ...s, adj: s.meter }));
}

// --- color: diverging around the typical berkeley rent for the same bedrooms ---------------------

/** Bin edges on the adjusted ratio, and one color per bin (blue cheaper, gray typical, red pricier). */
export const ADJ_EDGES = [0.7, 0.85, 0.95, 1.05, 1.15, 1.3];
// style guide palette: blue 3, 5, sky 6, slate 8, red 6, 4, 3
export const ADJ_COLORS = ["#215775", "#4e7da4", "#94bbe1", "#d6d6e5", "#ed9791", "#e35660", "#ab4b50"];
export const ADJ_LABELS: string[] = strings.map.legend.steps;
export const NO_RENT = "#ffffff"; // rental, but no usable rent on file

export function adjBin(adj: number): number {
  let k = 0;
  while (k < ADJ_EDGES.length && adj >= ADJ_EDGES[k]) k++;
  return k;
}

export function adjColor(adj: number | null): string {
  return adj === null ? NO_RENT : ADJ_COLORS[adjBin(adj)];
}

/** How far a building's rents sit from typical: "near" (within 5%), or "12% more" / "12% less". */
export function adjParts(adj: number): { near: boolean; pct: number; word: string } {
  const p = Math.round((adj - 1) * 100);
  return { near: Math.abs(adj - 1) < 0.05, pct: Math.abs(p), word: p > 0 ? strings.words.more : strings.words.less };
}

// --- filters --------------------------------------------------------------------------------------

export type FilterKey = "avg";
export type Range = [number, number]; // indices into the filter's steps
export type Filters = Record<FilterKey, Range>;

export const FILTERS: {
  key: FilterKey;
  label: string;
  steps: number[];
  fmt: (v: number) => string;
  value: (b: Building, s: BuildingStat) => number | null;
}[] = [
  {
    key: "avg",
    label: strings.map.filter.avgRent,
    steps: [...Array.from({ length: 25 }, (_, i) => i * 250), Infinity],
    fmt: (v) => (v === Infinity ? strings.map.filter.avgRentTop : `$${v.toLocaleString("en-US")}`),
    value: (_, s) => (s.rents ? s.avg : null),
  },
];

export function defaultFilters(): Filters {
  const f = {} as Filters;
  for (const d of FILTERS) f[d.key] = [0, d.steps.length - 1];
  return f;
}

export function isActive(f: Filters, key: FilterKey): boolean {
  const d = FILTERS.find((x) => x.key === key)!;
  return f[key][0] > 0 || f[key][1] < d.steps.length - 1;
}

/** Does a building pass every active filter? Buildings missing a filtered number don't. */
export function passes(f: Filters, b: Building, s: BuildingStat): boolean {
  for (const d of FILTERS) {
    if (!isActive(f, d.key)) continue;
    const v = d.value(b, s);
    if (v === null) return false;
    const lo = d.steps[f[d.key][0]];
    const hi = d.steps[f[d.key][1]];
    if (v < lo || v > hi) return false;
  }
  return true;
}

// --- blocks ---------------------------------------------------------------------------------------

export type BlockStat = {
  buildings: number; // rental buildings on the block that pass the filters
  rents: number; // their units with a usable rent
  avg: number; // mean rent of those units
  adj: number | null; // unit-weighted mean of rent / typical rent for the same bedrooms
};

/** Pool the units of every building on a block that passes the filters. */
export function blockStat(members: number[], stats: BuildingStat[], pass: boolean[]): BlockStat {
  let buildings = 0, rents = 0, sum = 0, adjSum = 0;
  for (const b of members) {
    if (!pass[b]) continue;
    const s = stats[b];
    buildings++;
    rents += s.rents;
    sum += s.avg * s.rents;
    adjSum += (s.adj ?? 0) * s.rents;
  }
  return { buildings, rents, avg: rents ? sum / rents : 0, adj: rents ? adjSum / rents : null };
}

// --- landlords ------------------------------------------------------------------------------------

export type LandlordStat = {
  buildings: number[];
  units: number; // registered units, any status
  rents: number; // units with a usable rent
  adj: number | null; // unit-weighted rent vs typical, same bedrooms
};

export function landlordStat(ds: Dataset, stats: BuildingStat[], landlord: number): LandlordStat {
  const buildings = ds.buildings.filter((b) => b.landlord === landlord).map((b) => b.i);
  let units = 0, rents = 0, adjSum = 0;
  for (const i of buildings) {
    const s = stats[i];
    units += ds.buildings[i].units.length;
    rents += s.rents;
    adjSum += (s.adj ?? 0) * s.rents;
  }
  return { buildings, units, rents, adj: rents ? adjSum / rents : null };
}
