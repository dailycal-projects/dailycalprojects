"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMMUTE_MIN,
  DIVERGING,
  DIVERGING_RG,
  REC_NEVER,
  REC_SMALL,
  SEQ_BLUE,
  SEQ_GREEN,
  SEQ_MAGENTA,
  colorFor,
  commuteDomain,
  commuteRt,
  commuteRtDomain,
  commuteRegionLists,
  commuteStats,
  corridorColor,
  corridorDomain,
  corridorStats,
  corridorService,
  divT,
  eraForWeek,
  escapeHtml,
  fmt,
  incomeAt,
  loadCommuteOD,
  lodesAt,
  lodesYearFor,
  ramp,
  recoveryAt,
  routeBoardings,
  SPEED_COLORS,
  sectionLoad,
  seqT,
  serviceSnapshot,
  speedColor,
  totalAt,
} from "../ridership-data";
import { mercator, prepareStory } from "./prepare";
import { T, t } from "../../lib/i18n";
import { strings } from "../../lib/strings";
import { themeElement } from "../../lib/host";

const CARTO_KEY = process.env.GATSBY_CARTO_KEY || "";
// Dot sizing, fills and outlines follow the explorer's renderDataLayer so a
// step here looks like the same view in the app.
const MAX_DOT_R = 13;
const EDGE = "#fcfcfb";
const NO_DATA = "#e8e7e2";
const MEMBER_EDGE = "#419c62";
const FADE_MS = 220;
const TRACE = "#9ec5f4";

const apM = (month) => t(`dates.monthsShort.${month - 1}`);
const fullM = (month) => t(`dates.monthsFull.${month - 1}`);

export function apDate(label) {
  const [year, month, day] = label.split("-").map(Number);
  return t("dates.monthDayYear", { month: apM(month), day, year });
}

function apMonth(label) {
  const [year, month] = label.split("-").map(Number);
  return t("dates.monthYear", { month: apM(month), year });
}

function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(themeElement()).getPropertyValue(name).trim() || fallback;
}

// The commute snapshot a week belongs to: the latest one at or before it.
function periodIndex(data, week) {
  const periods = data.commute.meta.periods;
  const month = data.meta.weeks[week].slice(0, 7);
  let index = 0;
  for (let i = 0; i < periods.length; i += 1) {
    if (periods[i].id <= month) index = i;
    else break;
  }
  return index;
}

// Inferred flows to and from the campus region. The O-D file is fetched once
// per snapshot and shared by every map on the page.
const odLoading = new Map();
function campusFlows(data, prep, period, onLoaded) {
  if (prep.odLists[period]) return prep.odLists[period];
  if (!odLoading.has(period)) {
    odLoading.set(period, loadCommuteOD(data.commute, period)
      .then((store) => {
        prep.odLists[period] = commuteRegionLists(data.meta, store, prep.campusKeys, "group");
      })
      .catch(() => {
        prep.odLists[period] = { in: [], out: [], memberKeys: new Set(prep.campusKeys) };
      }));
  }
  odLoading.get(period).then(onLoaded);
  return null;
}

/* Boardings on a set of routes over the latest 52 weeks, as a share of the 52
   weeks before March 2020. A year against a year, so seasons and school
   breaks cancel out. */
export function routesYearShare(data, routes) {
  const { weeks } = data.meta;
  const pre = weeks.findIndex((label) => label >= "2020-03-01");
  if (pre < 52) return NaN;
  let before = 0;
  let after = 0;
  for (const route of routes) {
    for (let week = pre - 52; week < pre; week += 1) {
      const value = routeBoardings(data, route, week);
      if (value) before += value.real + value.imp;
    }
    for (let week = data.W - 52; week < data.W; week += 1) {
      const value = routeBoardings(data, route, week);
      if (value) after += value.real + value.imp;
    }
  }
  return before > 0 ? after / before : NaN;
}

// Riders at a city over the four weeks starting at `week`, against the four
// weeks starting at the Feb 2020 baseline week: steadier than one week against
// one, and exactly 100% at the baseline itself.
function cityShare(data, city, week) {
  const from = Math.min(week, data.W - 4);
  let now = 0;
  for (let w = from; w < from + 4; w += 1) now += totalAt(data, "city", city, w);
  now /= 4;
  let base = 0;
  for (let w = data.BASE; w < data.BASE + 4; w += 1) base += totalAt(data, "city", city, w);
  base /= 4;
  return base > 0 ? now / base : NaN;
}

// The latest 52 weeks of data against the 52 weeks before March 2020, the
// basis the story's city figures are quoted on.
function cityYearShare(data, city) {
  const pre = data.meta.weeks.findIndex((label) => label >= "2020-03-01");
  if (pre < 52) return NaN;
  let before = 0;
  let after = 0;
  for (let w = pre - 52; w < pre; w += 1) before += totalAt(data, "city", city, w);
  for (let w = data.W - 52; w < data.W; w += 1) after += totalAt(data, "city", city, w);
  return before > 0 ? after / before : NaN;
}

export function relativeFor(data, level, keys, week) {
  let now = 0;
  let base = 0;
  for (const key of keys) {
    now += totalAt(data, level, key, week);
    base += totalAt(data, level, key, data.BASE);
  }
  return base > 0 ? now / base : NaN;
}

// Room left for the passages and the HUD when fitting a scene. On desktop the
// passages run down a left column; on a phone they cross the lower part of
// the screen, so the map is framed above them.
function fitPadding(width, height, layout) {
  if (layout === "figure") {
    return width >= 761
      ? { paddingTopLeft: [16, 16], paddingBottomRight: [290, 16] }
      : { paddingTopLeft: [12, 118], paddingBottomRight: [12, 12] };
  }
  const column = Math.max(24, width * 0.05) + 400 + 24;
  if (width >= 1100) return { paddingTopLeft: [column, 24], paddingBottomRight: [300, 24] };
  if (width >= 761) return { paddingTopLeft: [column, 132], paddingBottomRight: [24, 24] };
  return { paddingTopLeft: [12, 112], paddingBottomRight: [12, Math.round(height * 0.4)] };
}


/* ---- story-only framings -------------------------------------------------
   Three things the copy asks for that the explorer expresses through its
   control panel rather than through a view: the income highlight, the two
   commute measures, and speed on corridors. They are computed here so the
   explorer's own code stays the single source for everything else. */

const memo = new WeakMap();
function cached(data, key, build) {
  let table = memo.get(data);
  if (!table) {
    table = new Map();
    memo.set(data, table);
  }
  if (!table.has(key)) table.set(key, build());
  return table.get(key);
}

/* The areas in the top or bottom two deciles of ACS median household income.
   The story dims everything else rather than recolouring, so the recovery
   ramp underneath stays readable and the two passages compare like with like. */
function incomeGroup(data, level, which) {
  return cached(data, `income|${level}|${which}`, () => {
    const n = level === "tract" ? data.meta.tracts.length : data.meta.bgroups.length;
    const rows = [];
    for (let key = 0; key < n; key += 1) {
      const income = incomeAt(data, level, key);
      if (income) rows.push([key, income.med]);
    }
    rows.sort((a, b) => a[1] - b[1]);
    const cut = Math.floor(rows.length / 5) || rows.length;
    const picked = which === "high" ? rows.slice(-cut) : rows.slice(0, cut);
    return new Set(picked.map(([key]) => key));
  });
}

// The median compare ratio over drawable tracts, so the diverging ramp is
// centred on the typical tract rather than on 1.0.
function compareMedian(data, level, p) {
  return cached(data, `compareMedian|${level}|${p}`, () => {
    const values = [];
    const n = level === "tract" ? data.meta.tracts.length : 0;
    for (let key = 0; key < n; key += 1) {
      const ratio = compareRatio(data, level, key, p);
      if (ratio > 0) values.push(ratio);
    }
    values.sort((a, b) => a - b);
    return values.length ? values[Math.floor(values.length / 2)] : 1;
  });
}

function acHomeAt(data, level, key, p) {
  const stats = commuteStats(data.commute, level, key, p);
  if (!stats || stats.total < COMMUTE_MIN) return null;
  const rt = commuteRt(data.commute, level, key, p);
  return rt ? rt.home : stats.amOut;
}

function compareRatio(data, level, key, p) {
  const home = acHomeAt(data, level, key, p);
  if (home === null || !data.lodes) return NaN;
  const year = lodesYearFor(data.lodes, data.commute.meta.periods[p].id);
  const workers = lodesAt(data.lodes, "workers", year, key);
  return workers > 0 ? home / workers : NaN;
}

// A share as the explorer's compare legend prints it: a second decimal only
// where the first would round a small share away.
const sharePct = (value) => (100 * value).toFixed(value < 0.01 ? 2 : 1);

/* "AC Transit commuters" is that count on the magenta ramp; "Compare" is the
   same count over the tract's LODES employed residents, on the diverging ramp
   centred on the median tract. Both are tract-level, which is as fine as
   LODES publishes. */
function commuteMeasureColor(data, level, key, week, measure) {
  if (level !== "tract" || !data.commute) return null;
  const p = periodIndex(data, week);
  if (measure === "acHome") {
    const home = acHomeAt(data, level, key, p);
    if (home === null) return null;
    return ramp(SEQ_MAGENTA, seqT(home, commuteRtDomain(data.commute, level, p, "home")));
  }
  const ratio = compareRatio(data, level, key, p);
  if (!Number.isFinite(ratio)) return null;
  return ramp(DIVERGING, divT(ratio / compareMedian(data, level, p)));
}

/* The service month a week should show, stepping back to the nearest month
   whose file has actually loaded. The traffic section scrubs across six years
   and only a sample of months is fetched, so without this the corridors would
   blink out between the passages' own anchors. */
function loadedSnapshot(data, week) {
  const snap = serviceSnapshot(data, week);
  if (!snap || snap.q) return snap;
  const era = eraForWeek(data, week);
  const inEra = (data.service?.snapshots || []).filter((entry) => entry.era === era && entry.q);
  if (!inEra.length) return null;
  const before = inEra.filter((entry) => entry.id <= snap.id).pop();
  return before || inEra[0];
}

/* Quantiles of a weighted sample, by linear interpolation between neighbours
   placed at the midpoint of the weight each one occupies. `samples` is
   sorted in place. */
function weightedQuantiles(samples, ps) {
  if (!samples.length) return null;
  samples.sort((a, b) => a.value - b.value);
  let total = 0;
  for (const sample of samples) total += sample.weight;
  if (!(total > 0)) return null;
  const at = new Float64Array(samples.length);
  let cumulative = 0;
  samples.forEach((sample, index) => {
    at[index] = (cumulative + sample.weight / 2) / total;
    cumulative += sample.weight;
  });
  return ps.map((p) => {
    if (p <= at[0]) return samples[0].value;
    const last = samples.length - 1;
    if (p >= at[last]) return samples[last].value;
    let index = 1;
    while (at[index] < p) index += 1;
    const span = at[index] - at[index - 1];
    const t = span > 0 ? (p - at[index - 1]) / span : 0;
    return samples[index - 1].value + t * (samples[index].value - samples[index - 1].value);
  });
}

/* Berkeley's observed bus speed, week by week, as the spread across its
   corridors rather than as one number: the 10th, 50th and 90th percentile of
   corridor speed, weighted by bus-km, so a busy arterial counts for more than
   a lightly served side street. A median says what a typical bus-kilometre
   does; the tails say how differently the slowest and fastest streets behave,
   which an average hides. Weeks between loaded months take the last month's
   figures. */
const SPEED_PS = [0.1, 0.5, 0.9];
// Fixed so the sparkline is comparable week to week; widened from the old
// average-only [6, 16] to hold both tails.
// A series as a share of its own value in the baseline week, so a quantity in
// mph and a quantity in riders can be read on one axis against Feb. 2020.
function relativeToBase(series, base) {
  const level = series[base];
  const out = new Float32Array(series.length);
  if (!Number.isFinite(level) || level <= 0) {
    out.fill(NaN);
    return out;
  }
  for (let i = 0; i < series.length; i += 1) {
    out[i] = Number.isFinite(series[i]) ? series[i] / level : NaN;
  }
  return out;
}

function berkeleySpeedSeries(data, prep, period = "day") {
  return cached(data, `speed|${period}`, () => {
    const series = { p10: new Float32Array(data.W), p50: new Float32Array(data.W), p90: new Float32Array(data.W) };
    series.p10.fill(NaN);
    series.p50.fill(NaN);
    series.p90.fill(NaN);
    let last = null;
    for (let week = 0; week < data.W; week += 1) {
      const snap = loadedSnapshot(data, week);
      const era = eraForWeek(data, week);
      const meta = era ? prep.corridorMeta[era] : null;
      if (snap?.q && meta) {
        const ix = Math.max(0, snap.periods.findIndex((entry) => entry.id === period));
        const hours = snap.periods[ix].windows.reduce((sum, [lo, hi]) => sum + (hi - lo), 0);
        const days = snap.periods[ix].days === "weekend" ? 2 : 5;
        const samples = [];
        for (let index = 0; index < snap.n && index < meta.length; index += 1) {
          if (!meta[index].inBerkeley) continue;
          const service = corridorService(data, snap, index);
          const mph = service?.mph[ix];
          const headway = service?.headway[ix];
          if (!(mph > 0) || !(headway > 0)) continue;
          samples.push({ value: mph, weight: ((hours * days * 60) / headway) * meta[index].length });
        }
        const quantiles = weightedQuantiles(samples, SPEED_PS);
        if (quantiles) last = quantiles;
      }
      if (last) {
        series.p10[week] = last[0];
        series.p50[week] = last[1];
        series.p90[week] = last[2];
      }
    }
    return series;
  });
}

function areaColorFor(data, level, key, week, scene) {
  if (scene.commuteMeasure) return commuteMeasureColor(data, level, key, week, scene.commuteMeasure);
  return colorFor(data, level, key, week, scene.view, scene.recThresh);
}

function createEngine({ map, container, canvas, svg, tip, getData, layout, onHud }) {
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const alpha = { dots: 0, areas: 0, routes: 0, outside: 1, mask: 0, trace: 0 };
  // The routes a step traces stay set while the trace fades out.
  let traceRoutes = null;
  const target = { ...alpha };
  let scene = null;
  let week = 0;
  let card = null;
  let boundsKey = null;
  let frame = 0;
  let lastTime = 0;
  let hits = { dots: [], areas: [] };
  let removed = false;
  let hudKey = "";

  const retarget = () => {
    target.dots = scene.level === "group" ? 1 : 0;
    target.areas = scene.level === "bgroup" || scene.level === "tract" ? 1 : 0;
    target.routes = scene.routes ? 1 : 0;
    target.outside = scene.mask ? 0 : 1;
    target.mask = scene.mask ? 1 : 0;
    target.trace = scene.trace ? 1 : 0;
    if (scene.trace) traceRoutes = new Set(scene.trace);
  };

  const fly = (animate) => {
    if (!scene?.boundsLatLng) return;
    const padding = fitPadding(container.clientWidth, container.clientHeight, layout);
    if (!animate || reduceMotion) {
      map.fitBounds(scene.boundsLatLng, { ...padding, animate: false });
    } else {
      map.flyToBounds(scene.boundsLatLng, { ...padding, duration: 1.3, easeLinearity: 0.2 });
    }
  };

  const request = () => {
    if (!frame && !removed) frame = window.requestAnimationFrame(tick);
  };

  const tick = (now) => {
    frame = 0;
    const dt = lastTime ? Math.min(64, now - lastTime) : 16;
    const step = 1 - Math.exp(-dt / FADE_MS);
    let settling = false;
    for (const key of Object.keys(alpha)) {
      const delta = target[key] - alpha[key];
      if (Math.abs(delta) > 0.004) {
        alpha[key] += delta * step;
        settling = true;
      } else {
        alpha[key] = target[key];
      }
    }
    draw();
    if (settling) {
      lastTime = now;
      request();
    } else {
      lastTime = 0;
    }
  };

  const draw = () => {
    const data = getData();
    const size = map.getSize();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size.x * dpr) || canvas.height !== Math.round(size.y * dpr)) {
      canvas.width = Math.round(size.x * dpr);
      canvas.height = Math.round(size.y * dpr);
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size.x, size.y);
    if (!data || !scene) {
      svg.innerHTML = "";
      return;
    }
    const prep = prepareStory(data);
    const zoom = map.getZoom();
    const k = 2 ** zoom;
    const center = map.getCenter();
    const [cx, cy] = mercator(center.lat, center.lng);
    const tx = size.x / 2 - cx * k;
    const ty = size.y / 2 - cy * k;
    const onScreen = (bounds, pad) => (
      bounds[2] * k + tx >= -pad && bounds[0] * k + tx <= size.x + pad
      && bounds[3] * k + ty >= -pad && bounds[1] * k + ty <= size.y + pad
    );
    const tracePath = (path, pts) => {
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i] * k + tx;
        const y = pts[i + 1] * k + ty;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
    };

    const berkeley = new Path2D();
    tracePath(berkeley, prep.berkeley);
    berkeley.closePath();
    const outside = new Path2D();
    outside.rect(-10, -10, size.x + 20, size.y + 20);
    outside.addPath(berkeley);

    // Outside Berkeley the basemap is dimmed and the data faded out, so the
    // opening reads as one city; zooming out lifts both.
    if (alpha.mask > 0.01) {
      context.save();
      context.globalAlpha = 0.6 * alpha.mask;
      context.fillStyle = cssVar("--plane", "#f9f9f7");
      context.fill(outside, "evenodd");
      context.restore();
    }

    const regions = alpha.outside >= 0.995
      ? [["all", 1]]
      : alpha.outside <= 0.005 ? [["in", 1]] : [["in", 1], ["out", alpha.outside]];
    const inRegion = (region, drawLayer) => {
      context.save();
      if (region === "in") context.clip(berkeley);
      if (region === "out") context.clip(outside, "evenodd");
      drawLayer();
      context.restore();
    };

    hits = { dots: [], areas: [] };
    const areaLevel = scene.level === "tract" ? "tract" : "bgroup";
    const highlight = scene.income ? incomeGroup(data, areaLevel, scene.income) : null;
    if (alpha.areas > 0.01) {
      const areas = [];
      for (const area of prep.areasByLevel[areaLevel] || prep.areas) {
        if (!onScreen(area.bounds, 4)) continue;
        const path = new Path2D();
        for (const ring of area.rings) {
          tracePath(path, ring);
          path.closePath();
        }
        const color = areaColorFor(data, areaLevel, area.key, week, scene);
        const dim = highlight && !highlight.has(area.key);
        areas.push({ path, color, key: area.key, inBerkeley: area.inBerkeley, dim });
      }
      for (const [region, regionAlpha] of regions) {
        inRegion(region, () => {
          const layerAlpha = regionAlpha * alpha.areas;
          context.strokeStyle = EDGE;
          for (const area of areas) {
            const base = area.color ? 0.68 : 0.15;
            context.globalAlpha = base * (area.dim ? 0.07 : 1) * layerAlpha;
            context.fillStyle = area.color || NO_DATA;
            context.fill(area.path, "evenodd");
            // While a decile is highlighted its tracts are outlined, so
            // neighbours in the same decile read as separate places rather
            // than as one mass, and everything else lets its border fade with
            // its fill instead of leaving a full-strength grid behind.
            context.globalAlpha = (area.dim ? 0.1 : 1) * layerAlpha;
            context.lineWidth = highlight && !area.dim ? 1.2 : 0.7;
            context.stroke(area.path);
          }
        });
      }
      if (alpha.areas > 0.5) {
        hits.areas = areas.filter((area) => area.inBerkeley || alpha.outside > 0.5);
      }
    }

    const era = eraForWeek(data, week);
    if (alpha.routes > 0.01 && era && prep.corridors[era]) {
      corridorStats(data, era);
      const domain = corridorDomain(data);
      const features = data.corridors[era];
      const geometry = prep.corridors[era];
      // The commute and recovery steps keep corridors on the load ramp, as the
      // explorer does for views that only recolour areas.
      const corridorView = scene.view === "rel" ? "rel" : "total";
      // Speed is a property of the road, not of how many people are on it, so
      // the corridor keeps its load-derived width and only its colour changes.
      const snap = scene.view === "speed" ? loadedSnapshot(data, week) : null;
      const periodIx = snap
        ? Math.max(0, snap.periods.findIndex((entry) => entry.id === (scene.period || "day")))
        : 0;
      const lines = [];
      for (let index = 0; index < features.length; index += 1) {
        if (!onScreen(geometry[index].bounds, 20)) continue;
        let load = 0;
        let imp = 0;
        for (const sectionId of features[index].s) {
          const [value, imputed] = sectionLoad(data, era, sectionId, week);
          load += value;
          imp += value * imputed;
        }
        if (load <= 0 && corridorView !== "rel" && !snap) continue;
        let color;
        if (snap) {
          const service = snap.q ? corridorService(data, snap, index) : null;
          color = service ? speedColor(service.mph[periodIx]) : null;
        } else {
          color = corridorColor(data, era, index, load, imp, corridorView, scene.recThresh);
        }
        if (!color) continue;
        const thickness = Math.min(1, Math.sqrt(load / domain));
        // As in the explorer, speed colours are classes and a faint one reads
        // as the wrong class, so they draw near-opaque whatever the load.
        const opacity = snap ? 0.85 : 0.32 + thickness * 0.35;
        lines.push({ pts: geometry[index].pts, color, thickness, opacity });
      }
      for (const [region, regionAlpha] of regions) {
        inRegion(region, () => {
          // Flat ends: the curved pieces butt together at shared nodes, and
          // round ends would overlap there into darker beads.
          context.lineCap = "butt";
          context.lineJoin = "round";
          for (const line of lines) {
            context.beginPath();
            tracePath(context, line.pts);
            context.globalAlpha = line.opacity * regionAlpha * alpha.routes;
            context.strokeStyle = line.color;
            context.lineWidth = 1 + line.thickness * 7;
            context.stroke();
          }
        });
      }
    }

    // A traced line: the step names routes (the 1T, and the 1 it replaced),
    // and their corridors draw on top in the accent colour, over areas or
    // corridors alike.
    if (alpha.trace > 0.01 && traceRoutes && era && prep.corridors[era]) {
      const features = data.corridors[era];
      const geometry = prep.corridors[era];
      for (const [region, regionAlpha] of regions) {
        inRegion(region, () => {
          context.lineCap = "round";
          context.lineJoin = "round";
          for (let index = 0; index < features.length; index += 1) {
            if (!features[index].r.some((rd) => traceRoutes.has(rd.split("|")[0]))) continue;
            if (!onScreen(geometry[index].bounds, 20)) continue;
            context.beginPath();
            tracePath(context, geometry[index].pts);
            // A dark casing under a light core reads over both the red and the
            // green ends of the recovery ramp.
            context.globalAlpha = 0.9 * regionAlpha * alpha.trace;
            context.strokeStyle = "#0b0b0b";
            context.lineWidth = 8;
            context.stroke();
            context.globalAlpha = regionAlpha * alpha.trace;
            context.strokeStyle = TRACE;
            context.lineWidth = 4.5;
            context.stroke();
          }
        });
      }
      context.globalAlpha = 1;
    }

    if (alpha.dots > 0.01) {
      const groups = data.meta.stop_groups;
      const commute = scene.view === "commute" ? data.commute : null;
      let domain = data.domains.group;
      let p = 0;
      let flows = null;
      let flowMax = 1;
      let members = null;
      if (commute) {
        p = periodIndex(data, week);
        domain = commuteDomain(commute, "group", p);
        const lists = scene.focus ? campusFlows(data, prep, commute.meta.periods[p].id, request) : null;
        if (lists) {
          const entries = scene.focus.mode === "from" ? lists.out : lists.in;
          flows = new Map(entries.map((entry) => [entry.g, entry.flow]));
          flowMax = entries.length ? entries[0].flow : 1;
          members = lists.memberKeys;
        }
      }
      // A phone frames the same city in a third of the pixels.
      const dotScale = size.x < 761 ? 0.65 : 1;
      const dots = [];
      for (let key = 0; key < groups.n; key += 1) {
        const regionAlpha = prep.groupInBerkeley[key] ? 1 : alpha.outside;
        if (regionAlpha < 0.01) continue;
        const x = prep.gx[key] * k + tx;
        const y = prep.gy[key] * k + ty;
        if (x < -16 || y < -16 || x > size.x + 16 || y > size.y + 16) continue;
        let value;
        let color = null;
        let member = false;
        let sizeDomain = domain;
        if (commute) {
          if (!flows) continue;
          if (members.has(key)) {
            const stats = commuteStats(commute, "group", key, p);
            value = stats ? stats.total : 0;
            member = true;
          } else {
            value = flows.get(key) || 0;
            sizeDomain = flowMax;
            color = value ? ramp(SEQ_GREEN, Math.sqrt(value / flowMax)) : null;
          }
        } else {
          value = totalAt(data, "group", key, week);
          color = colorFor(data, "group", key, week, scene.view, scene.recThresh);
        }
        if (!(value > 0) || !(color || member)) continue;
        const r = dotScale * Math.min(MAX_DOT_R, 2.5 + Math.sqrt(value / sizeDomain) * 11);
        dots.push({ x, y, r, color, member, key, value, alpha: regionAlpha });
      }
      // Largest first, so a small stop beside a busy one is not buried.
      dots.sort((first, second) => second.r - first.r);
      for (const dot of dots) {
        context.beginPath();
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        context.globalAlpha = (dot.color ? 0.82 : 0.35) * dot.alpha * alpha.dots;
        context.fillStyle = dot.color || NO_DATA;
        context.fill();
        context.globalAlpha = dot.alpha * alpha.dots;
        context.strokeStyle = dot.member ? MEMBER_EDGE : EDGE;
        context.lineWidth = dot.member ? 1.5 : 1;
        context.stroke();
      }
      if (alpha.dots > 0.5) hits.dots = dots.filter((dot) => dot.alpha > 0.5).reverse();
    }

    if (alpha.mask > 0.01) {
      context.save();
      context.globalAlpha = 0.85 * alpha.mask;
      context.strokeStyle = cssVar("--text-secondary", "#52514e");
      context.lineWidth = 1.4;
      context.setLineDash([5, 4]);
      context.stroke(berkeley);
      context.restore();
    }
    context.globalAlpha = 1;

    drawAnnotations(data, (lat, lon) => {
      const [x, y] = mercator(lat, lon);
      return [x * k + tx, y * k + ty];
    }, size);
  };

  // Callouts are the script's "line to" directions: a leader from the passage
  // to the place it names, labelled with that place's live figure. Marks are
  // labels without a leader.
  const drawAnnotations = (data, project, size) => {
    const parts = [];
    const label = (x, y, lines, anchorRight) => {
      const flip = anchorRight || x > size.x - 210;
      const lx = flip ? x - 17 : x + 17;
      const anchor = flip ? "end" : "start";
      lines.forEach((line, index) => {
        parts.push(
          `<text x="${lx}" y="${y - 3 + index * 15}" text-anchor="${anchor}" class="${index ? "sub" : "name"}">${escapeHtml(line)}</text>`,
        );
      });
    };
    const ring = (x, y) => {
      parts.push(`<circle cx="${x}" cy="${y}" r="12" class="ring" />`);
    };

    // A tract is ringed for its share, which is what the passage quotes, so
    // the figure takes the place of the tract number.
    for (const place of scene.markPlaces || []) {
      const [x, y] = project(place.lat, place.lon);
      ring(x, y);
      if (place.level === "tract" && scene.commuteMeasure) {
        const ratio = place.keys.length
          ? compareRatio(data, "tract", place.keys[0], periodIndex(data, week)) : NaN;
        if (Number.isFinite(ratio)) label(x, y, [t("storyMap.calloutOfTraffic", { pct: sharePct(ratio) })]);
      } else {
        label(x, y, [place.label]);
      }
    }

    const place = scene.calloutPlace;
    if (place && card && card.alpha > 0.01) {
      const [x, y] = project(place.lat, place.lon);
      const bounds = container.getBoundingClientRect();
      const rect = {
        left: card.rect.left - bounds.left,
        right: card.rect.right - bounds.left,
        top: card.rect.top - bounds.top,
        bottom: card.rect.bottom - bounds.top,
      };
      let start = null;
      if (rect.right + 12 < x) {
        start = [rect.right, Math.max(rect.top + 22, Math.min(rect.bottom - 22, y))];
      } else if (rect.top > y + 16) {
        start = [Math.max(rect.left + 22, Math.min(rect.right - 22, x)), rect.top];
      } else if (rect.bottom < y - 16) {
        start = [Math.max(rect.left + 22, Math.min(rect.right - 22, x)), rect.bottom];
      }
      parts.push(`<g style="opacity:${card.alpha.toFixed(3)}">`);
      if (start) {
        const dx = x - start[0];
        const dy = y - start[1];
        const length = Math.hypot(dx, dy) || 1;
        const endX = x - (dx / length) * 13;
        const endY = y - (dy / length) * 13;
        parts.push(`<line x1="${start[0]}" y1="${start[1]}" x2="${endX}" y2="${endY}" class="leader" />`);
        parts.push(`<circle cx="${start[0]}" cy="${start[1]}" r="2.5" class="leader-end" />`);
      }
      ring(x, y);
      let figure = "";
      if (place.routes) {
        const share = routesYearShare(data, place.routes);
        if (Number.isFinite(share)) figure = t("storyMap.calloutPrePandemic", { pct: Math.round(share * 100) });
      } else {
        const share = relativeFor(data, place.level, place.keys, week);
        if (Number.isFinite(share)) figure = t("storyMap.calloutOfBaseline", { pct: Math.round(share * 100) });
      }
      label(x, y, figure ? [place.label, figure] : [place.label], start && start[0] > x);
      parts.push("</g>");
    }
    svg.setAttribute("viewBox", `0 0 ${size.x} ${size.y}`);
    svg.innerHTML = parts.join("");
  };

  const tooltipHtml = (hit, kind) => {
    const data = getData();
    const { meta } = data;
    if (kind === "dot") {
      const name = meta.stop_groups.name[hit.key];
      if (scene.view === "commute") {
        return `<b>${escapeHtml(name)}</b><div>${escapeHtml(hit.member
          ? t("storyMap.tipCommuteMember")
          : t("storyMap.tipInferredRiders", { n: fmt(hit.value) }))}</div>`;
      }
      const share = relativeFor(data, "group", [hit.key], week);
      return `<b>${escapeHtml(name)}</b>
        <div>${escapeHtml(t("storyMap.tipRidersThisWeek", { n: fmt(hit.value) }))}</div>
        <div>${escapeHtml(Number.isFinite(share)
          ? t("storyMap.calloutOfBaseline", { pct: Math.round(share * 100) })
          : t("storyMap.tipNoBaseline"))}</div>`;
    }
    // The commute areas are tracts, which the block group tooltip below
    // would misname and miscount.
    if (scene.view === "commute") return null;
    if (scene.view === "recovery") {
      const month = recoveryAt(data, "bgroup", hit.key, scene.recThresh);
      const text = month === -2 ? t("storyMap.tipTooLittle")
        : month === -1 ? t("storyMap.tipNotYet")
          : t("storyMap.tipRecoveredIn", { month: apMonth(meta.months[month]) });
      return `<b>${escapeHtml(t("storyMap.tipBlockGroup", { id: meta.bgroups[hit.key] }))}</b>`
        + `<div>${escapeHtml(text)}</div>`;
    }
    const share = relativeFor(data, "bgroup", [hit.key], week);
    return `<b>${escapeHtml(t("storyMap.tipBlockGroup", { id: meta.bgroups[hit.key] }))}</b>
      <div>${escapeHtml(t("storyMap.tipRidersThisWeek",
        { n: fmt(totalAt(data, "bgroup", hit.key, week)) }))}</div>
      <div>${escapeHtml(Number.isFinite(share)
        ? t("storyMap.calloutOfBaseline", { pct: Math.round(share * 100) })
        : t("storyMap.tipNoBaseline"))}</div>`;
  };

  const onMove = (event) => {
    if (!scene || !getData()) return;
    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    let html = null;
    const dot = hits.dots.find((candidate) => Math.hypot(candidate.x - x, candidate.y - y) <= candidate.r + 1);
    if (dot) {
      html = tooltipHtml(dot, "dot");
    } else if (hits.areas.length) {
      const dpr = window.devicePixelRatio || 1;
      context.setTransform(1, 0, 0, 1, 0, 0);
      const area = hits.areas.find((candidate) => context.isPointInPath(candidate.path, x * dpr, y * dpr, "evenodd"));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (area) html = tooltipHtml(area, "area");
    }
    if (!html) {
      tip.hidden = true;
      return;
    }
    tip.innerHTML = html;
    tip.hidden = false;
    const flip = x > bounds.width - 240;
    tip.style.left = `${flip ? x - 14 - tip.offsetWidth : x + 14}px`;
    tip.style.top = `${Math.max(8, y - 12)}px`;
  };
  const onLeave = () => { tip.hidden = true; };
  container.addEventListener("mousemove", onMove);
  container.addEventListener("mouseleave", onLeave);
  map.on("move zoom resize", request);

  return {
    update(nextScene, nextWeek, nextCard) {
      if (removed || !nextScene) return;
      if (nextScene !== scene) {
        const first = !scene;
        scene = nextScene;
        retarget();
        if (first) {
          Object.assign(alpha, target);
        }
        if (scene.bounds !== boundsKey) {
          boundsKey = scene.bounds;
          fly(!first);
        }
      }
      week = nextWeek;
      card = nextCard || null;
      const key = `${scene.view}|${scene.level}|${scene.series}|${scene.focus?.mode}|${scene.commuteMeasure}|${week}`;
      if (key !== hudKey) {
        hudKey = key;
        onHud({ scene, week });
      }
      request();
    },
    refit() {
      map.invalidateSize({ animate: false });
      fly(false);
      request();
    },
    redraw: request,
    remove() {
      removed = true;
      if (frame) window.cancelAnimationFrame(frame);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      map.off("move zoom resize", request);
    },
  };
}

function Sparkline({ series, week, meta, domain = null, reference = 1, band = null,
  compare = null }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !series) return;
    const width = canvas.clientWidth || 232;
    const height = 58;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const ink = cssVar("--text-primary", "#0b0b0b");
    const muted = cssVar("--text-muted", "#84837c");
    const rule = cssVar("--rule", "#e4e3de");
    const accent = cssVar("--accent", "#2a78d6");
    const top = 4;
    const bottom = 14;
    const [lo, hi] = domain || [0, 1.4];
    const x = (index) => (index / (series.length - 1)) * width;
    const y = (value) => top
      + (1 - (Math.min(hi, Math.max(lo, value)) - lo) / (hi - lo)) * (height - top - bottom);

    // A band between two series, drawn first so the line sits on top of it.
    if (band) {
      const [low, high] = band;
      context.fillStyle = accent;
      context.globalAlpha = 0.1;
      context.beginPath();
      let started = false;
      for (let index = 0; index < low.length; index += 1) {
        if (!Number.isFinite(low[index]) || !Number.isFinite(high[index])) continue;
        if (!started) context.moveTo(x(index), y(high[index]));
        else context.lineTo(x(index), y(high[index]));
        started = true;
      }
      for (let index = low.length - 1; index >= 0; index -= 1) {
        if (!Number.isFinite(low[index]) || !Number.isFinite(high[index])) continue;
        context.lineTo(x(index), y(low[index]));
      }
      context.closePath();
      context.fill();
      context.globalAlpha = 1;
    }

    if (reference !== null && reference > lo && reference < hi) {
      context.strokeStyle = rule;
      context.setLineDash([3, 3]);
      context.beginPath();
      context.moveTo(0, y(reference));
      context.lineTo(width, y(reference));
      context.stroke();
      context.setLineDash([]);
    }

    const trace = (source, from, to) => {
      context.beginPath();
      let started = false;
      for (let index = from; index <= to; index += 1) {
        if (!Number.isFinite(source[index])) continue;
        if (!started) context.moveTo(x(index), y(source[index]));
        else context.lineTo(x(index), y(source[index]));
        started = true;
      }
      context.stroke();
    };

    // The band's own edges, so the tails read as two more lines rather than as
    // the sides of a slab; they follow the same read/unread split as the line.
    if (band) {
      context.lineWidth = 1;
      context.strokeStyle = accent;
      for (const edge of band) {
        context.globalAlpha = 0.25;
        trace(edge, week, edge.length - 1);
        context.globalAlpha = 0.6;
        trace(edge, 0, week);
      }
      context.globalAlpha = 1;
    }

    // A second quantity on the same indexed axis, dashed so it cannot be
    // mistaken for the series the section is about.
    if (compare) {
      context.setLineDash([3, 2]);
      context.lineWidth = 1.3;
      context.strokeStyle = accent;
      context.globalAlpha = 0.35;
      trace(compare, week, compare.length - 1);
      context.globalAlpha = 0.85;
      trace(compare, 0, week);
      context.setLineDash([]);
      context.globalAlpha = 1;
    }

    context.lineWidth = 1.2;
    context.strokeStyle = muted;
    context.globalAlpha = 0.5;
    trace(series, week, series.length - 1);
    context.globalAlpha = 1;
    context.lineWidth = 1.6;
    context.strokeStyle = ink;
    trace(series, 0, week);
    context.fillStyle = accent;
    context.beginPath();
    context.arc(x(week), y(series[week]), 3.5, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = muted;
    context.font = "10px ui-sans-serif, system-ui, sans-serif";
    context.textBaseline = "bottom";
    context.textAlign = "left";
    // Week 0 starts on 2018-12-31, so label the ends by the data's date range.
    context.fillText(meta.date_range[0].slice(0, 4), 0, height);
    context.textAlign = "right";
    context.fillText(meta.date_range[1].slice(0, 4), width, height);
    // The baseline label belongs to the ridership sparklines; a speed domain
    // does not contain 1 and would only print it against the floor.
    if (lo < 1 && hi > 1) {
      context.textAlign = "center";
      context.fillText("100%", Math.min(width - 16, Math.max(16, width / 2)), y(1) - 1);
    }
  }, [series, week, meta, domain, reference, band, compare]);
  return <canvas ref={canvasRef} className="story-spark" height="58" />;
}

function Ramp({ colors, labels }) {
  return (
    <>
      <div className="story-ramp">
        {colors.map((color) => <span key={color} style={{ background: color }} />)}
      </div>
      <div className="story-ramp-labels">
        {labels.map((text) => <span key={text}>{text}</span>)}
      </div>
    </>
  );
}

function Hud({ data, scene, week }) {
  const { meta } = data;
  if (scene.view === "commute") {
    const commute = data.commute;
    const period = commute ? commute.meta.periods[periodIndex(data, week)] : null;
    const [year, month] = (period?.id || "2026-02").split("-").map(Number);
    if (scene.commuteMeasure && period) {
      return (
        <>
          <div className="story-hud-title">{t("storyMap.commuteTitle", { month: fullM(month), year })}</div>
          <CommuteMeasureLegend data={data} measure={scene.commuteMeasure} p={periodIndex(data, week)} />
        </>
      );
    }
    return (
      <>
        <div className="story-hud-title">{t("storyMap.commuteTitle", { month: fullM(month), year })}</div>
        <Ramp colors={SEQ_GREEN.slice(1)}
          labels={[t("storyMap.commuteRampLow"), t("storyMap.commuteRampHigh")]} />
        <div className="story-swatch"><span className="member" />{t("storyMap.commuteMember")}</div>
      </>
    );
  }
  if (scene.view === "recovery") {
    const low = meta.recovery_baseline_month + 2;
    const threshold = Math.round(meta.recovery_thresholds[scene.recThresh] * 100);
    return (
      <>
        <div className="story-hud-title">{t("storyMap.recoveryTitle", { pct: threshold })}</div>
        <Ramp colors={SEQ_BLUE} labels={[apMonth(meta.months[low]), apMonth(meta.months[meta.months.length - 1])]} />
        <div className="story-swatch"><span style={{ background: REC_NEVER }} />{t("storyMap.recoveryNever")}</div>
        <div className="story-swatch"><span style={{ background: REC_SMALL }} />{t("storyMap.recoverySmall")}</div>
      </>
    );
  }
  const prep = prepareStory(data);
  if (scene.series === "speed") {
    const speeds = berkeleySpeedSeries(data, prep, scene.period || "day");
    const ridership = prep.series.berkeley;
    const mph = (value) => (Number.isFinite(value) ? value.toFixed(1) : t("numbers.missing"));
    // Speed and ridership are different units, so the chart shows each against
    // its own February 2020 level. That is the comparison the passage makes --
    // speed held up where ridership did not -- and it is only readable if both
    // start from the same place.
    const speedRel = relativeToBase(speeds.p50, data.BASE);
    return (
      <>
        <div className="story-hud-kicker">{t("storyMap.weekOf")}</div>
        <div className="story-hud-title">{apDate(meta.weeks[week])}</div>
        <Sparkline
          series={speedRel}
          compare={ridership}
          week={week}
          meta={meta}
        />
        <p className="story-hud-note">
          <T id="storyMap.speedNote" c={[<b />]} vars={{ mph: mph(speeds.p50[week]) }} />
          {Number.isFinite(ridership[week])
            ? <T id="storyMap.speedRidership" c={[<b />]}
                vars={{ pct: Math.round(ridership[week] * 100) }} />
            : null}
        </p>
        <Ramp colors={SPEED_COLORS} labels={strings.storyMap.speedRamp} />
      </>
    );
  }
  const series = scene.series === "system" ? prep.series.system : prep.series.berkeley;
  const share = series[week];
  return (
    <>
      <div className="story-hud-kicker">{t("storyMap.weekOf")}</div>
      <div className="story-hud-title">{apDate(meta.weeks[week])}</div>
      <Sparkline series={series} week={week} meta={meta} />
      <p className="story-hud-note">
        <T id="storyMap.ridershipNote" c={[<b />]} vars={{
          scope: t(scene.series === "system" ? "storyMap.seriesSystem" : "storyMap.seriesBerkeley"),
          pct: Number.isFinite(share)
            ? t("numbers.percentFlat", { n: Math.round(share * 100) })
            : t("numbers.missing"),
        }} />
      </p>
      <Ramp colors={DIVERGING_RG} labels={strings.storyMap.ridershipRamp} />
      {scene.level === "group" ? <DotScale data={data} /> : null}
      <CityComparison data={data} week={week} basis={scene.compare} />
    </>
  );
}

/* The tract measures' key, worded as the explorer's legend words the same
   two modes, so a reader who follows the link finds the same key there. */
function CommuteMeasureLegend({ data, measure, p }) {
  const commute = data.commute;
  if (measure === "acHome") {
    return (
      <>
        <Ramp colors={SEQ_MAGENTA}
          labels={["0", t("explorer.legendPlus", { pct: fmt(commuteRtDomain(commute, "tract", p, "home")) })]} />
      </>
    );
  }
  if (!data.lodes) return null;
  const median = compareMedian(data, "tract", p);
  const percent = (value) => t("numbers.percentFlat", { n: sharePct(value) });
  return (
    <>
      <Ramp colors={DIVERGING} labels={[
        t("explorer.legendOrLess", { pct: percent(median / 4) }),
        percent(median),
        t("explorer.legendPlus", { pct: percent(median * 4) }),
      ]} />
    </>
  );
}

/* What a dot's size means, drawn with the map's own radius rule. */
function DotScale({ data }) {
  const domain = data.domains.group;
  const nice = (value) => {
    const magnitude = 10 ** Math.floor(Math.log10(value));
    return Math.round(value / magnitude) * magnitude;
  };
  const values = [nice(domain / 10), nice(domain / 2), nice(domain)];
  const radius = (value) => Math.min(MAX_DOT_R, 2.5 + Math.sqrt(value / domain) * 11);
  const height = MAX_DOT_R * 2 + 4;
  let x = 0;
  const dots = values.map((value) => {
    const r = radius(value);
    const cx = x + r;
    x += r * 2 + 34;
    return { value, r, cx };
  });
  return (
    <div className="story-dotscale">
      <svg width={x} height={height + 14}>
        {dots.map((dot) => (
          <g key={dot.value}>
            <circle cx={dot.cx + 1} cy={height - dot.r - 1} r={dot.r} className="dot" />
            <text x={dot.cx + 1} y={height + 11} textAnchor="middle">{fmt(dot.value)}</text>
          </g>
        ))}
      </svg>
      <span className="story-dotscale-unit">{t("storyMap.dotScaleUnit")}</span>
    </div>
  );
}

// Berkeley beside its neighbours and Oakland, so the reader can see where it
// stands rather than take it on trust.
const COMPARE_CITIES = ["Berkeley", "Albany", "Emeryville", "El Cerrito", "Oakland", "Richmond", "Alameda"];

function CityComparison({ data, week, basis }) {
  if (!data.cities) return null;
  const year = basis === "year";
  const rows = COMPARE_CITIES
    .map((name) => {
      const city = data.cities.places.findIndex((place) => place.name === name);
      if (city < 0) return null;
      return { name, share: year ? cityYearShare(data, city) : cityShare(data, city, week) };
    })
    .filter((row) => row && Number.isFinite(row.share))
    .sort((a, b) => b.share - a.share);
  const max = 1.5;
  return (
    <div className="story-cities">
      {rows.map((row) => (
        <div className={`story-city${row.name === "Berkeley" ? " focus" : ""}`} key={row.name}>
          <span className="story-city-name">{row.name}</span>
          <span className="story-city-bar">
            <span
              className="fill"
              style={{
                width: `${(Math.min(max, row.share) / max) * 100}%`,
                background: ramp(DIVERGING_RG, row.share / 2),
              }}
            />
            <span className="par" style={{ left: `${(1 / max) * 100}%` }} />
          </span>
          <span className="story-city-value">{Math.round(row.share * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function StoryMap({ data, initialBounds, apiRef, onReady, layout = "scrolly" }) {
  const containerRef = useRef(null);
  const dataRef = useRef(data);
  const engineRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const [hud, setHud] = useState(null);
  dataRef.current = data;
  onReadyRef.current = onReady;

  useEffect(() => {
    let disposed = false;
    let map = null;
    let observer = null;
    import("leaflet").then((module) => {
      if (disposed || !containerRef.current) return;
      const L = module.default || module;
      const container = containerRef.current;
      map = L.map(container, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0,
        zoomAnimation: false,
        inertia: false,
      });
      const basemap = CARTO_KEY
        ? {
            url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            className: "basemap-carto",
          }
        : {
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: "&copy; OpenStreetMap contributors",
            className: "basemap-muted",
          };
      L.tileLayer(basemap.url, { attribution: basemap.attribution, maxZoom: 19, className: basemap.className }).addTo(map);
      map.fitBounds(initialBounds, {
        ...fitPadding(container.clientWidth, container.clientHeight, layout),
        animate: false,
      });
      // Created here rather than rendered by React: they live inside Leaflet's
      // container, which React does not manage the children of.
      const canvas = document.createElement("canvas");
      canvas.className = "story-layer";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "story-annotations");
      const tip = document.createElement("div");
      tip.className = "story-tip";
      tip.hidden = true;
      container.append(canvas, svg, tip);
      const engine = createEngine({
        map,
        container,
        canvas,
        svg,
        tip,
        getData: () => dataRef.current,
        layout,
        onHud: setHud,
      });
      engineRef.current = engine;
      if (apiRef) apiRef.current = engine;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => engine.refit());
        observer.observe(container);
      }
      onReadyRef.current?.();
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      engineRef.current?.remove();
      engineRef.current = null;
      if (apiRef) apiRef.current = null;
      map?.remove();
    };
    // The map is created once; scenes arrive through the engine's update().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.redraw();
    if (data) onReadyRef.current?.();
  }, [data]);

  return (
    <div className="story-map">
      <div ref={containerRef} className="story-map-canvas" />
      {data && hud ? (
        <div className="story-hud">
          <Hud data={data} scene={hud.scene} week={hud.week} />
        </div>
      ) : null}
      {!data ? <div className="story-map-loading">{t("storyMap.loading")}</div> : null}
    </div>
  );
}
