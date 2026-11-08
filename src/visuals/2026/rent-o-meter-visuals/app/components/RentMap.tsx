import { useEffect, useRef, useState } from "react";
import type { Dataset } from "../data";
import { loadBlocks, loadParcels, loadStreets } from "../data";
import { money } from "../format";
import { strings } from "../strings";
import { fmt, pl } from "../text";
import type { Basis, BlockStat, BuildingStat } from "../mapStats";
import { ADJ_COLORS, NO_RENT, adjColor, adjParts, blockStat } from "../mapStats";

type Props = {
  ds: Dataset;
  stats: BuildingStat[];
  pass: boolean[]; // building passes the filters
  basis: Basis; // what `stats[].adj` compares rents to, for the tooltips
  selected: number | null;
  onSelect: (b: number | null) => void;
  onMode?: (blocks: boolean) => void; // fires when the map switches between block and building view
  fitTo?: number[] | null; // when this changes, zoom to show these buildings (a landlord's portfolio)
};

type Cam = { cx: number; cy: number; s: number }; // world meters at the center, screen px per meter
type Box = { x0: number; y0: number; x1: number; y1: number };
type Shape = Box & { b: number; path: Path2D };
type BlockShape = Box & { members: number[]; path: Path2D };
type Hit = { kind: "building"; i: number } | { kind: "block"; i: number };
/** Shapes merged into one path per fill, so a frame is a couple dozen draw calls, not 29k. */
type Layers = {
  pass: boolean[];
  stats: BuildingStat[];
  on: Map<string, Path2D>; // color -> parcels that pass the filters
  off: Map<string, Path2D>; // color -> parcels filtered out
  outline: Path2D; // passing rentals with rents
  bare: Path2D; // passing rentals without rents
  bOn: Map<string, Path2D>; // color -> blocks with a passing rental
  bOff: Path2D; // blocks whose rentals are all filtered out
  bEmpty: Path2D; // blocks with no rentals
  bStats: BlockStat[];
};

const T = strings.map.tip;
// style guide palette, as in styles.css: blue 1, sky 4, sky 8
const NAVY = "#20343f";
const SKY = "#479bd1";
const LOT = "#d9e5f5"; // non-rental parcels: just the shape of the city
const LINE = "#b5ceea"; // sky 7
const OUTLINE = "#a0b1cb"; // blue 7
// zoomed out, blocks; zoomed in, parcels; the two cross-fade between these scales (px per meter)
const BLOCK_LO = 0.2;
const BLOCK_HI = 0.32;
const DETAIL_S = 0.45; // parcel outlines start to show
const TAP_SLOP = 8;
// raised like the story's big buildings: navy sides this many screen px deep (down-right, as --raise)
const BLOCK_RAISE = 2;
const HOVER_RAISE = 3;
const SEL_RAISE = 6;

const box = (): Box => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
const blockMix = (s: number) => Math.min(1, Math.max(0, (s - BLOCK_LO) / (BLOCK_HI - BLOCK_LO))); // 0 blocks, 1 parcels

/** Berkeley on a canvas, rentals colored by rent: city blocks (averaged) when zoomed out, parcels when
 * zoomed in. Drag to pan, pinch / wheel to zoom; tap a block to zoom to it, tap a building to select it.
 * Buildings without a parcel shape (placed by address only) are drawn as dots. */
export function RentMap({ ds, stats, pass, basis, selected, onSelect, onMode, fitTo }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<(Hit & { x: number; y: number }) | null>(null);

  // everything the draw loop reads lives in refs, so panning never re-renders React
  const cam = useRef<Cam>({ cx: 0, cy: 0, s: 0 });
  const fit = useRef<Cam>({ cx: 0, cy: 0, s: 0 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const props = useRef({ stats, pass, selected });
  props.current = { stats, pass, selected };
  const streets = useRef<{ minor: Path2D; major: Path2D } | null>(null);
  const shapes = useRef<{ lots: Path2D; rentals: Shape[]; byB: Map<number, Shape[]> } | null>(null);
  const blocks = useRef<{ list: BlockShape[]; onBlock: Set<number> } | null>(null);
  const layers = useRef<Layers | null>(null);
  const anim = useRef(0);
  const squeezing = useRef(false); // an ancestor's CSS transition is resizing the map; the resize redraws
  const touched = useRef(false); // until someone moves the map, keep it fit to the screen
  const frame = useRef(0);
  const drawRef = useRef<() => void>(() => {});
  const modeRef = useRef<boolean | null>(null);
  const onModeRef = useRef(onMode);
  onModeRef.current = onMode;

  // projection: meters from the middle of the rental stock
  const proj = useRef<{ lon0: number; lat0: number; kx: number; ky: number; xs: Float64Array; ys: Float64Array; order: number[] } | null>(null);
  if (!proj.current) {
    const bs = ds.buildings;
    const lon0 = bs.reduce((a, b) => a + b.lon, 0) / bs.length;
    const lat0 = bs.reduce((a, b) => a + b.lat, 0) / bs.length;
    const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
    const ky = 110540;
    const xs = new Float64Array(bs.length);
    const ys = new Float64Array(bs.length);
    bs.forEach((b, i) => {
      xs[i] = (b.lon - lon0) * kx;
      ys[i] = -(b.lat - lat0) * ky;
    });
    // small buildings first, so big ones sit on top
    const order = bs.map((b) => b.i).sort((a, c) => bs[a].total - bs[c].total);
    proj.current = { lon0, lat0, kx, ky, xs, ys, order };
  }
  const P = proj.current;
  const wx = (lon: number) => (lon - P.lon0) * P.kx;
  const wy = (lat: number) => -(lat - P.lat0) * P.ky;

  /** Add a [lon, lat] ring to a path in world meters, growing a bounding box. */
  function ring(path: Path2D, pts: [number, number][], bb: Box) {
    pts.forEach(([lon, lat], i) => {
      const x = wx(lon);
      const y = wy(lat);
      if (i) path.lineTo(x, y);
      else path.moveTo(x, y);
      bb.x0 = Math.min(bb.x0, x);
      bb.x1 = Math.max(bb.x1, x);
      bb.y0 = Math.min(bb.y0, y);
      bb.y1 = Math.max(bb.y1, y);
    });
    path.closePath();
  }

  const request = () => {
    if (!frame.current)
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        drawRef.current();
      });
  };

  function dotRadius(total: number): number {
    const z = Math.min(3, Math.max(1, Math.sqrt(cam.current.s / (fit.current.s || 1))));
    // phones see the whole city in fewer pixels, so start smaller there
    const small = Math.min(1, Math.max(0.6, size.current.w / 900));
    return (1.6 + Math.sqrt(total) * 0.5) * z * small;
  }

  function buildLayers(): Layers {
    const { stats, pass } = props.current;
    const colors = [...ADJ_COLORS, NO_RENT];
    const on = new Map(colors.map((c) => [c, new Path2D()]));
    const off = new Map(colors.map((c) => [c, new Path2D()]));
    const bOn = new Map(colors.map((c) => [c, new Path2D()]));
    const outline = new Path2D();
    const bare = new Path2D();
    for (const r of shapes.current?.rentals ?? []) {
      const st = stats[r.b];
      const c = adjColor(st.adj);
      (pass[r.b] ? on : off).get(c)!.addPath(r.path);
      if (pass[r.b]) (st.rents ? outline : bare).addPath(r.path);
    }
    const bOff = new Path2D();
    const bEmpty = new Path2D();
    const bStats = (blocks.current?.list ?? []).map((bl) => {
      const st = blockStat(bl.members, stats, pass);
      if (st.buildings) bOn.get(adjColor(st.adj))!.addPath(bl.path);
      else (bl.members.length ? bOff : bEmpty).addPath(bl.path);
      return st;
    });
    return { pass, stats, on, off, outline, bare, bOn, bOff, bEmpty, bStats };
  }

  drawRef.current = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const { w, h, dpr } = size.current;
    const { cx, cy, s } = cam.current;
    const { stats, pass, selected } = props.current;
    const ox = w / 2 - cx * s;
    const oy = h / 2 - cy * s;
    // world meters, optionally nudged by dx, dy screen px
    const world = (dx = 0, dy = 0) => ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (ox + dx), dpr * (oy + dy));
    /** Lift shapes off the map: solid navy sides `d` px deep, then the face in place with a navy edge. */
    const raise = (paths: Path2D[], d: number, face: string, edge: number) => {
      ctx.fillStyle = NAVY;
      for (let k = 1; k <= d; k++) {
        world(k, k * 1.2);
        for (const p of paths) ctx.fill(p);
      }
      world();
      ctx.fillStyle = face;
      for (const p of paths) ctx.fill(p);
      ctx.lineWidth = edge / s;
      ctx.strokeStyle = NAVY;
      for (const p of paths) ctx.stroke(p);
    };
    /** A building as paths in world meters: its parcels, or its dot when it has no shape in this view. */
    const shapeOf = (i: number): Path2D[] => {
      const mine = !blockView && sh?.byB.get(i);
      if (mine && mine.length) return mine.map((m) => m.path);
      const p = new Path2D();
      p.arc(P.xs[i], P.ys[i], dotRadius(ds.buildings[i].total) / s, 0, Math.PI * 2);
      return [p];
    };
    const mix = blockMix(s);
    const blockView = mix < 0.5;
    if (modeRef.current !== blockView) {
      modeRef.current = blockView;
      onModeRef.current?.(blockView);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineJoin = "round";

    const sh = shapes.current;
    const bl = blocks.current;
    if (!layers.current || layers.current.pass !== pass || layers.current.stats !== stats) layers.current = buildLayers();
    const L = layers.current;

    world();
    // blocks, fading out as parcels fade in (or at any zoom, until the parcels have loaded)
    const bAlpha = sh ? 1 - mix : 1;
    if (bl && bAlpha > 0) {
      ctx.globalAlpha = bAlpha;
      ctx.fillStyle = LOT;
      ctx.fill(L.bEmpty);
      ctx.globalAlpha = bAlpha * 0.35;
      ctx.fill(L.bOff);
      ctx.globalAlpha = bAlpha;
      // blocks with rentals sit raised on the city
      world(BLOCK_RAISE, BLOCK_RAISE * 1.2);
      ctx.fillStyle = NAVY;
      for (const path of L.bOn.values()) ctx.fill(path);
      world();
      for (const [color, path] of L.bOn) {
        ctx.fillStyle = color;
        ctx.fill(path);
      }
      ctx.strokeStyle = "rgba(32, 52, 63, 0.35)";
      ctx.lineWidth = 0.8 / s;
      for (const path of L.bOn.values()) ctx.stroke(path);
    }
    // parcels
    if (sh && (mix > 0 || !bl)) {
      const a = bl ? mix : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = LOT;
      ctx.fill(sh.lots);
      if (s >= DETAIL_S) {
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 0.6 / s;
        ctx.stroke(sh.lots);
      }
      ctx.globalAlpha = a * 0.2;
      for (const [color, path] of L.off) {
        ctx.fillStyle = color;
        ctx.fill(path);
      }
      ctx.globalAlpha = a;
      for (const [color, path] of L.on) {
        ctx.fillStyle = color;
        ctx.fill(path);
        // just past the switch, many lots are a few pixels: a same-color edge keeps them from vanishing
        if (s < DETAIL_S) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 / s;
          ctx.stroke(path);
        }
      }
      if (s >= DETAIL_S) {
        ctx.strokeStyle = NAVY;
        ctx.lineWidth = 1 / s;
        ctx.stroke(L.outline);
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 0.8 / s;
        ctx.stroke(L.bare);
      }
    }
    ctx.globalAlpha = 1;
    if (streets.current) {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 0.8 / s;
      ctx.stroke(streets.current.minor);
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6 / s;
      ctx.stroke(streets.current.major);
    }

    // buildings with no shape in the current view as dots (everything, until shapes load)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = 30;
    for (const on of [false, true]) {
      ctx.globalAlpha = on ? 1 : 0.16;
      for (const i of P.order) {
        if (pass[i] !== on) continue;
        if (blockView ? bl?.onBlock.has(i) : sh?.byB.has(i)) continue;
        const x = P.xs[i] * s + ox;
        const y = P.ys[i] * s + oy;
        if (x < -pad || y < -pad || x > w + pad || y > h + pad) continue;
        const st = stats[i];
        const r = dotRadius(ds.buildings[i].total) * (st.rents ? 1 : 0.7);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = adjColor(st.adj);
        ctx.fill();
        ctx.lineWidth = st.rents ? Math.min(1.2, 0.5 + r / 10) : 0.8;
        ctx.strokeStyle = st.rents ? "rgba(32, 52, 63, 0.7)" : OUTLINE;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // hovered building (mouse only): lift it a little
    const hv = hoverRef.current;
    if (hv?.kind === "building" && hv.i !== selected) raise(shapeOf(hv.i), HOVER_RAISE, adjColor(stats[hv.i].adj), 1.5);

    // the selected building: lifted highest, in sky, as in the story's maps
    if (selected !== null) {
      const mine = (!blockView && sh?.byB.get(selected)) || [];
      if (!blockView) raise(shapeOf(selected), SEL_RAISE, SKY, 2.5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // a ring too, when the lifted building is too small on screen to find (or, zoomed out, is on a block)
      const px = mine.length
        ? Math.max(...mine.map((m) => Math.max(m.x1 - m.x0, m.y1 - m.y0) * s))
        : 2 * dotRadius(ds.buildings[selected].total);
      if (blockView || px < 16) {
        const x = P.xs[selected] * s + ox;
        const y = P.ys[selected] * s + oy;
        const r = Math.max(10, dotRadius(ds.buildings[selected].total) + 5);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = NAVY;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r - 2.5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = SKY;
        ctx.stroke();
      }
    }

    // hovered block (mouse only): outline it
    if (hoverRef.current?.kind === "block" && bl) {
      world();
      ctx.lineWidth = 2.5 / s;
      ctx.strokeStyle = NAVY;
      ctx.stroke(bl.list[hoverRef.current.i].path);
    }
  };

  // --- camera ---------------------------------------------------------------------------------------

  const clampS = (s: number) => Math.min(fit.current.s * 60, Math.max(fit.current.s * 0.7, s));

  function animateTo(to: Cam, ms = 380) {
    cancelAnimationFrame(anim.current);
    touched.current = true;
    const from = { ...cam.current };
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      // interpolate zoom in log space so it feels even
      cam.current = {
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        s: Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e),
      };
      // while the layout squeezes, the resize later in this frame redraws anyway: don't draw twice
      if (!squeezing.current) drawRef.current();
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }

  function zoomAt(px: number, py: number, factor: number) {
    const { w, h } = size.current;
    const c = cam.current;
    const s = clampS(c.s * factor);
    const mx = c.cx + (px - w / 2) / c.s;
    const my = c.cy + (py - h / 2) / c.s;
    cam.current = { s, cx: mx - (px - w / 2) / s, cy: my - (py - h / 2) / s };
    touched.current = true;
    request();
  }

  /** Zoom so a block fills most of the view, at least far enough in to see its buildings. */
  function zoomToBlock(i: number) {
    const b = blocks.current!.list[i];
    const { w, h } = size.current;
    const fitBlock = Math.min(w / (b.x1 - b.x0 || 1), h / (b.y1 - b.y0 || 1)) * 0.55;
    animateTo({ cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, s: clampS(Math.max(BLOCK_HI * 1.6, fitBlock)) }, 480);
  }

  // --- hit testing ------------------------------------------------------------------------------------

  function hit(px: number, py: number): Hit | null {
    const { w, h } = size.current;
    const { cx, cy, s } = cam.current;
    const { pass } = props.current;
    const ox = w / 2 - cx * s;
    const oy = h / 2 - cy * s;
    const X = (px - ox) / s;
    const Y = (py - oy) / s;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // paths are in world meters
    const inside = (b: Box, path: Path2D) => X >= b.x0 && X <= b.x1 && Y >= b.y0 && Y <= b.y1 && ctx.isPointInPath(path, X, Y);
    const blockView = blockMix(s) < 0.5;

    if (blockView && blocks.current) {
      const L = layers.current;
      const list = blocks.current.list;
      for (let k = 0; k < list.length; k++) if (L?.bStats[k]?.buildings && inside(list[k], list[k].path)) return { kind: "block", i: k };
    }
    const sh = shapes.current;
    if (!blockView && sh) {
      for (let k = sh.rentals.length - 1; k >= 0; k--) {
        const r = sh.rentals[k];
        if (pass[r.b] && inside(r, r.path)) return { kind: "building", i: r.b };
      }
    }
    // otherwise the nearest dot within a finger's reach
    let best: number | null = null;
    let bestD = Infinity;
    for (const i of P.order) {
      if (!pass[i]) continue;
      if (blockView ? blocks.current?.onBlock.has(i) : sh?.byB.has(i)) continue;
      const d = Math.hypot(P.xs[i] * s + ox - px, P.ys[i] * s + oy - py);
      const reach = Math.max(14, dotRadius(ds.buildings[i].total) + 6);
      if (d < reach && d < bestD) {
        best = i;
        bestD = d;
      }
    }
    return best === null ? null : { kind: "building", i: best };
  }

  const hoverRef = useRef(hover);
  hoverRef.current = hover;
  useEffect(request, [hover]);

  // --- setup: data, size, gestures ----------------------------------------------------------------------

  useEffect(() => {
    let live = true;
    loadStreets().then((sts) => {
      const minor = new Path2D();
      const major = new Path2D();
      for (const st of sts) {
        const p = st.major ? major : minor;
        st.pts.forEach(([lon, lat], i) => (i ? p.lineTo(wx(lon), wy(lat)) : p.moveTo(wx(lon), wy(lat))));
      }
      if (!live) return;
      streets.current = { minor, major };
      request();
    });
    // the block outlines are small (~70 KB gzipped), so they come first
    loadBlocks().then((bs) => {
      if (!live) return;
      const onBlock = new Set<number>();
      const list = bs.map((b) => {
        const path = new Path2D();
        const bb = box();
        for (const r of b.rings) ring(path, r, bb);
        for (const m of b.members) onBlock.add(m);
        return { ...bb, members: b.members, path };
      });
      blocks.current = { list, onBlock };
      layers.current = null;
      request();
    });
    // then every parcel in the city (~29k, ~400 KB gzipped across the tiles)
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    for (const b of ds.buildings) {
      minLon = Math.min(minLon, b.lon);
      maxLon = Math.max(maxLon, b.lon);
      minLat = Math.min(minLat, b.lat);
      maxLat = Math.max(maxLat, b.lat);
    }
    loadParcels(ds, { minLon, maxLon, minLat, maxLat }).then((ps) => {
      if (!live) return;
      const lots = new Path2D();
      const rentals: Shape[] = [];
      const byB = new Map<number, Shape[]>();
      for (const p of ps) {
        const path = new Path2D();
        const bb = box();
        ring(path, p.pts, bb);
        if (p.b < 0) {
          lots.addPath(path);
          continue;
        }
        const sh = { ...bb, b: p.b, path };
        rentals.push(sh);
        byB.set(p.b, [...(byB.get(p.b) ?? []), sh]);
      }
      // small buildings first, so a tap on overlapping shapes (tested last-first) finds the big one
      rentals.sort((a, b) => ds.buildings[a.b].total - ds.buildings[b.b].total);
      shapes.current = { lots, rentals, byB };
      layers.current = null;
      request();
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    // the rental stock's extent (middle 99.8%, so a few outliers don't shrink Berkeley). Once, not per
    // resize: a squeezing map resizes every frame
    const xs = P.xs.slice().sort();
    const ys = P.ys.slice().sort();
    const q = (v: Float64Array, f: number) => v[Math.floor((v.length - 1) * f)];
    const [x0, x1, y0, y1] = [q(xs, 0.001), q(xs, 0.999), q(ys, 0.001), q(ys, 0.999)];
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      size.current = { w, h, dpr };
      // on phones the legend covers the bottom of the map, so fit Berkeley into the space above it
      const legend = w < 900 ? 160 : 0;
      const fs = Math.min(w / (x1 - x0), (h - legend) / (y1 - y0)) * 0.92;
      fit.current = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 + legend / 2 / fs, s: fs };
      if (pendingFit.current) {
        cam.current = framePortfolio(pendingFit.current);
        pendingFit.current = null;
        touched.current = true;
      } else if (!touched.current) cam.current = { ...fit.current };
      // otherwise keep the same world point in the middle, so a squeezing map keeps its selection centered
      drawRef.current();
    });
    ro.observe(el);
    const squeeze = (on: boolean) => (e: TransitionEvent) => {
      if ((e.target as Node).contains(el)) squeezing.current = on;
    };
    const start = squeeze(true);
    const stop = squeeze(false);
    window.addEventListener("transitionrun", start);
    window.addEventListener("transitionend", stop);
    window.addEventListener("transitioncancel", stop);
    return () => {
      ro.disconnect();
      window.removeEventListener("transitionrun", start);
      window.removeEventListener("transitionend", stop);
      window.removeEventListener("transitioncancel", stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const pts = new Map<number, { x: number; y: number }>();
    let pan: { x: number; y: number; cx: number; cy: number } | null = null;
    let pinch: { d: number; s: number; mx: number; my: number } | null = null;
    let tap: { x: number; y: number; t: number } | null = null;
    const local = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const startPinch = () => {
      const [a, b] = [...pts.values()];
      const { w, h } = size.current;
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const cm = cam.current;
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: cm.s, mx: cm.cx + (m.x - w / 2) / cm.s, my: cm.cy + (m.y - h / 2) / cm.s };
    };
    const down = (e: PointerEvent) => {
      cancelAnimationFrame(anim.current);
      c.setPointerCapture(e.pointerId);
      const p = local(e);
      pts.set(e.pointerId, p);
      if (pts.size === 1) {
        pan = { x: p.x, y: p.y, cx: cam.current.cx, cy: cam.current.cy };
        tap = { x: p.x, y: p.y, t: performance.now() };
      } else if (pts.size === 2) {
        tap = null;
        startPinch();
      }
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      if (!pts.has(e.pointerId)) {
        if (e.pointerType === "mouse") {
          const hh = hit(p.x, p.y);
          setHover(hh && { ...hh, x: p.x, y: p.y });
          c.style.cursor = hh ? (hh.kind === "block" ? "zoom-in" : "pointer") : "grab";
        }
        return;
      }
      pts.set(e.pointerId, p);
      if (tap && Math.hypot(p.x - tap.x, p.y - tap.y) > TAP_SLOP) tap = null;
      if (tap) return; // still might be a tap: don't nudge the map yet
      touched.current = true;
      const { w, h } = size.current;
      if (pts.size >= 2 && pinch) {
        const [a, b] = [...pts.values()];
        const s = clampS((pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d);
        const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        cam.current = { s, cx: pinch.mx - (m.x - w / 2) / s, cy: pinch.my - (m.y - h / 2) / s };
      } else if (pan) {
        cam.current = { ...cam.current, cx: pan.cx - (p.x - pan.x) / cam.current.s, cy: pan.cy - (p.y - pan.y) / cam.current.s };
      }
      setHover(null);
      request();
    };
    const up = (e: PointerEvent) => {
      const p = local(e);
      pts.delete(e.pointerId);
      if (tap && performance.now() - tap.t < 500) {
        const hh = hit(p.x, p.y);
        setHover(null); // the panel (or the zoom) takes over from the tooltip
        if (hh?.kind === "block") zoomToBlock(hh.i);
        else onSelectRef.current(hh ? hh.i : null);
      }
      tap = null;
      pinch = null;
      // a finger left a pinch: keep panning with the one that's still down
      const rest = [...pts.values()][0];
      pan = rest ? { x: rest.x, y: rest.y, cx: cam.current.cx, cy: cam.current.cy } : null;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)));
    };
    const leave = () => setHover(null);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("pointerleave", leave);
    c.addEventListener("wheel", wheel, { passive: false });
    return () => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
      c.removeEventListener("pointerleave", leave);
      c.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // redraw when filters or the selection change; glide to a newly selected building
  useEffect(request, [stats, pass, selected]);
  useEffect(() => {
    if (selected === null) return;
    // wait a frame so a squeezing layout has started; the resize then keeps this point centered.
    // zoom in far enough that the building's parcel shows, not its block
    const id = requestAnimationFrame(() =>
      animateTo({ cx: P.xs[selected], cy: P.ys[selected], s: clampS(Math.max(cam.current.s, BLOCK_HI * 1.6)) }),
    );
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // a portfolio to frame once the map knows its size (it may be opened with a landlord already picked)
  const pendingFit = useRef<number[] | null>(null);
  function framePortfolio(ids: number[]) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const i of ids) {
      x0 = Math.min(x0, P.xs[i]);
      x1 = Math.max(x1, P.xs[i]);
      y0 = Math.min(y0, P.ys[i]);
      y1 = Math.max(y1, P.ys[i]);
    }
    const { w, h } = size.current;
    // leave room for the landlord bar on top and the legend below; don't zoom past a few blocks for one building
    const s = Math.min(w / (x1 - x0 + 1), (h - 200) / (y1 - y0 + 1)) * 0.8;
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 + 20 / s, s: clampS(Math.min(s, BLOCK_HI * 3)) };
  }

  useEffect(() => {
    if (!fitTo?.length) return;
    if (!size.current.w) pendingFit.current = fitTo;
    else animateTo(framePortfolio(fitTo), 520);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitTo]);

  const zoomBy = (f: number) => zoomAt(size.current.w / 2, size.current.h / 2, f);

  /** "12 units" or "3 rental buildings", plus how the rents compare to typical. */
  const tipLine = (count: string, adj: number | null) => {
    if (adj === null) return count;
    const a = adjParts(adj);
    const V = strings.map.vs[basis];
    return a.near ? fmt(V.tipNear, { count }) : fmt(V.tipRelative, { count, pct: a.pct, word: a.word });
  };

  let tip = null;
  if (hover?.kind === "building") {
    const b = ds.buildings[hover.i];
    const st = stats[hover.i];
    tip = (
      <>
        <strong>{b.address}</strong>
        <span>{tipLine(pl(T.units, b.total), st.adj)}</span>
        {st.rents > 0 && <span>{fmt(T.avg, { rent: money(st.avg) })}</span>}
      </>
    );
  } else if (hover?.kind === "block" && layers.current) {
    const st = layers.current.bStats[hover.i];
    tip = (
      <>
        <strong>{T.block}</strong>
        <span>{tipLine(pl(T.blockBuildings, st.buildings), st.adj)}</span>
        {st.rents > 0 && <span>{pl(T.avgAcross, st.rents, { rent: money(st.avg) })}</span>}
        <span className="rm-tip-hint">{T.zoomIn}</span>
      </>
    );
  }

  return (
    <div className="rentmap" ref={wrap}>
      <canvas ref={canvas} aria-label={strings.map.canvasAria} role="img" />
      <div className="rm-zoom">
        <button aria-label={strings.map.zoomIn} onClick={() => zoomBy(1.8)}>
          +
        </button>
        <button aria-label={strings.map.zoomOut} onClick={() => zoomBy(1 / 1.8)}>
          −
        </button>
        <button aria-label={strings.map.showAll} className="rm-fit" onClick={() => animateTo(fit.current)}>
          ⤢
        </button>
      </div>
      {tip && (
        <div
          className={`rm-tip${hover!.x > size.current.w - 320 ? " flip" : ""}`}
          style={{ left: hover!.x, top: hover!.y }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}
