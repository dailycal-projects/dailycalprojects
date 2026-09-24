// Where the packed data bundle lives: the public GCS bucket the Cloud Run
// build also reads, so the 55 MB bundle stays out of this repo. Set
// GATSBY_PACK_BASE to point a build at another copy.
import { t } from "../lib/i18n";

export const PACK = (
  process.env.GATSBY_PACK_BASE
  || "https://storage.googleapis.com/ac-transit-ridership-pack/pack-2026-09-18"
).replace(/\/$/, "");

export const M = { BDR: 0, BDI: 1, ALR: 2, ALI: 3 };

export const SEQ_BLUE = [
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#2a78d6",
  "#1c5cab",
  "#104281",
];
export const SEQ_GOLD = [
  "#fdf0cf",
  "#f9dc94",
  "#f3c65c",
  "#eda100",
  "#c98500",
  "#a06a00",
  "#754e00",
];
export const DIVERGING = [
  "#104281",
  "#2a78d6",
  "#86b6ef",
  "#f0efec",
  "#f0a3a2",
  "#e34948",
  "#a11f1f",
];
/* Relative-to-baseline ramp: red below Feb 2020, green above. Diverging
   around the neutral midpoint at 100%, distinct from the blue magnitude
   ramp used by the total view. */
export const DIVERGING_RG = [
  "#a11f1f",
  "#e34948",
  "#f0a3a2",
  "#f0efec",
  "#a9d8b3",
  "#419c62",
  "#0d5732",
];
export const SEQ_GREEN = [
  "#fcfcfb",
  "#d8ecdc",
  "#a9d8b3",
  "#72bd88",
  "#419c62",
  "#1e7a47",
  "#0d5732",
];
// Income gets magenta because it is the one ramp that has to coexist with
// another: in the income view the areas are magenta while the corridors stay
// on the blue load ramp above them. Violet was the first choice and measured
// deutan dE 4.0 / normal dE 13.7 against that blue -- below the floor, i.e.
// indistinguishable. Magenta measures 13.1 / 23.8 and clears it.
export const SEQ_MAGENTA = [
  "#f6d5e3",
  "#eaadc9",
  "#db84ae",
  "#cb5794",
  "#bc4886",
  "#953469",
  "#6f224c",
];
export const REC_NEVER = "#a11f1f";
export const REC_SMALL = "#c9c8c2";

export function fmt(value) {
  return Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-US");
}

export function ramp(stops, value) {
  if (!Number.isFinite(value)) return "#d8d7d2";
  const x = Math.max(0, Math.min(1, value)) * (stops.length - 1);
  return stops[Math.round(x)];
}

/* How the commute view positions a value on a ramp. Two rules, one per ramp
   family, so a colour means the same kind of thing in every mode.

   seqT: a magnitude, square-rooted against the 98th percentile of its own
   distribution -- full strength always reads as "top of this distribution"
   rather than as some per-mode constant.

   divT: a ratio, log2 around parity, so the midpoint is 1x and either end is
   4x. The 0.06/0.94 clamp holds the extremes just inside the ramp, so a
   saturated colour reads as "at least 4x" instead of "exactly 4x". A ratio of
   0 pins to the low end and an infinite one to the high end; only an
   undefined ratio (0/0) returns NaN, which ramp() renders grey. */
export function seqT(value, domain) {
  return domain > 0 ? Math.sqrt(Math.max(0, value) / domain) : NaN;
}

export function divT(ratio) {
  if (Number.isNaN(ratio)) return NaN;
  if (ratio <= 0) return 0.06;
  if (!Number.isFinite(ratio)) return 0.94;
  return Math.max(0.06, Math.min(0.94, 0.5 + Math.log2(ratio) / 4));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getJson(name) {
  const response = await fetch(`${PACK}/${name}`);
  if (!response.ok) throw new Error(t("errors.loadFailed", { name, status: response.status }));
  return response.json();
}

async function getBinary(name, Type) {
  const response = await fetch(`${PACK}/${name}`);
  if (!response.ok) throw new Error(t("errors.loadFailed", { name, status: response.status }));
  return new Type(await response.arrayBuffer());
}

function buildRouteSectionIndex(meta) {
  const index = {};
  const sections = meta.geometry.sections;
  for (let sid = 0; sid < sections.route.length; sid += 1) {
    const route = sections.route[sid];
    const era = sections.era[sid];
    if (!index[route]) index[route] = {};
    if (!index[route][era]) index[route][era] = [];
    index[route][era].push(sid);
  }
  return index;
}

// The 98th percentile of a level's weekly totals, sampled every fourth week.
function levelDomain(data, level) {
  const store = data.store[level];
  const values = [];
  for (let key = 0; key < store.n; key += 1) {
    for (let week = 0; week < data.W; week += 4) {
      const value = totalAt(data, level, key, week);
      if (value > 0) values.push(value);
    }
  }
  values.sort((a, b) => a - b);
  return values.length ? values[Math.floor(values.length * 0.98)] : 1;
}

async function optionalJson(name) {
  try {
    return await getJson(name);
  } catch {
    return null;
  }
}

/* Startup loads only what the default map needs: the index, the stop-group
   and route weeks, and the small side tables. Everything else -- the tract,
   block-group and city layers, each era's corridors, a month of service,
   the commute binaries -- is fetched the first time a view asks for it,
   through ensureData(). Data is added to this same object, so every reader
   below stays synchronous and simply finds nothing until its data is in. */
export async function loadVisualizationData() {
  const [meta, routeWeeks, stopGroupWeeks, index, cities, serviceMeta, commuteMeta, lodes] =
    await Promise.all([
      getJson("meta.json"),
      getBinary("route_weeks.u16", Uint16Array),
      getBinary("stopgroup_weeks.u16", Uint16Array),
      // Whole-bundle numbers precomputed by scripts/build_pack_index.py.
      optionalJson("pack_index.json"),
      // Optional side tables. Without cities.json there is no Cities level,
      // without service_meta.json no Speed / Level of service views, without
      // commute_meta.json no commute view, and without lodes.json (LODES
      // all-commuter marginals, scripts/build_lodes_pack.py) no All-commuters
      // or Compare cells.
      optionalJson("cities.json"),
      optionalJson("service_meta.json"),
      optionalJson("commute_meta.json"),
      optionalJson("lodes.json"),
    ]);
  // Monthly all-day bus speed per corridor (scripts/build_speed_pack.py);
  // its binaries load only when a selection charts speed.
  const speedMeta = await optionalJson("speed_meta.json");

  const data = {
    meta,
    W: meta.n_weeks,
    BASE: meta.baseline_week,
    store: {
      group: {
        q: stopGroupWeeks,
        scale: Float32Array.from(meta.scales.stopgroup),
        n: meta.stop_groups.n,
      },
    },
    routeW: {
      q: routeWeeks,
      scale: Float32Array.from(meta.route_weeks.scale),
      ix: new Map(meta.route_weeks.routes.map((route, index) => [route, index])),
    },
    sections: {},
    corridors: {},
    corridorNodes: {},
    geo: {},
    routeSections: buildRouteSectionIndex(meta),
    sectionRoutes: meta.geometry.sections.route,
    routeNameIx: new Map(meta.route_names.map((route, index) => [route, index])),
    domains: {},
    corridorStats: {},
    corridorDom: index?.corridor_domain ?? null,
    incomeDom: null,
    monthIndex: meta.weeks.map((week) => meta.months.indexOf(week.slice(0, 7))),
    service: serviceMeta,
    speed: speedMeta ? { meta: speedMeta, eras: {} } : null,
    commute: commuteMeta ? commuteShell(commuteMeta) : null,
    lodes,
    cities: null,
    pending: new Map(),
  };
  data.domains.group = levelDomain(data, "group");
  if (cities) attachCities(data, cities);
  return data;
}

// Everything the explorer can show, so the story page (which reads block
// groups, every era's corridors and the commute profiles) can load it all.
export function everything(data) {
  return {
    levels: ["tract", "bgroup", ...(data.cities ? ["city"] : [])],
    eras: Object.keys(data.meta.sections),
    commute: true,
  };
}

/* Fetch whatever a view needs that is not loaded yet. `needs` is
   { levels: [...], eras: [...], serviceMonth: snapshot, commute: bool }.
   Each piece is fetched once: concurrent callers share the same promise, and
   a failed fetch is forgotten so a later call can retry it. Resolves to true
   when anything new arrived. */
export async function ensureData(data, needs) {
  const jobs = [];
  const once = (key, load) => {
    if (!data.pending.has(key)) {
      data.pending.set(key, load().then(() => true, (error) => {
        data.pending.delete(key);
        throw error;
      }));
      jobs.push(data.pending.get(key));
    } else if (!data.pending.get(key).settled) {
      jobs.push(data.pending.get(key));
    }
  };
  for (const level of needs.levels || []) {
    if (level === "tract" || level === "bgroup" || level === "city") {
      once(`level:${level}`, () => loadLevel(data, level));
    }
  }
  for (const era of needs.eras || []) {
    if (era && data.meta.sections[era]) once(`era:${era}`, () => loadEra(data, era));
  }
  if (needs.serviceMonth) {
    once(`service:${needs.serviceMonth.id}`, () => loadServiceMonth(data, needs.serviceMonth));
  }
  if (needs.commute && data.commute) once("commute", () => loadCommuteBinaries(data.commute));
  if (needs.speed && data.speed) {
    for (const era of Object.keys(data.speed.meta.eras)) {
      once(`era:${era}`, () => loadEra(data, era));
      once(`speed:${era}`, () => loadSpeedEra(data, era));
    }
  }
  if (!jobs.length) return false;
  jobs.forEach((job) => job.then(() => { job.settled = true; }, () => {}));
  await Promise.all(jobs);
  return true;
}

export function isPending(data, needs) {
  const keys = [
    ...(needs.levels || []).filter((l) => l !== "group" && l !== "none").map((l) => `level:${l}`),
    ...(needs.eras || []).filter(Boolean).map((e) => `era:${e}`),
    ...(needs.serviceMonth ? [`service:${needs.serviceMonth.id}`] : []),
    ...(needs.commute && data.commute ? ["commute"] : []),
    ...(needs.speed && data.speed
      ? Object.keys(data.speed.meta.eras).flatMap((era) => [`era:${era}`, `speed:${era}`])
      : []),
  ];
  return keys.some((key) => !data.pending.get(key)?.settled);
}

async function loadLevel(data, level) {
  const { meta } = data;
  if (level === "city") {
    data.geo.cities = await getJson("cities.geojson");
    return;
  }
  const [weeks, geo] = await Promise.all([
    getBinary(level === "tract" ? "tract_weeks.u16" : "bgroup_weeks.u16", Uint16Array),
    getJson(level === "tract" ? "tracts.geojson" : "blockgroups.geojson"),
  ]);
  data.store[level] = {
    q: weeks,
    scale: Float32Array.from(meta.scales[level]),
    n: (level === "tract" ? meta.tracts : meta.bgroups).length,
  };
  data.domains[level] = levelDomain(data, level);
  data.geo[level === "tract" ? "tracts" : "blockgroups"] = geo;
}

async function loadEra(data, era) {
  const spec = data.meta.sections[era];
  const [load, imp, corridors, nodes] = await Promise.all([
    getBinary(`section_load_${era}.u16`, Uint16Array),
    getBinary(`section_imp_${era}.u8`, Uint8Array),
    getJson(`corridors_${era}.json`),
    getJson(`nodes_${era}.json`),
  ]);
  data.sections[era] = {
    load,
    imp,
    scale: Float32Array.from(spec.scale),
    idIndex: new Map(spec.section_ids.map((id, index) => [id, index])),
    weekLo: spec.week_lo,
    nWeeks: spec.n_weeks,
  };
  data.corridorNodes[era] = nodes;
  // Set last: data.corridors[era] is what readers test for.
  data.corridors[era] = corridors;
}

async function loadSpeedEra(data, era) {
  const spec = data.speed.meta.eras[era];
  data.speed.eras[era] = { ...spec, q: await getBinary(spec.file, Uint16Array) };
}

/* Monthly all-day bus speed inside a lat/lon box: every corridor piece with a
   point in the box, combined as distance over time -- sum(weight) /
   sum(weight / mph), the weight being bus-km -- so a busy street counts for
   more than a quiet one. Returns per month { month, mph } in meta.months
   order (mph null where no bus data), and the whole period's average on the
   same basis. Null until every era's corridors and speeds have loaded. */
export function regionSpeed(data, bounds) {
  if (!data.speed || !bounds) return null;
  const eras = Object.keys(data.speed.meta.eras);
  if (!eras.every((era) => data.speed.eras[era] && data.corridors[era])) return null;
  const cacheKey = [bounds.south, bounds.west, bounds.north, bounds.east].join(",");
  data.speed.cache = data.speed.cache || new Map();
  if (data.speed.cache.has(cacheKey)) return data.speed.cache.get(cacheKey);
  const inBox = ([lat, lon]) => lat >= bounds.south && lat <= bounds.north
    && lon >= bounds.west && lon <= bounds.east;
  const byMonth = new Map();
  let totalWeight = 0;
  let totalTime = 0;
  const none = data.speed.meta.null;
  for (const era of eras) {
    const spec = data.speed.eras[era];
    const nMonths = spec.months.length;
    const pieces = [];
    data.corridors[era].forEach((feature, index) => {
      if (feature.c.some(inBox)) pieces.push(index);
    });
    spec.months.forEach((month, m) => {
      let weight = 0;
      let time = 0;
      for (const index of pieces) {
        const base = (index * nMonths + m) * 2;
        if (spec.q[base] === none) continue;
        const mph = spec.q[base] / 10;
        const w = spec.q[base + 1] * spec.scale;
        if (!(mph > 0) || !(w > 0)) continue;
        weight += w;
        time += w / mph;
      }
      byMonth.set(month, time > 0 ? weight / time : null);
      totalWeight += weight;
      totalTime += time;
    });
  }
  const result = {
    months: data.meta.months.map((month) => ({ month, mph: byMonth.get(month) ?? null })),
    average: totalTime > 0 ? totalWeight / totalTime : null,
  };
  data.speed.cache.set(cacheKey, result);
  return result;
}

async function loadServiceMonth(data, snap) {
  const [q, routes] = await Promise.all([
    getBinary(snap.file, Uint16Array),
    getJson(snap.routes_file),
  ]);
  snap.routes = routes;
  snap.q = q;
}

/* A city is the sum of the stop groups inside it, so its weeks are built here
   rather than shipped: the same four measures, unquantized (scale 1). The
   group -> city mapping goes onto meta.stop_groups beside tract and bgroup,
   and the recovery table onto meta.recovery, so everything that already
   reads those by level works for cities unchanged. */
function attachCities(data, cities) {
  const { meta, W } = data;
  const nCities = cities.places.length;
  const q = new Float32Array(nCities * W * 4);
  const groups = data.store.group;
  cities.group.forEach((city, group) => {
    if (city < 0) return;
    const scale = groups.scale[group];
    for (let offset = 0; offset < W * 4; offset += 1) {
      q[city * W * 4 + offset] += groups.q[group * W * 4 + offset] * scale;
    }
  });
  data.store.city = { q, scale: new Float32Array(nCities).fill(1), n: nCities };
  data.domains.city = levelDomain(data, "city");
  data.cities = cities;
  meta.stop_groups.city = cities.group;
  meta.recovery.city = cityRecovery(data, nCities);
}

/* Same rule as corridorStats: the first month from Apr 2020 that holds the
   threshold share of the Feb 2020 month for three straight months; -1 never,
   -2 when the baseline is too small to judge. Months are mean weeks. */
function cityRecovery(data, nCities) {
  const { meta } = data;
  const nMonths = meta.months.length;
  const monthly = new Float64Array(nCities * nMonths);
  const weeksIn = new Float64Array(nMonths);
  for (let week = 0; week < data.W; week += 1) {
    const month = data.monthIndex[week];
    if (month < 0) continue;
    weeksIn[month] += 1;
    for (let city = 0; city < nCities; city += 1) {
      monthly[city * nMonths + month] += totalAt(data, "city", city, week);
    }
  }
  const startMonth = Math.max(0, meta.months.indexOf("2020-04"));
  const sustain = 3;
  const table = [];
  for (let city = 0; city < nCities; city += 1) {
    const mean = (month) => (weeksIn[month] ? monthly[city * nMonths + month] / weeksIn[month] : 0);
    const baseline = mean(meta.recovery_baseline_month);
    table.push(meta.recovery_thresholds.map((threshold) => {
      if (baseline < 500) return -2;
      for (let month = startMonth; month <= nMonths - sustain; month += 1) {
        let sustained = true;
        for (let offset = 0; offset < sustain && sustained; offset += 1) {
          sustained = mean(month + offset) >= baseline * threshold;
        }
        if (sustained) return month;
      }
      return -1;
    }));
  }
  return table;
}

export function rawAt(data, level, key, week, measure) {
  const store = data.store[level];
  return store.q[(key * data.W + week) * 4 + measure] * store.scale[key];
}

export function totalAt(data, level, key, week) {
  return (
    rawAt(data, level, key, week, M.BDR) +
    rawAt(data, level, key, week, M.BDI) +
    rawAt(data, level, key, week, M.ALR) +
    rawAt(data, level, key, week, M.ALI)
  );
}

export function imputedAt(data, level, key, week) {
  return rawAt(data, level, key, week, M.BDI) + rawAt(data, level, key, week, M.ALI);
}

export function recoveryAt(data, level, key, threshold) {
  const table = data.meta.recovery[level === "group" ? "stopgroup" : level];
  return table?.[key]?.[threshold] ?? -2;
}

// ACS median household income for an area. A stop group has no income of its
// own, so it reads the block group containing it -- ACS publishes B19013
// down to block group, the finest geography this map draws, so that is a
// closer estimate than borrowing the (larger) enclosing tract.
export function incomeAt(data, level, key) {
  const income = data.meta.income;
  if (!income) return null;
  let table = income[level];
  let index = key;
  if (level === "group") {
    index = data.meta.stop_groups.bgroup[key];
    table = income.bgroup;
    if (index === undefined || index < 0) return null;
  }
  if (!table) return null;
  const med = table.med[index];
  if (med === null || med === undefined) return null;
  return {
    med,
    topCoded: med >= income.top_code,
  };
}

// Fixed to the tract distribution so the ramp does not rebase when you switch
// between tracts and block groups -- the same colour means the same income at
// both levels, which is the whole point of putting them on one map.
export function incomeDomain(data) {
  if (data.incomeDom) return data.incomeDom;
  const table = data.meta.income?.tract;
  const values = (table?.med || []).filter((v) => v !== null && v !== undefined);
  values.sort((a, b) => a - b);
  data.incomeDom = values.length
    ? [values[Math.floor(values.length * 0.05)], values[Math.floor(values.length * 0.95)]]
    : [0, 1];
  return data.incomeDom;
}

export function incomeColor(data, level, key) {
  const income = incomeAt(data, level, key);
  if (!income) return null;
  const [lo, hi] = incomeDomain(data);
  return ramp(SEQ_MAGENTA, (income.med - lo) / Math.max(1, hi - lo));
}

export function metricAt(data, level, key, week, view, recThresh) {
  if (view === "income") return incomeAt(data, level, key)?.med ?? NaN;
  const value = totalAt(data, level, key, week);
  if (view === "total") return value;
  if (view === "imp") return value > 0 ? imputedAt(data, level, key, week) / value : NaN;
  if (view === "recovery") return recoveryAt(data, level, key, recThresh);
  const baseline = totalAt(data, level, key, data.BASE);
  return baseline > 0 ? value / baseline : NaN;
}

export function colorFor(data, level, key, week, view, recThresh) {
  // The service views colour corridors only; areas stay neutral beneath them.
  if (isServiceView(view)) return null;
  if (view === "income") return incomeColor(data, level, key);
  if (view === "recovery") {
    const month = recoveryAt(data, level, key, recThresh);
    if (month === -2) return REC_SMALL;
    if (month === -1) return REC_NEVER;
    const low = data.meta.recovery_baseline_month + 2;
    const span = data.meta.months.length - low;
    return ramp(SEQ_BLUE, (month - low) / span);
  }
  const value = metricAt(data, level, key, week, view, recThresh);
  if (!Number.isFinite(value)) return null;
  if (view === "total") return ramp(SEQ_BLUE, Math.sqrt(value / data.domains[level]));
  if (view === "imp") return ramp(SEQ_GOLD, value);
  return ramp(DIVERGING_RG, value / 2);
}

export function eraForWeek(data, week) {
  for (const [era, spec] of Object.entries(data.meta.sections)) {
    if (week >= spec.week_lo && week < spec.week_lo + spec.n_weeks) return era;
  }
  return null;
}

export function sectionLoad(data, era, sectionId, week) {
  const section = data.sections[era];
  const row = section.idIndex.get(sectionId);
  if (row === undefined) return [0, 0];
  const index = row * section.nWeeks + (week - section.weekLo);
  const load = section.load[index] * section.scale[row];
  return [load, section.imp[index] / 255];
}

// A corridor node is a place the answer changes: a stop group, or a junction
// where routes join or leave. Only the stop-group ones move load -- boardings
// and alightings happen there and nowhere else. The counts are the group's,
// so they cover every route stopping there, which on a shared street is more
// than the corridor the node sits on.
export function nodeFlow(data, era, node, week) {
  if (!node || node.g < 0) return null;
  const board = rawAt(data, "group", node.g, week, 0);
  const boardImp = rawAt(data, "group", node.g, week, 1);
  const alight = rawAt(data, "group", node.g, week, 2);
  const alightImp = rawAt(data, "group", node.g, week, 3);
  return {
    board: board + boardImp,
    boardImp,
    alight: alight + alightImp,
    alightImp,
    net: board + boardImp - alight - alightImp,
    name: data.meta.stop_groups.name[node.g],
  };
}

/* A corridor's drawn shape. `b` (scripts/build_corridor_curves.py) is a chain
   of cubic Beziers, flat: [lat0, lon0, then per segment c1, c2, end as lat, lon
   pairs]. This flattens it to a polyline of [lat, lon], `steps` points per
   segment, for drawing without curve support and for hit-testing. A bundle
   built before the curves has no `b`, and the raw road polyline `c` is used. */
export function corridorLatLngs(feature, steps = 6) {
  const b = feature.b;
  if (!b) return feature.c;
  const out = [[b[0], b[1]]];
  for (let i = 2; i + 5 < b.length; i += 6) {
    const y0 = b[i - 2];
    const x0 = b[i - 1];
    const [y1, x1, y2, x2, y3, x3] = b.slice(i, i + 6);
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const u = 1 - t;
      out.push([
        u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
      ]);
    }
  }
  return out;
}

export function corridorStats(data, era) {
  if (data.corridorStats[era]) return data.corridorStats[era];
  const startMonth = data.meta.months.indexOf("2020-04");
  const features = data.corridors[era];
  const section = data.sections[era];
  const nFeatures = features.length;
  const nMonths = data.meta.months.length;
  const monthly = new Float32Array(nFeatures * nMonths);
  const base = features.map((feature, index) => feature.b ?? data.meta.corridor_base[era]?.[index] ?? 0);
  const sample = [];
  const weekTotals = new Float32Array(nFeatures);

  for (let localWeek = 0; localWeek < section.nWeeks; localWeek += 1) {
    weekTotals.fill(0);
    const globalWeek = section.weekLo + localWeek;
    features.forEach((feature, featureIndex) => {
      for (const sectionId of feature.s) {
        const row = section.idIndex.get(sectionId);
        if (row !== undefined) {
          weekTotals[featureIndex] +=
            section.load[row * section.nWeeks + localWeek] * section.scale[row];
        }
      }
    });
    const monthIndex = data.monthIndex[globalWeek];
    if (monthIndex < 0) continue;
    for (let featureIndex = 0; featureIndex < nFeatures; featureIndex += 1) {
      monthly[featureIndex * nMonths + monthIndex] = weekTotals[featureIndex];
      if (weekTotals[featureIndex] > 0 && (localWeek & 3) === 0) {
        sample.push(weekTotals[featureIndex]);
      }
    }
  }

  const thresholds = data.meta.recovery_thresholds;
  const sustain = 3;
  const recovery = new Int16Array(nFeatures * thresholds.length);
  recovery.fill(-1);
  const monthLimit = nMonths - sustain + 1;
  for (let featureIndex = 0; featureIndex < nFeatures; featureIndex += 1) {
    const baseline = base[featureIndex] || 0;
    if (baseline < 500) {
      for (let threshold = 0; threshold < thresholds.length; threshold += 1) {
        recovery[featureIndex * thresholds.length + threshold] = -2;
      }
      continue;
    }
    for (let threshold = 0; threshold < thresholds.length; threshold += 1) {
      const target = baseline * thresholds[threshold];
      for (let month = Math.max(0, startMonth); month < monthLimit; month += 1) {
        let sustained = true;
        for (let offset = 0; offset < sustain && sustained; offset += 1) {
          sustained = monthly[featureIndex * nMonths + month + offset] >= target;
        }
        if (sustained) {
          recovery[featureIndex * thresholds.length + threshold] = month;
          break;
        }
      }
    }
  }

  const result = { base, recovery, sample };
  data.corridorStats[era] = result;
  return result;
}

// Precomputed over every era by scripts/build_pack_index.py. Without the
// index it falls back to the eras loaded so far, which can shift the ramp
// as more eras arrive.
export function corridorDomain(data) {
  if (data.corridorDom !== null) return data.corridorDom;
  if (Object.keys(data.corridors).length < Object.keys(data.meta.sections).length) {
    let values = [];
    for (const era of Object.keys(data.corridors)) values = values.concat(corridorStats(data, era).sample);
    values.sort((a, b) => a - b);
    return values.length ? values[Math.floor(values.length * 0.98)] : 1;
  }
  let values = [];
  for (const era of Object.keys(data.corridors)) {
    values = values.concat(corridorStats(data, era).sample);
  }
  values.sort((a, b) => a - b);
  data.corridorDom = values.length ? values[Math.floor(values.length * 0.98)] : 1;
  return data.corridorDom;
}

export function corridorColor(data, era, index, load, imp, view, recThresh) {
  if (view === "total") return ramp(SEQ_BLUE, Math.sqrt(load / corridorDomain(data)));
  if (view === "imp") return load > 0 ? ramp(SEQ_GOLD, imp / load) : null;
  const stats = corridorStats(data, era);
  if (view === "rel") {
    const baseline = stats.base[index];
    return baseline > 0 ? ramp(DIVERGING_RG, (load / baseline) / 2) : "#d8d7d2";
  }
  const month = stats.recovery[index * data.meta.recovery_thresholds.length + recThresh];
  if (month === -2) return REC_SMALL;
  if (month === -1) return REC_NEVER;
  const low = data.meta.recovery_baseline_month + 2;
  const span = data.meta.months.length - low;
  return ramp(SEQ_BLUE, (month - low) / span);
}

export function routesFor(data, level, key, week) {
  const era = eraForWeek(data, week) || Object.keys(data.meta.routes_by_era)[0];
  const byEra = data.meta.routes_by_era[era] || [];
  const groups = data.meta.stop_groups;
  let routeIndexes = [];
  if (level === "group") {
    routeIndexes = byEra[key] || [];
  } else {
    const field = groups[level];
    const routeSet = new Set();
    for (let group = 0; group < groups.n; group += 1) {
      if (field[group] === key) {
        for (const route of byEra[group] || []) routeSet.add(route);
      }
    }
    routeIndexes = [...routeSet];
  }
  return routeIndexes
    .map((index) => data.meta.route_names[index])
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function selectionSeries(data, keys, level = "group") {
  const real = new Float64Array(data.W);
  const imp = new Float64Array(data.W);
  for (const key of keys) {
    for (let week = 0; week < data.W; week += 1) {
      const imputed = imputedAt(data, level, key, week);
      real[week] += totalAt(data, level, key, week) - imputed;
      imp[week] += imputed;
    }
  }
  return { real, imp };
}

export function routeBoardings(data, route, week) {
  const row = data.routeW.ix.get(route);
  if (row === undefined) return null;
  const offset = (row * data.W + week) * 2;
  const scale = data.routeW.scale[row];
  return {
    real: data.routeW.q[offset] * scale,
    imp: data.routeW.q[offset + 1] * scale,
  };
}

// The same boardings across every week, for charting.
export function routeBoardingsSeries(data, route) {
  const real = new Float64Array(data.W);
  const imp = new Float64Array(data.W);
  const row = data.routeW.ix.get(route);
  if (row === undefined) return { real, imp };
  const scale = data.routeW.scale[row];
  for (let week = 0; week < data.W; week += 1) {
    const offset = (row * data.W + week) * 2;
    real[week] = data.routeW.q[offset] * scale;
    imp[week] = data.routeW.q[offset + 1] * scale;
  }
  return { real, imp };
}

export function routeOwnSeries(data, route) {
  const real = new Float64Array(data.W);
  const imp = new Float64Array(data.W);
  const byEra = data.routeSections[route] || {};
  const eras = [];
  for (const [era, sectionIds] of Object.entries(byEra)) {
    const section = data.sections[era];
    if (!section) continue;
    let count = 0;
    for (const sectionId of sectionIds) {
      const row = section.idIndex.get(sectionId);
      if (row === undefined) continue;
      count += 1;
      for (let localWeek = 0; localWeek < section.nWeeks; localWeek += 1) {
        const index = row * section.nWeeks + localWeek;
        const load = section.load[index] * section.scale[row];
        const imputed = load * (section.imp[index] / 255);
        real[section.weekLo + localWeek] += load - imputed;
        imp[section.weekLo + localWeek] += imputed;
      }
    }
    if (count) eras.push({ era, nsec: count });
  }
  return { real, imp, eras };
}

export function routeStreetSeries(data, route) {
  const real = new Float64Array(data.W);
  const imp = new Float64Array(data.W);
  const eras = [];
  for (const era of Object.keys(data.corridors)) {
    const section = data.sections[era];
    let count = 0;
    const directions = new Set();
    for (const feature of data.corridors[era]) {
      const mine = feature.r.filter((routeDirection) => routeDirection.split("|")[0] === route);
      if (!mine.length) continue;
      mine.forEach((routeDirection) => directions.add(routeDirection.split("|")[1]));
      const share = 1 / feature.r.length;
      for (const sectionId of feature.s) {
        const row = section.idIndex.get(sectionId);
        if (row === undefined) continue;
        for (let week = section.weekLo; week < section.weekLo + section.nWeeks; week += 1) {
          const index = row * section.nWeeks + (week - section.weekLo);
          const load = section.load[index] * section.scale[row] * share;
          const imputed = load * (section.imp[index] / 255);
          real[week] += load - imputed;
          imp[week] += imputed;
        }
      }
      count += feature.s.length;
    }
    if (count) eras.push({ era, nsec: count, dirs: [...directions] });
  }
  return { real, imp, eras };
}

/* Boardings on every line that runs along the same streets as `route`, this
   route included. The pack stores boardings per route, not per street, so each
   corridor section's load is converted with the average trip length of the
   route that runs it -- load divided by that route's own sections per rider in
   the same week. Sections repeat across corridor pieces, so each counts once. */
export function routeStreetBoardingsSeries(data, route) {
  const real = new Float64Array(data.W);
  const imp = new Float64Array(data.W);
  const sprCache = new Map();
  const sprFor = (line) => {
    if (!sprCache.has(line)) {
      const load = routeOwnSeries(data, line);
      const boardings = routeBoardingsSeries(data, line);
      const spr = new Float64Array(data.W);
      for (let week = 0; week < data.W; week += 1) {
        const trips = boardings.real[week] + boardings.imp[week];
        spr[week] = trips > 0 ? (load.real[week] + load.imp[week]) / trips : 0;
      }
      sprCache.set(line, spr);
    }
    return sprCache.get(line);
  };
  const seen = new Set();
  for (const era of Object.keys(data.corridors)) {
    const section = data.sections[era];
    if (!section) continue;
    for (const feature of data.corridors[era]) {
      if (!feature.r.some((routeDirection) => routeDirection.split("|")[0] === route)) continue;
      for (const sectionId of feature.s) {
        if (seen.has(sectionId)) continue;
        seen.add(sectionId);
        const row = section.idIndex.get(sectionId);
        if (row === undefined) continue;
        const spr = sprFor(data.sectionRoutes[sectionId]);
        for (let week = section.weekLo; week < section.weekLo + section.nWeeks; week += 1) {
          const perRider = spr[week];
          if (!(perRider > 0)) continue;
          const index = row * section.nWeeks + (week - section.weekLo);
          const load = section.load[index] * section.scale[row];
          const imputed = load * (section.imp[index] / 255);
          real[week] += (load - imputed) / perRider;
          imp[week] += imputed / perRider;
        }
      }
    }
  }
  return { real, imp };
}

/* ---------------------------------------------------------------- commute */
/* Average-weekday hourly profiles and inferred O-D flows, built by
   scripts/build_commute_pack.py from raw APC events (capture-corrected and
   NTD-calibrated) for a series of six-month snapshots from Feb 2019 to the
   latest complete month, so pre- and post-pandemic patterns are comparable.
   O-D files are fetched per snapshot on demand. */

// The commute view's index, available at startup so the view can be offered
// and its snapshots follow the time bar; the binaries arrive later.
function commuteShell(meta) {
  return {
    meta,
    hourly: {},
    rt: null,
    loaded: false,
    odCache: {},
    commuteDomains: {},
    baseIdx: meta.periods.findIndex((period) => period.id === meta.base),
  };
}

async function loadCommuteBinaries(commute) {
  const { meta } = commute;
  const hourly = {};
  await Promise.all(
    Object.entries(meta.hourly).map(async ([level, spec]) => {
      const q = await getBinary(spec.file, Uint16Array);
      hourly[level] = {
        q,
        scales: Float32Array.from(spec.scales),
        n: spec.n,
        nP: spec.nP,
      };
    }),
  );
  // Round-trip commute scores. Optional: a pack built before these existed
  // still loads, and the commute grid falls back to raw AM arrivals.
  const rt = {};
  await Promise.all(
    Object.entries(meta.rt || {}).map(async ([level, spec]) => {
      const q = await getBinary(spec.file, Uint16Array);
      rt[level] = { q, scales: Float32Array.from(spec.scales), n: spec.n, nP: spec.nP };
    }),
  );
  commute.hourly = hourly;
  commute.rt = Object.keys(rt).length ? rt : null;
  // Anything cached before the binaries arrived was computed from nothing.
  commute.commuteDomains = {};
  commute.rtTotals = {};
  commute.arrivalCache = {};
  commute.loaded = true;
}

/* Net round-trip commuters for one key: morning arrivals that come back in
   the evening, netted against the same pair's opposite direction so an
   all-day two-way corridor scores near zero. See round_trip() in
   scripts/build_commute_pack.py. Already avg-weekday riders, so unlike the
   hourly bins these are not divided by the snapshot's weekday count. */
export function commuteRt(commute, level, key, p) {
  const store = commute.rt?.[level];
  if (!store || key >= store.n) return null;
  const scale = store.scales[key];
  const base = (key * store.nP + p) * 2;
  return { work: store.q[base] * scale, home: store.q[base + 1] * scale };
}

// System totals per level/snapshot -- the denominators behind every "% of
// commuters" the grid shows. Cached like the colour domains.
export function commuteRtTotals(commute, level, p) {
  const store = commute.rt?.[level];
  if (!store) return null;
  const cache = commute.rtTotals || (commute.rtTotals = {});
  const cacheKey = `${level}|${p}`;
  if (cache[cacheKey]) return cache[cacheKey];
  let work = 0;
  let home = 0;
  for (let key = 0; key < store.n; key += 1) {
    const v = commuteRt(commute, level, key, p);
    work += v.work;
    home += v.home;
  }
  cache[cacheKey] = { work, home };
  return cache[cacheKey];
}

/* The 98th percentile of a round-trip end, for the concentration ramp. Same
   rule as commuteDomain: only keys the mode actually colours count, so a
   long tail of near-zero places cannot flatten the ramp. */
export function commuteRtDomain(commute, level, p, end) {
  const store = commute.rt?.[level];
  if (!store) return 1;
  const cache = commute.commuteDomains;
  const cacheKey = `rt.${end}|${level}|${p}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const values = [];
  for (let key = 0; key < store.n; key += 1) {
    const v = commuteRt(commute, level, key, p)[end];
    if (v > 0) values.push(v);
  }
  values.sort((a, b) => a - b);
  cache[cacheKey] = values.length ? values[Math.floor(values.length * 0.98)] : 1;
  return cache[cacheKey];
}

// [key][snapshot][measure][hour]; snapshot index into meta.periods.
export function commuteHourly(commute, level, key, p) {
  const store = commute.hourly[level];
  const period = commute.meta.periods[p];
  const scale = store.scales[key] / period.weekdays;
  const base = key * store.nP * 48 + p * 48;
  const bd = new Float64Array(24);
  const al = new Float64Array(24);
  for (let hour = 0; hour < 24; hour += 1) {
    bd[hour] = store.q[base + hour] * scale;
    al[hour] = store.q[base + 24 + hour] * scale;
  }
  return { bd, al };
}

// One O-D file per snapshot, fetched on first use and cached. The in-flight
// promise is cached too, so the prefetcher and the view share one download.
export function loadCommuteOD(commute, anchorId) {
  if (!commute.odCache[anchorId]) {
    const spec = commute.meta.od[anchorId];
    commute.odCache[anchorId] = getBinary(spec.am.file, Uint8Array).then((q) => ({
      q,
      view: new DataView(q.buffer),
      levels: spec.am.levels,
      offsets: {},
    }), (error) => {
      delete commute.odCache[anchorId];
      throw error;
    });
  }
  return commute.odCache[anchorId];
}

function levelOffsets(store, level) {
  if (store.offsets[level]) return store.offsets[level];
  const spec = store.levels[level];
  const offsets = new Uint32Array(spec.n);
  let pos = spec.offset;
  for (let key = 0; key < spec.n; key += 1) {
    offsets[key] = pos;
    pos += 2 + (store.q[pos] + store.q[pos + 1 + store.q[pos] * 6]) * 6;
  }
  store.offsets[level] = offsets;
  return offsets;
}

function readOdList(store, pos) {
  const count = store.q[pos];
  pos += 1;
  const entries = [];
  for (let index = 0; index < count; index += 1) {
    entries.push({
      g: store.q[pos] | (store.q[pos + 1] << 8),
      flow: store.view.getFloat32(pos + 2, true),
    });
    pos += 6;
  }
  return [entries, pos];
}

export function commuteODLists(store, level, key) {
  const spec = store.levels[level];
  if (!spec || key >= spec.n) return { in: [], out: [] };
  let pos = levelOffsets(store, level)[key];
  const inbound = readOdList(store, pos);
  pos = inbound[1];
  return { in: inbound[0], out: readOdList(store, pos)[0] };
}

/* Box selection: aggregate the member stop groups' top-K lists into one
   region "to here" (arrivals) / "from here" (departures) pair of lists, with
   flows between members of the region itself dropped. At tract/block-group
   level the entries are re-keyed through the group -> area mapping, so the
   map recolours in the active level's key space. */
export function commuteRegionLists(meta, store, keys, level) {
  const groups = meta.stop_groups;
  const field = level === "group" ? null : groups[level] || null;
  const keyOf = (g) => (field ? field[g] : g);
  const memberKeys = new Set(keys.map(keyOf).filter((k) => k >= 0));
  const inMap = new Map();
  const outMap = new Map();
  for (const key of keys) {
    const lists = commuteODLists(store, "group", key);
    for (const entry of lists.in) {
      const k = keyOf(entry.g);
      if (!(k >= 0) || memberKeys.has(k)) continue;
      inMap.set(k, (inMap.get(k) || 0) + entry.flow);
    }
    for (const entry of lists.out) {
      const k = keyOf(entry.g);
      if (!(k >= 0) || memberKeys.has(k)) continue;
      outMap.set(k, (outMap.get(k) || 0) + entry.flow);
    }
  }
  const sorted = (m) => [...m]
    .map(([g, flow]) => ({ g, flow }))
    .sort((a, b) => b.flow - a.flow);
  return { in: sorted(inMap), out: sorted(outMap), memberKeys };
}

export function commuteStats(commute, level, key, p) {
  if (!commute || key === undefined || key < 0) return null;
  const store = commute.hourly[level];
  if (!store || key >= store.n || p === undefined || p < 0) return null;
  const windows = commute.meta.windows;
  const now = commuteHourly(commute, level, key, p);
  const base = commuteHourly(commute, level, key, commute.baseIdx);
  const sumRange = (values, lo, hi) => {
    let sum = 0;
    for (let hour = lo; hour < hi; hour += 1) sum += values[hour];
    return sum;
  };
  const total = sumRange(now.bd, 0, 24) + sumRange(now.al, 0, 24);
  const baseTotal = sumRange(base.bd, 0, 24) + sumRange(base.al, 0, 24);
  const amIn = sumRange(now.al, windows.am[0], windows.am[1]);
  const amOut = sumRange(now.bd, windows.am[0], windows.am[1]);
  const pmOut = sumRange(now.bd, windows.pm[0], windows.pm[1]);
  const pmIn = sumRange(now.al, windows.pm[0], windows.pm[1]);
  let maxHour = 6;
  let maxValue = 0;
  let daySum = 0;
  for (let hour = 6; hour <= 21; hour += 1) {
    const value = now.bd[hour] + now.al[hour];
    daySum += value;
    if (value > maxValue) {
      maxValue = value;
      maxHour = hour;
    }
  }
  return {
    total,
    baseTotal,
    amIn,
    amOut,
    amNet: total > 0 ? (amIn - amOut) / total : NaN,
    pmNet: total > 0 ? (pmOut - pmIn) / total : NaN,
    peakRatio: daySum > 0 ? maxValue / (daySum / 16) : NaN,
    peakHour: maxHour,
  };
}

/* The one grey floor the whole commute view shares: under this much service
   no ramp can say anything honest about a place. */
export const COMMUTE_MIN = 20;

// "peakExcess" is peak-hour riding above a flat day, so a flat place sits at
// 0; every other field is read straight off the stats object.
function commuteStatValue(stats, field) {
  return field === "peakExcess" ? stats.peakRatio - 1 : stats[field];
}

/* A colour domain should describe the places the mode actually colours, so
   the floor that greys a place also keeps it out of the percentile --
   otherwise a handful of barely-served places with wild ratios stretch the
   ramp and wash out everything that is drawn. "total" is the exception: it
   also sizes the stop dots, which are drawn wherever there is any ridership
   at all, so widening its domain would shrink every dot on the map. */
function commuteStatIncluded(stats, field) {
  return field === "total" || stats.total >= COMMUTE_MIN;
}

/* The 98th percentile of a per-place statistic for one snapshot, cached per
   field/level/period. Both magnitude ramps normalise against this, which is
   what makes them comparable; it also sizes the stop dots. */
export function commuteDomain(commute, level, p, field = "total") {
  const cacheKey = `${field}|${level}|${p}`;
  if (commute.commuteDomains[cacheKey]) return commute.commuteDomains[cacheKey];
  const store = commute.hourly[level];
  if (!store) return 1;
  const values = [];
  for (let key = 0; key < store.n; key += 1) {
    const stats = commuteStats(commute, level, key, p);
    if (!stats || !commuteStatIncluded(stats, field)) continue;
    const value = commuteStatValue(stats, field);
    if (value > 0) values.push(value);
  }
  values.sort((a, b) => a - b);
  const domain = values.length ? values[Math.floor(values.length * 0.98)] : 1;
  commute.commuteDomains[cacheKey] = domain;
  return domain;
}

/* ------------------------------------------------------------------ lodes */
/* LEHD LODES8 OD main tables (JT01 primary jobs) aggregated to tracts by
   scripts/build_lodes_pack.py: jobs = primary jobs located in the tract,
   workers = employed residents. Values align with meta.json's tracts array.
   The commute snapshots are half-year months; the LODES year is the snapshot
   year clamped to what LEHD has published. */

export function lodesYearFor(lodes, periodId) {
  const year = Number(periodId.slice(0, 4));
  const years = lodes.years;
  return Math.min(Math.max(year, years[0]), years[years.length - 1]);
}

export function lodesAt(lodes, field, year, key) {
  const row = lodes[field]?.[year];
  return row && key < row.length ? row[key] : 0;
}

/* Raw morning marginals per key for one snapshot, cached per level/period.
   Only the fallback path uses these now -- a pack built before the
   round-trip bins existed -- but they are still the honest denominators for
   "share of morning arrivals". `end` is "work" (arrivals) or "home"
   (departures). */
export function lodesArrivals(commute, level, p, end = "work") {
  const cache = commute.arrivalCache || (commute.arrivalCache = {});
  const cacheKey = `${end}|${level}|${p}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const store = commute.hourly[level];
  if (!store) return { arrivals: new Float64Array(0), sum: 0 };
  const arrivals = new Float64Array(store.n);
  let sum = 0;
  for (let key = 0; key < store.n; key += 1) {
    const stats = commuteStats(commute, level, key, p);
    arrivals[key] = stats ? (end === "work" ? stats.amIn : stats.amOut) : 0;
    sum += arrivals[key];
  }
  cache[cacheKey] = { arrivals, sum };
  return cache[cacheKey];
}

/* ---------------------------------------------------------------- service */
/* Observed level of service and speed per route and per corridor, from the
   bus counters, for every month. Built by scripts/build_service_pack.py.
   Each month carries its periods -- weekday peak, daytime, night and weekend
   -- whose hours come from the GTFS schedule of the month's era, so all the
   months of one signup share them. */

export function isServiceView(view) {
  return view === "speed" || view === "los";
}

// Class breaks, upper bounds. Headway: shorter is better, darkest first.
export const HEADWAY_BREAKS = [10, 15, 20, 30, 60, Infinity];
export const HEADWAY_COLORS = ["#104281", "#1c5cab", "#3987e5", "#6da7ec", "#9ec5f4", "#cde2fb"];
// Speed: slow is red, fast is green, on the same ramp as the recovery views.
export const SPEED_BREAKS = [6, 8, 10, 12, 15, 20, Infinity];
export const SPEED_COLORS = DIVERGING_RG;
export const NO_SERVICE = "#c9c8c2";

function classColor(breaks, colors, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return colors[breaks.findIndex((limit) => value < limit || limit === Infinity)];
}

export function headwayColor(minutes) {
  return classColor(HEADWAY_BREAKS, HEADWAY_COLORS, minutes);
}

export function speedColor(mph) {
  return classColor(SPEED_BREAKS, SPEED_COLORS, mph);
}

/* The snapshot the map shows at a week: the latest one at or before it whose
   corridors are the ones drawn that week. Corridor arrays are per era, so a
   snapshot from the previous signup cannot colour this one's corridors; the
   first snapshot of the week's era stands in when none precedes it. */
export function serviceSnapshot(data, week) {
  const snapshots = data.service?.snapshots;
  const era = eraForWeek(data, week);
  if (!snapshots || !era) return null;
  const month = data.meta.weeks[week].slice(0, 7);
  // The entries themselves, not copies: a month's loaded data is kept on them.
  const inEra = snapshots.filter((snap) => snap.era === era);
  if (!inEra.length) return null;
  return inEra.filter((snap) => snap.id <= month).pop() || inEra[0];
}

/* What to draw while the time bar's month is still downloading: that month if
   it has arrived, else the nearest month of the same era that has, so the
   corridors keep their colours instead of blanking on every step of a scrub.
   Null only when nothing in the era is loaded yet. */
export function displaySnapshot(data, week) {
  const target = serviceSnapshot(data, week);
  if (!target || target.q) return target;
  const snapshots = data.service.snapshots;
  const at = snapshots.indexOf(target);
  let best = null;
  for (let index = 0; index < snapshots.length; index += 1) {
    const snap = snapshots[index];
    if (!snap.q || snap.era !== target.era) continue;
    if (!best || Math.abs(index - at) < Math.abs(snapshots.indexOf(best) - at)) best = snap;
  }
  return best || target;
}

/* ------------------------------------------------------------- prefetching */
/* Loads what the time bar is about to need, in the background, one piece at a
   time so it never competes with what the view needs right now (that goes
   through ensureData directly). Each call replaces the queue: when the time
   bar moves on, the old plan is dropped, though a fetch already started still
   finishes into the cache. Everything goes through ensureData and its shared
   promises, so nothing is fetched twice. */
export function createPrefetcher(data) {
  let queue = [];
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    while (queue.length) {
      const job = queue.shift();
      try {
        await job();
      } catch {
        // A background miss is not an error: the view refetches on demand.
      }
    }
    running = false;
  };
  return {
    schedule(jobs) {
      queue = jobs;
      run();
    },
    ensure: (needs) => () => ensureData(data, needs),
  };
}

/* The service months to fetch around the time bar: the ones ahead in the
   direction it is moving first, then the ones just behind. Crossing into
   another era also needs that era's corridors, so those ride along. */
export function serviceLookahead(data, week, direction, ahead = 6, behind = 2) {
  const snapshots = data.service?.snapshots;
  const target = serviceSnapshot(data, week);
  if (!snapshots || !target) return [];
  const at = snapshots.indexOf(target);
  const order = [];
  for (let step = 1; step <= Math.max(ahead, behind); step += 1) {
    if (step <= ahead) order.push(at + step * direction);
    if (step <= behind) order.push(at - step * direction);
  }
  return order
    .filter((index) => index >= 0 && index < snapshots.length)
    .map((index) => ({ serviceMonth: snapshots[index], eras: [snapshots[index].era] }));
}

/* An era's corridors, when the time bar is within `weeks` of crossing into it
   in the direction it is moving. */
export function eraLookahead(data, week, direction, weeks = 26) {
  const next = Math.max(0, Math.min(data.W - 1, week + direction * weeks));
  const here = eraForWeek(data, week);
  const there = eraForWeek(data, next);
  return there && there !== here ? [{ eras: [there] }] : [];
}

/* The commute O-D snapshots on either side of the current one, nearest
   first, ahead of the time bar before behind it. */
export function commuteOdLookahead(commute, periodIdx, direction, radius = 2) {
  if (!commute?.meta?.od) return [];
  const ids = [];
  for (let step = 0; step <= radius; step += 1) {
    for (const index of step === 0 ? [periodIdx] : [periodIdx + step * direction, periodIdx - step * direction]) {
      const period = commute.meta.periods[index];
      if (period && commute.meta.od[period.id] && !ids.includes(period.id)) ids.push(period.id);
    }
  }
  return ids;
}

// [corridor][period][headway, mph] in tenths for one month; null marks no
// data. The month's file is loaded on demand -- until then there is nothing.
export function corridorService(data, snap, index) {
  if (!snap?.q || index >= snap.n) return null;
  const { null: none } = data.service;
  const { q } = snap;
  const base = index * 8;
  const read = (offset) => (q[base + offset] === none ? null : q[base + offset] / 10);
  return {
    headway: [0, 1, 2, 3].map((p) => read(p * 2)),
    mph: [0, 1, 2, 3].map((p) => read(p * 2 + 1)),
  };
}

export function routeService(snap, route) {
  return snap?.routes?.[route] || null;
}

/* Windows are on the service day's extended clock (hours past 24 are after
   midnight), so they are folded onto a 24-hour day and printed as runs that
   may wrap midnight. Owl trips of the previous service day run on past 6am,
   so an after-midnight hour already claimed by another period of the same
   day type on the ordinary clock is left out: night reads "22:00-6:00", not
   "22:00-8:00" overlapping the morning. */
export function periodHours(period, periods = []) {
  const claimed = new Array(24).fill(false);
  for (const other of periods) {
    if (other === period || other.days !== period.days) continue;
    for (const [a, b] of other.windows) {
      for (let hour = a; hour < Math.min(b, 24); hour += 1) claimed[hour] = true;
    }
  }
  const on = new Array(24).fill(false);
  for (const [a, b] of period.windows) {
    for (let hour = a; hour < b; hour += 1) {
      if (hour < 24 || !claimed[hour % 24]) on[hour % 24] = true;
    }
  }
  if (!on.some(Boolean)) return "none detected";
  if (on.every(Boolean)) return "all day";
  const start = on.findIndex((value, hour) => value && !on[(hour + 23) % 24]);
  const runs = [];
  for (let step = 0; step < 24; step += 1) {
    const hour = (start + step) % 24;
    if (on[hour] && !on[(hour + 23) % 24]) runs.push([hour, hour]);
    if (on[hour]) runs[runs.length - 1][1] = (hour + 1) % 24;
  }
  return runs.sort((x, y) => x[0] - y[0]).map(([a, b]) => `${a}:00-${b || 24}:00`).join(", ");
}

export function formatHeadway(minutes) {
  if (minutes === null || minutes === undefined) return t("units.noService");
  return minutes >= 90
    ? t("units.hours", { n: (minutes / 60).toFixed(1) })
    : t("units.minutes", { n: Math.round(minutes) });
}

export function formatMph(mph) {
  return mph === null || mph === undefined
    ? t("units.noValue")
    : t("units.mph", { n: mph.toFixed(1) });
}
