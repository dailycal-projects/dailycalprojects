// The endorsement web: a sigma graph with a search box, filters and a details panel. mount() renders it into a
// shadow root on the element EndorsementWeb.jsx gives it, which keeps the article's styles and the app's apart.
// Breakpoints follow that element's width, not the window's (the app was built to fill a page of its own).
import snapshot from './graph.json';
import appCss from './style.css?inline';
import embedCss from './embed.css?inline';
import template from './template.html?raw';
import Graph from 'graphology';
import Sigma from 'sigma';
import { createNormalizationFunction, graphExtent, matrixFromCamera, multiplyVec2 } from 'sigma/utils';
import { createNodeBorderProgram } from '@sigma/node-border';
import type { Data, GNode, GEdge } from './types';
import { logoUrl } from './logos';
import {
  esc, index, nlink, typeGlyph, TYPE_ORDER, TYPE_RAMP, pct, raceShort, shortName, surname, onColor, initials,
  nodeColor, RACE_COLOR, GROUP_COLOR, GROUP_LABEL, groupOfType,
} from './text';

const LEAF = '#c4c4c4', DIM = '#f1f1f1', DIM_BORDER = '#e2e2e2';
type View = 'cands' | 'race';
const fmtDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

/** Render the endorsement web into `host`. Returns a function that removes it. */
export function mount(host: HTMLElement): () => void {
  const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${appCss}\n${embedCss}</style><div class="app">${template}</div>`;
  const app = root.querySelector<HTMLElement>('.app')!;
  const abort = new AbortController();
  main(host, root, app, abort.signal).catch((err) => {
    if (abort.signal.aborted) return;
    console.error(err);
    const p = root.getElementById('panel'); if (p) p.innerHTML = '<p>Could not load the graphic data.</p>';
  });
  return () => { abort.abort(); root.innerHTML = ''; };
}

/** A max-width breakpoint on the host's width, shaped like a MediaQueryList (matches, a 'change' listener). */
function widthQuery(host: HTMLElement, max: number, signal: AbortSignal) {
  const test = () => host.clientWidth <= max;
  let last = test(); const fns: (() => void)[] = [];
  const ro = new ResizeObserver(() => { const now = test(); if (now !== last) { last = now; fns.forEach((f) => f()); } });
  ro.observe(host); signal.addEventListener('abort', () => ro.disconnect());
  return { get matches() { return test(); }, addEventListener: (_: 'change', f: () => void) => { fns.push(f); } };
}

async function main(host: HTMLElement, root: ShadowRoot, app: HTMLElement, signal: AbortSignal) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector(s) as T;
  const on = { signal };
  const narrowMQ = widthQuery(host, 640, signal);
  const stackMQ = widthQuery(host, 899, signal);
  const midMQ = widthQuery(host, 1279, signal);   // below 1280 px, ring names show only on hover, focus or tap
  const d: Data = JSON.parse(JSON.stringify(snapshot));
  // the graph shows groups only (plus candidates and the slate); the downloads keep every endorser
  const byIdAll = new Map(d.nodes.map((n) => [n.id, n]));
  d.nodes = d.nodes.filter((n) => n.grp || n.isTarget);
  const kept = new Set(d.nodes.map((n) => n.id));
  d.edges = d.edges.filter((e) => kept.has(e.s) && kept.has(e.t) && (e.kind === 'member' || !!byIdAll.get(e.s)?.grp));
  await tick(); if (signal.aborted) return;
  const ix = index(d);
  const { byId } = ix;
  const S = d.summary;
  const edgesOut = new Map<string, GEdge[]>(); const edgesIn = new Map<string, GEdge[]>();
  const memberEdges = d.edges.filter((e) => e.kind === 'member');
  for (const e of d.edges) {
    if (e.kind === 'member') continue;
    (edgesOut.get(e.s) || edgesOut.set(e.s, []).get(e.s)!).push(e);
    (edgesIn.get(e.t) || edgesIn.set(e.t, []).get(e.t)!).push(e);
  }
  const isolated = d.nodes.filter((n) => !n.isTarget && n.inDeg + n.outDeg === 0 && !memberEdges.some((e) => e.s === n.id || e.t === n.id));
  const isoSet = new Set(isolated.map((n) => n.id));
  const MAXSEL = 5;   // nodes compared at once
  const state = { view: 'cands' as View, selected: null as string | null, multi: [] as string[], hovered: null as string | null, showAll: false,
    race: d.races.find((r) => r.race === 'Rent Board')?.race || d.races[0].race };

  // ---------- graph ----------
  const g = new Graph({ type: 'directed', multi: false });
  const baseSize = (n: GNode) => (n.isTarget ? 4 + 2.1 * Math.log2(1 + n.inDeg) : n.leaf ? 2.5 : Math.min(8, 2.4 + 1.1 * Math.sqrt(n.outDeg)));
  for (const n of d.nodes) if (!isoSet.has(n.id)) g.addNode(n.id, { x: n.x, y: n.y, size: baseSize(n), label: n.name, color: nodeColor(n) });
  for (const e of d.edges) if (g.hasNode(e.s) && g.hasNode(e.t) && !g.hasEdge(e.s, e.t)) g.addDirectedEdgeWithKey(e.id, e.s, e.t, { size: 1, kind: e.kind });

  await tick(); if (signal.aborted) return;
  const raceSet = () => new Set(d.races.find((r) => r.race === state.race)?.candidates || []);
  const neighbors = (id: string) => (g.hasNode(id) ? new Set([id, ...g.neighbors(id)]) : new Set([id]));
  const isCand = (n: GNode) => n.isTarget && !n.analysisEndorser;

  let FOCUS: Set<string> | null = null; let RACE_SHARED = new Set<string>();
  // ACT: the highlighted nodes (hovered, or the compare set, or the one selected); ALLN / SOMEN: linked to all / some of them
  let ACT: string[] = []; let ALLN = new Set<string>(); let SOMEN = new Set<string>();
  const comparing = () => state.multi.length > 0;
  function recompute() {
    const f = state.hovered || state.selected;
    ACT = state.hovered ? [state.hovered] : state.multi.length ? state.multi.filter((x) => g.hasNode(x)) : state.selected ? [state.selected] : [];
    ALLN = new Set(); SOMEN = new Set();
    if (ACT.length) {
      const cnt = new Map<string, number>();
      for (const a of ACT) for (const m of g.neighbors(a)) if (!ACT.includes(m)) cnt.set(m, (cnt.get(m) || 0) + 1);
      for (const [m, k] of cnt) (k === ACT.length ? ALLN : SOMEN).add(m);
    }
    RACE_SHARED = new Set();
    if (state.view === 'race') {
      const cnt = new Map<string, number>();
      for (const c of raceSet()) for (const e of edgesIn.get(c) || []) cnt.set(e.s, (cnt.get(e.s) || 0) + 1);
      for (const [m, k] of cnt) if (k >= 2) RACE_SHARED.add(m);
    }
    if (ACT.length > 1 || (ACT.length && !f)) FOCUS = new Set([...ACT, ...ALLN, ...SOMEN]);
    else if (f) FOCUS = neighbors(f);
    else if (state.view === 'race') {
      const s = new Set<string>();
      for (const c of raceSet()) { if (!g.hasNode(c)) continue; s.add(c); for (const m of g.inNeighbors(c)) s.add(m); }
      for (const e of memberEdges) if (raceSet().has(e.s) || raceSet().has(e.t)) { s.add(e.s); s.add(e.t); }
      FOCUS = s;
    } else FOCUS = null;
  }

  // ---------- filter: endorser types and races (AND); candidates stay unless their race is off ----------
  const FTYPES = [
    { k: 'unions', label: 'Unions', types: ['Union'] },
    { k: 'clubs', label: 'Clubs and parties', types: ['Democratic club', 'Club', 'Political party'] },
    { k: 'advocacy', label: 'Advocacy groups', types: ['Political/advocacy org'] },
  ];
  const RACES = d.races.map((r) => r.race);
  const filt = { hideT: new Set<string>(), hideR: new Set<string>() };
  let HIDDEN = new Set<string>();
  const ftKey = (t: string) => FTYPES.find((f) => f.types.includes(t))?.k;
  function computeHidden() {
    const H = new Set<string>();
    if (filt.hideT.size || filt.hideR.size) {
      for (const n of d.nodes) {
        if (!g.hasNode(n.id)) continue;
        if (n.isTarget) { if (n.race && filt.hideR.has(n.race)) H.add(n.id); }
        else { const k = ftKey(n.type); if (k && filt.hideT.has(k)) H.add(n.id); }
      }
      // endorsers left with no visible link are hidden too
      for (const n of d.nodes) if (g.hasNode(n.id) && !n.isTarget && !H.has(n.id) && !g.neighbors(n.id).some((m) => !H.has(m))) H.add(n.id);
      if (state.selected) H.delete(state.selected);   // the selected node always stays on screen
      for (const x of state.multi) H.delete(x);
    }
    HIDDEN = H;
  }
  const shownE = (e: GEdge) => !HIDDEN.has(e.s) && !HIDDEN.has(e.t);

  const container = $('#graph');
  const BorderProgram = createNodeBorderProgram({
    borders: [
      { size: { attribute: 'borderSize', defaultValue: 0, mode: 'pixels' }, color: { attribute: 'borderColor', defaultValue: '#555' } },
      { size: { fill: true }, color: { attribute: 'color' } },
    ],
    drawLabel: undefined, drawHover: undefined,
  });
  const SETTINGS: any = {
    renderLabels: false, renderEdgeLabels: false, zIndex: true, stagePadding: 18, minCameraRatio: 0.06, maxCameraRatio: 2.5,
    defaultNodeType: 'border', nodeProgramClasses: { border: BorderProgram as any }, defaultEdgeColor: '#d6d6d6',
    defaultDrawNodeHover: () => undefined,
    nodeReducer: (id: string, attr: any) => {
      if (HIDDEN.has(id)) return { ...attr, hidden: true };
      const n = byId.get(id)!; const r: any = { ...attr, zIndex: 1, borderSize: 0 };
      const isAct = ACT.includes(id);
      const inFocus = !FOCUS || FOCUS.has(id);
      // candidates by race (dark outline), endorsers by type
      r.color = nodeColor(n);
      if (n.isTarget) { r.borderSize = 1.6; r.borderColor = '#111111'; } else { r.borderSize = 0.8; r.borderColor = '#ffffff'; }
      if (n.isTarget) r.zIndex = 3;
      if (n.leaf && !state.showAll && !(FOCUS && FOCUS.has(id) && (ACT.length || state.view === 'race'))) {
        r.color = LEAF; r.size = 2.5; r.zIndex = 0; r.borderSize = 0;
      }
      if (!inFocus) { r.color = DIM; r.borderColor = DIM_BORDER; r.borderSize = n.isTarget ? 1 : 0; r.zIndex = 0; }
      if (state.view === 'race' && !ACT.length && RACE_SHARED.has(id)) { r.size = Math.max(attr.size * 1.3, 5); r.zIndex = 4; }
      if (isAct) { r.zIndex = 6; r.size = Math.max(attr.size * 1.45, 9); r.borderSize = 2.5; r.borderColor = '#111111'; }
      else if (ACT.length > 1 && ALLN.has(id)) { r.zIndex = 5; r.size = Math.max(attr.size * 1.35, 6.5); r.borderSize = 2; r.borderColor = '#111111'; }   // linked to every selected node
      else if (ACT.length && inFocus) r.zIndex = Math.max(r.zIndex, 4);
      return r;
    },
    edgeReducer: (eid: string, attr: any) => {
      const s = g.source(eid), t = g.target(eid); const r: any = { ...attr };
      const sn = byId.get(s)!;
      const isMember = attr.kind === 'member';
      if (HIDDEN.has(s) || HIDDEN.has(t)) { r.hidden = true; return r; }
      edgeStyle(); return r;
      function edgeStyle() {
      if (ACT.length) {   // the selected nodes' own links, drawn dark and heavy (lighter for nodes linked to only some of them); every other line is hidden
        const sa = ACT.includes(s), ta = ACT.includes(t);
        if (sa || ta) {
          const other = sa ? t : s; const strong = ACT.length < 2 || ALLN.has(other) || (sa && ta);
          r.color = strong ? '#111111' : 'rgba(80,80,80,0.45)'; r.size = strong ? (isMember ? 2.6 : 2) : 1; r.zIndex = strong ? 3 : 2;
        } else r.hidden = true;
        return r;
      }
      if (isMember) {
        const vis = state.view !== 'race' || raceSet().has(t) || raceSet().has(s);
        r.color = vis ? '#111' : '#e6e6e6'; r.size = vis ? 2 : 1; r.zIndex = 3; return r;
      }
      if (sn.leaf && !state.showAll) {
        r.hidden = state.view !== 'race' || !FOCUS?.has(s);
        if (!r.hidden) { r.color = 'rgba(150,150,150,0.35)'; r.size = 0.8; }
        return r;
      }
      if (state.view === 'race') {
        if (raceSet().has(t)) { r.color = RACE_SHARED.has(s) ? '#2b2b2b' : 'rgba(110,110,110,0.4)'; r.size = RACE_SHARED.has(s) ? 1.3 : 0.8; r.zIndex = RACE_SHARED.has(s) ? 2 : 1; }
        else r.hidden = true;
      } else { r.color = 'rgba(90,90,90,0.38)'; r.size = 1; }
      return r;
      }
    },
  };
  let renderer: Sigma | null = null;
  // Until the first interaction the graph is a 2D-canvas preview drawn with sigma's own camera math and the same
  // reducers, so the page becomes interactive without paying for WebGL set-up during load.
  const preview = document.createElement('canvas'); preview.className = 'preview'; preview.setAttribute('aria-hidden', 'true');
  container.appendChild(preview);
  const pctx = preview.getContext('2d')!;
  const pvPos = new Map<string, { x: number; y: number; r: number }>();
  let bbox: { x: [number, number]; y: [number, number] } | null = null;
  let pvFrame = 0;
  function drawPreview() {
    pvFrame = 0;
    if (renderer) return;
    const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    if (preview.width !== Math.round(w * dpr) || preview.height !== Math.round(h * dpr)) { preview.width = Math.round(w * dpr); preview.height = Math.round(h * dpr); preview.style.width = w + 'px'; preview.style.height = h + 'px'; }
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0); pctx.clearRect(0, 0, w, h);
    const ext = bbox || graphExtent(g);
    const normF = createNormalizationFunction(ext);
    const M = matrixFromCamera(home(), { width: w, height: h }, { width: ext.x[1] - ext.x[0] || 1, height: ext.y[1] - ext.y[0] || 1 }, SETTINGS.stagePadding);
    pvPos.clear();
    const nd: any[] = [];
    g.forEachNode((id, a) => {
      const r: any = SETTINGS.nodeReducer(id, a); if (r.hidden) return;
      const v = multiplyVec2(M, normF({ x: a.x, y: a.y }) as any);
      const X = ((1 + v.x) * w) / 2, Y = ((1 - v.y) * h) / 2;
      pvPos.set(id, { x: X, y: Y, r: r.size }); nd.push({ ...r, X, Y });
    });
    const ed: any[] = [];
    g.forEachEdge((eid, a, s_, t_) => { const r: any = SETTINGS.edgeReducer(eid, a); if (r.hidden) return; const p1 = pvPos.get(s_), p2 = pvPos.get(t_); if (p1 && p2) ed.push({ ...r, p1, p2 }); });
    ed.sort((x, y) => (x.zIndex || 0) - (y.zIndex || 0));
    pctx.lineCap = 'butt';
    for (const e of ed) { pctx.strokeStyle = e.color || SETTINGS.defaultEdgeColor; pctx.lineWidth = Math.max(0.6, e.size || 1); pctx.beginPath(); pctx.moveTo(e.p1.x, e.p1.y); pctx.lineTo(e.p2.x, e.p2.y); pctx.stroke(); }
    nd.sort((x, y) => (x.zIndex || 0) - (y.zIndex || 0));
    for (const n of nd) {
      if (n.borderSize > 0) { pctx.fillStyle = n.borderColor; pctx.beginPath(); pctx.arc(n.X, n.Y, n.size, 0, Math.PI * 2); pctx.fill(); }
      pctx.fillStyle = n.color; pctx.beginPath(); pctx.arc(n.X, n.Y, Math.max(0, n.size - (n.borderSize || 0)), 0, Math.PI * 2); pctx.fill();
    }
    drawOverlay();
  }
  /** redraw: sigma once it exists, the preview until then */
  const refresh = (opts?: any) => { if (renderer) renderer.refresh(opts); else if (!pvFrame) pvFrame = requestAnimationFrame(drawPreview); };

  await tick(); if (signal.aborted) return;
  // ---------- overlay: collision-aware labels, rings, letters ----------
  const overlay = document.createElement('canvas'); overlay.className = 'overlay'; overlay.setAttribute('aria-hidden', 'true');
  container.appendChild(overlay);
  const octx = overlay.getContext('2d')!;
  const FONT = '"Libre Franklin Variable","Libre Franklin",system-ui,sans-serif';
  function sizeOverlay() {
    const dpr = window.devicePixelRatio || 1; const w = container.clientWidth, h = container.clientHeight;
    overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr); overlay.style.width = w + 'px'; overlay.style.height = h + 'px';
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeOverlay();
  type Lab = { id: string; texts: string[]; force: boolean; weight: number; dim?: boolean };
  const lblName = (n: GNode) => (n.type === 'Slate' ? n.name : shortName(n));
  const altName = (n: GNode) => (n.type === 'Slate' ? 'Slate' : /Individual|official|Candidate/.test(n.type) ? surname(n) : lblName(n));
  let peek: string | null = null;   // a node whose name is hovered or focused in the panel or legend
  function labelPlan(): Lab[] {
    const L: Lab[] = []; const narrow = narrowMQ.matches;
    const push = (id: string, texts: string[], force = false, weight = 600, dim = false) => {
      if (!g.hasNode(id) || L.some((l) => l.id === id)) return;
      const tx = texts.filter((t, i) => t && texts.indexOf(t) === i);
      L.push({ id, texts: tx, force, weight, dim });
    };
    for (const a of ACT) { const n = byId.get(a)!; push(a, ACT.length > 1 ? [lblName(n), altName(n)] : [n.name, lblName(n), altName(n)], true, 750); }
    if (ACT.length > 1) for (const a of ALLN) { const n = byId.get(a)!; push(a, [lblName(n), altName(n)], true, 650); }
    if (peek && !ACT.includes(peek) && (!FOCUS || FOCUS.has(peek))) { const n = byId.get(peek)!; push(peek, [lblName(n), altName(n)], true, 750); }
    // every candidate, at every width (dimmed when outside the focus)
    const cands = d.nodes.filter((n) => n.isTarget && g.hasNode(n.id)).sort((a, b) => Number(!!a.memberOf) - Number(!!b.memberOf) || b.inDeg - a.inDeg);
    const nbs = ACT.length && FOCUS ? [...FOCUS].filter((x) => !ACT.includes(x)) : [];
    const nbForce = nbs.length <= 40;
    const cn = (n: GNode) => (narrow ? [altName(n)] : [lblName(n), altName(n)]);
    for (const n of cands) if (!FOCUS || FOCUS.has(n.id)) push(n.id, cn(n), true, 650);
    // every neighbour of the selected node (all of them when there are up to 40; otherwise those with 2+ links)
    nbs.sort((a, b) => (byId.get(b)!.inDeg + byId.get(b)!.outDeg) - (byId.get(a)!.inDeg + byId.get(a)!.outDeg))
      .forEach((id, i) => { const n = byId.get(id)!; if (nbForce || i < (narrow ? 12 : 30)) push(id, [lblName(n), altName(n)], true, 600); else if (!n.leaf) push(id, [lblName(n), altName(n)], false, 550); });
    if (state.view === 'race') {
      for (const c of raceSet()) { const n = byId.get(c)!; push(c, [lblName(n), altName(n)], true, 700); }
      if (RACE_SHARED.size <= (narrow ? 8 : 16)) [...RACE_SHARED].forEach((id) => { const n = byId.get(id)!; push(id, [lblName(n), altName(n)], false, 550); });
    }
    // a filtered view with few endorsers left: name them too
    if (HIDDEN.size && !ACT.length) {
      const rest = d.nodes.filter((n) => !n.isTarget && g.hasNode(n.id) && !HIDDEN.has(n.id) && (state.showAll || !n.leaf));
      if (rest.length <= 40) rest.sort((a, b) => b.outDeg - a.outDeg).forEach((n) => push(n.id, [lblName(n), altName(n)], false, 550));
    }
    for (const n of cands) push(n.id, cn(n), true, 500, true);
    return L;
  }
  function drawOverlay() {
    const w = container.clientWidth, h = container.clientHeight;
    octx.clearRect(0, 0, w, h);
    const fs = narrowMQ.matches ? 12 : 12.5;
    const placed: [number, number, number, number][] = [];
    const R = renderer;
    const vp = (id: string) => { if (!R) return pvPos.get(id) || null; const dd: any = R.getNodeDisplayData(id); if (!dd || dd.hidden) return null; const p = R.framedGraphToViewport({ x: dd.x, y: dd.y }); return { x: p.x, y: p.y, r: R.scaleSize(dd.size) }; };
    // rings: endorsers shared within a race
    const ringIds = new Set<string>();
    if (state.view === 'race' && !ACT.length) RACE_SHARED.forEach((x) => ringIds.add(x));
    octx.lineWidth = 1.8; octx.strokeStyle = '#111';
    for (const id of ringIds) { const p = vp(id); if (!p) continue; octx.beginPath(); octx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2); octx.stroke(); placed.push([p.x - p.r - 3, p.y - p.r - 3, p.x + p.r + 3, p.y + p.r + 3]); }
    // the selected node: a soft halo, a white gap and a heavy dark ring
    for (const a of ACT) {
      const p = vp(a);
      if (p) {
        const R0 = p.r + 4;
        octx.lineWidth = 9; octx.strokeStyle = 'rgba(255, 184, 0, 0.5)'; octx.beginPath(); octx.arc(p.x, p.y, R0 + 8.5, 0, Math.PI * 2); octx.stroke();
        octx.lineWidth = 4; octx.strokeStyle = '#ffffff'; octx.beginPath(); octx.arc(p.x, p.y, R0, 0, Math.PI * 2); octx.stroke();
        octx.lineWidth = 3; octx.strokeStyle = '#111111'; octx.beginPath(); octx.arc(p.x, p.y, R0 + 3, 0, Math.PI * 2); octx.stroke();
        placed.push([p.x - R0 - 5, p.y - R0 - 5, p.x + R0 + 5, p.y + R0 + 5]);
      }
    }
    for (const n of d.nodes) if (n.isTarget && g.hasNode(n.id)) { const p = vp(n.id); if (p) placed.push([p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r]); }
    const ovl = (bx: number[]) => placed.reduce((a, b) => a + Math.max(0, Math.min(bx[2], b[2]) - Math.max(bx[0], b[0])) * Math.max(0, Math.min(bx[3], b[3]) - Math.max(bx[1], b[1])), 0);
    const draws: [string, number, number, number, boolean, string][] = [];
    const leaders: [number, number, number, number][] = [];
    for (const L of labelPlan()) {
      const p = vp(L.id); if (!p) continue;
      octx.font = `${L.weight} ${fs}px ${FONT}`;
      const th = fs; let done = false; let best: [number, number, number, string] | null = null;
      for (const text of L.texts) {
        const tw = octx.measureText(text).width;
        const opts: [number, number][] = [[p.x + p.r + 4, p.y + th * 0.35], [p.x - p.r - 4 - tw, p.y + th * 0.35], [p.x - tw / 2, p.y - p.r - 5], [p.x - tw / 2, p.y + p.r + th + 2],
          [p.x + p.r + 3, p.y - th * 0.6], [p.x + p.r + 3, p.y + th * 1.3], [p.x - p.r - 3 - tw, p.y - th * 0.6], [p.x - p.r - 3 - tw, p.y + th * 1.3]];
        for (const [x, y] of opts) {
          const box = [x - 3, y - th, x + tw + 3, y + 4];
          if (box[0] < 2 || box[2] > w - 2 || box[1] < 2 || box[3] > h - 2) continue;
          const o = ovl(box);
          if (o === 0) { placed.push(box as any); draws.push([text, x, y, L.weight, !!L.dim, L.id]); done = true; break; }
          if (!best || o < best[0]) best = [o, x, y, text];
        }
        if (done) break;
      }
      // guaranteed labels that collide: try positions further out, joined to the node by a leader line
      if (!done && L.force && !L.dim) {
        const text = L.texts[L.texts.length > 1 && narrowMQ.matches ? L.texts.length - 1 : 0]; const tw = octx.measureText(text).width;
        outer: for (const k of [1.6, 2.4, 3.3]) for (let j = 0; j < 12; j++) {
          const a = (Math.PI * 2 * j) / 12, dist = p.r + th * k;
          const cx = p.x + Math.cos(a) * dist, cy = p.y + Math.sin(a) * dist;
          const x = Math.cos(a) > 0.3 ? cx : Math.cos(a) < -0.3 ? cx - tw : cx - tw / 2, y = cy + th * 0.35;
          const box = [x - 3, y - th, x + tw + 3, y + 4];
          if (box[0] < 2 || box[2] > w - 2 || box[1] < 2 || box[3] > h - 2) continue;
          if (ovl(box) === 0) {
            placed.push(box as any); draws.push([text, x, y, L.weight, false, L.id]);
            leaders.push([p.x + Math.cos(a) * (p.r + 1), p.y + Math.sin(a) * (p.r + 1), Math.min(Math.max(p.x, box[0] + 3), box[2] - 3), Math.min(Math.max(p.y, box[1] + 2), box[3] - 2)]);
            done = true; break outer;
          }
        }
      }
      if (!done && L.force && best) {
        const [, x, y, text] = best; const tw = octx.measureText(text).width;
        placed.push([x - 3, y - th, x + tw + 3, y + 4]); draws.push([text, x, y, L.weight, !!L.dim, L.id]);
      }
    }
        octx.lineWidth = 1; octx.strokeStyle = '#444';
    for (const [x1, y1, x2, y2] of leaders) { octx.beginPath(); octx.moveTo(x1, y1); octx.lineTo(x2, y2); octx.stroke(); }
    // labels sit above lines: a white backing box under each label
    for (const [text, x, y, wgt, dim] of draws) {
      octx.font = `${wgt} ${fs}px ${FONT}`; const tw = octx.measureText(text).width;
      octx.fillStyle = 'rgba(255,255,255,0.86)'; octx.fillRect(x - 2, y - fs + 1, tw + 4, fs + 3);
      octx.lineWidth = 3; octx.strokeStyle = 'rgba(255,255,255,0.95)'; octx.lineJoin = 'round';
      octx.strokeText(text, x, y); octx.fillStyle = dim ? '#6b6b6b' : '#111'; octx.fillText(text, x, y);
    }
  }
  const ro = new ResizeObserver(() => { sizeOverlay(); refresh(); }); ro.observe(container);
  signal.addEventListener('abort', () => { ro.disconnect(); cancelAnimationFrame(pvFrame); renderer?.kill(); });

  // ---------- camera ----------
  let cam: ReturnType<Sigma['getCamera']> | null = null;
  function setFrame() {
    if (narrowMQ.matches && !state.showAll) {
      const core = d.nodes.filter((n) => g.hasNode(n.id) && !n.leaf);
      const xs = core.map((n) => n.x), ys = core.map((n) => n.y);
      bbox = { x: [Math.min(...xs), Math.max(...xs)], y: [Math.min(...ys), Math.max(...ys)] };
    } else bbox = null;
    homeMemo = null; if (renderer) renderer.setCustomBBox(bbox);
  }
  const HOME = { x: 0.5, y: 0.5, ratio: 1, angle: 0 };
  // portrait screens: turn the wide layout upright, and lift it so its top sits just under the legend button (no dead band above)
  let homeBottom = 0;
  let homeMemo: { k: string; v: { x: number; y: number; ratio: number; angle: number } } | null = null;
  const home = () => {
    const base = { ...HOME, angle: narrowMQ.matches && !state.showAll ? Math.PI / 2 : 0 };
    if (!base.angle) return base;
    const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return base;
    const k = `${w}x${h}`; if (homeMemo && homeMemo.k === k) return homeMemo.v;
    const ext = bbox || graphExtent(g); const normF = createNormalizationFunction(ext);
    const pts: { x: number; y: number }[] = []; g.forEachNode((id, a) => { if (!(SETTINGS.nodeReducer(id, a) as any).hidden) pts.push(normF({ x: a.x, y: a.y }) as any); });
    const dims = { width: ext.x[1] - ext.x[0] || 1, height: ext.y[1] - ext.y[0] || 1 };
    const box = (c: typeof base) => { const M = matrixFromCamera(c, { width: w, height: h }, dims, SETTINGS.stagePadding); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of pts) { const q = multiplyVec2(M, p as any); const X = ((1 + q.x) * w) / 2, Y = ((1 - q.y) * h) / 2; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } return { x0, x1, y0, y1 }; };
    // fit: zoom so the visible nodes fill the width (room for labels at the sides) or the height between the legend button and the zoom buttons
    const TOP = 56, BOTTOM = 64, SIDE = 44;
    const b0 = box(base); const sc = Math.min((w - 2 * SIDE) / Math.max(1, b0.x1 - b0.x0), (h - TOP - BOTTOM) / Math.max(1, b0.y1 - b0.y0));
    let v = { ...base, ratio: base.ratio / Math.max(0.5, Math.min(3, sc)) };
    // then pan (2×2 finite-difference solve) so the box is centred horizontally with its top at TOP
    for (let it = 0; it < 2; it++) {
      const b1 = box(v), eps = 0.002 * v.ratio;
      const f = (bb: ReturnType<typeof box>) => [(bb.x0 + bb.x1) / 2 - w / 2, bb.y0 - TOP];
      const f0 = f(b1), fx = f(box({ ...v, x: v.x + eps })), fy = f(box({ ...v, y: v.y + eps }));
      const J = [[(fx[0] - f0[0]) / eps, (fy[0] - f0[0]) / eps], [(fx[1] - f0[1]) / eps, (fy[1] - f0[1]) / eps]];
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]; if (Math.abs(det) < 1e-9) break;
      v = { ...v, x: v.x - (J[1][1] * f0[0] - J[0][1] * f0[1]) / det, y: v.y - (-J[1][0] * f0[0] + J[0][0] * f0[1]) / det };
    }
    homeBottom = box(v).y1;
    homeMemo = { k, v }; return v;
  };
  setFrame();
  const goHome = () => { if (cam) cam.animate(home(), { duration: 300 }); else refresh(); };
  $('#zin').onclick = () => { ensureSigma(); cam!.animatedZoom({ duration: 250 }); };
  $('#zout').onclick = () => { ensureSigma(); cam!.animatedUnzoom({ duration: 250 }); };
  $('#zreset').onclick = goHome;
  function flyTo(id: string) {
    if (!g.hasNode(id)) return;
    ensureSigma();
    const p = renderer!.getNodeDisplayData(id); if (!p) return;
    cam!.animate({ x: p.x, y: p.y, ratio: Math.min(cam!.ratio, 0.6), angle: cam!.angle }, { duration: 450 });
  }

  // ---------- tooltip (pointer devices only) ----------
  const tip = $('#tooltip');
  const hideTip = () => { tip.hidden = true; };
  function ensureSigma() {
    if (renderer) return;
    renderer = new Sigma(g, container, SETTINGS);
    renderer.setCustomBBox(bbox);
    cam = renderer.getCamera(); cam.setState(home());
    container.appendChild(overlay);   // keep the label layer above sigma's canvases
    preview.remove();
    renderer.on('afterRender', drawOverlay);
    renderer.on('enterNode', onEnter); renderer.on('leaveNode', onLeave);
    renderer.on('clickNode', ({ node, event }) => {
      hideTip(); state.hovered = null;
      const o: any = (event as any)?.original;
      if (comparing() || (o && (o.shiftKey || o.metaKey || o.ctrlKey))) toggle(node); else select(node, stackMQ.matches);
    });
    renderer.on('clickStage', () => { hideTip(); if (state.selected && !comparing()) select(null); });
    renderer.refresh();
  }
  const wake = () => ensureSigma();
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focusin']) root.addEventListener(ev, wake, { capture: true, once: true, passive: true, signal });
  for (const ev of ['pointermove', 'pointerover']) container.addEventListener(ev, wake, { once: true, passive: true, signal });
  function onEnter({ node, event }: { node: string; event: { x: number; y: number } }) {
    if (!hoverMQ.matches) return;
    state.hovered = node; recompute(); refresh({ skipIndexation: true });
    const n = byId.get(node)!;
    tip.innerHTML = `<strong>${esc(n.name)}</strong><span>${esc(n.type)}${n.race ? ' · ' + esc(n.race) : ''}</span><span>${n.outDeg ? `Endorses ${n.outDeg}` : ''}${n.outDeg && n.inDeg ? ' · ' : ''}${n.inDeg ? `Endorsed by ${n.inDeg} ${n.inDeg === 1 ? 'group' : 'groups'}` : ''}</span>`;
    tip.hidden = false; const w = container.clientWidth; tip.style.left = Math.min(event.x + 14, w - 230) + 'px'; tip.style.top = event.y + 14 + 'px';
    container.style.cursor = 'pointer';
  }
  function onLeave() { if (!state.hovered) return; state.hovered = null; recompute(); refresh({ skipIndexation: true }); hideTip(); container.style.cursor = ''; }
  container.addEventListener('touchstart', hideTip, { passive: true, signal });

  // ---------- panel helpers ----------
  const panel = $('#panel');
  const N = (id: string) => byId.get(id)!;
  const typeBar = (tc: Map<string, number> | Record<string, number>, via = 0) => {
    const m = tc instanceof Map ? tc : new Map(Object.entries(tc));
    return `<div class="tbar" role="img" aria-label="${esc([...m].map(([t, v]) => `${v} ${t}`).concat(via ? [`${via} via slate`] : []).join(', '))}">${TYPE_ORDER.filter((t) => m.has(t)).map((t) => `<span style="flex:${m.get(t)};background:${TYPE_RAMP[t]}" title="${esc(t)}: ${m.get(t)}"></span>`).join('')}${via ? `<span class="via" style="flex:${via}" title="Via slate: ${via}"></span>` : ''}</div>`;
  };
  /** group endorsers of a slate member's slate that do not also endorse the member directly */
  const viaSlate = (n: GNode) => { if (!n.memberOf) return 0; const own = new Set((edgesIn.get(n.id) || []).map((e) => e.s)); return (edgesIn.get(n.memberOf) || []).filter((e) => !own.has(e.s)).length; };
  const typeKey = (types: string[]) => `<p class="tkey small">${TYPE_ORDER.filter((t) => types.includes(t)).map((t) => `<span><i style="background:${TYPE_RAMP[t]}"></i>${esc(t)}</span>`).join('')}</p>`;
  // ---------- references: one number per source document, shared with the References list on /findings/ ----------
  const refByU = new Map(d.refs.map((r) => [r.u, r]));
  const fmtDates = (at: string[]) => (!at.length ? '' : at.length === 1 ? fmtDate(at[0]) : `${fmtDate(at[0])} to ${fmtDate(at[at.length - 1])}`);
  // one visible citation per edge: a source flagged as the citation, else the best (org page > press > campaign site > voter guide); the rest stay in the downloads
  const SRC_RANK: Record<string, number> = { 'org endorsement page': 0, 'news article': 1, 'campaign site': 2, 'voter guide': 3 };
  const srcRank = (ty?: string) => SRC_RANK[(ty || '').toLowerCase()] ?? 4;
  const refNums = (e: GEdge) => { const b = e.src.filter((x) => refByU.has(x.u)).sort((a, c) => (c.v ?? 0) - (a.v ?? 0) || srcRank(a.ty) - srcRank(c.ty))[0]; return b ? [refByU.get(b.u)!.n] : []; };
  const refByN = new Map(d.refs.map((r) => [r.n, r]));
  const marker = (ns: number[]) => (ns.length ? `<sup class="rm">[${ns.map((n) => { const r = refByN.get(n); const t = r ? r.title : `Reference ${n}`; return `<a href="${esc(r ? d.urls[r.u] : `#pref-${n}`)}" target="_blank" rel="noopener" data-ref="${n}" title="${esc(t)}" aria-label="Source ${n}: ${esc(t)} (opens in a new tab)">${n}</a>`; }).join(',')}]</sup>` : '');
  function refList(ns: Set<number>) {
    const rs = d.refs.filter((r) => ns.has(r.n));
    if (!rs.length) return '';
    return `<details class="grp refs" open><summary><h3>References <span class="cnt">${rs.length}</span></h3></summary><ol class="reflist">${rs.map((r) => `<li id="pref-${r.n}" value="${r.n}"><span class="rt">${esc(r.title)}</span> <a class="ru" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\/(www\.)?/, ''))}</a> <span class="acc">${r.at.length ? `Accessed ${esc(fmtDates(r.at))}.` : 'Access date not recorded; corroborating source only.'}</span></li>`).join('')}</ol></details>`;
  }
  // ---------- avatars: a candidate headshot when one exists, otherwise initials ----------
  const photos = d.photos || {};
  /** an organisation's logo (logo.dev) over its initials; the initials show if the image fails */
  const logoAv = (n: GNode, size: 'lg' | 'sm') => {
    const u = logoUrl(n.name, size === 'lg' ? 48 : 24); if (!u) return null;
    const px = size === 'lg' ? 48 : 24;
    return `<span class="av av-${size} av-i av-logo" style="--c:#eeeeee;--t:#333">${esc(initials(n))}<img src="${esc(u)}" alt="" width="${px}" height="${px}" loading="lazy" decoding="async"></span>`;
  };
  root.addEventListener('error', (e) => { const t = e.target as HTMLElement; if (t instanceof HTMLImageElement && t.parentElement?.classList.contains('av-logo')) t.remove(); }, { capture: true, signal });
  const avatar = (n: GNode, size: 'lg' | 'sm' = 'lg') => logoAv(n, size) || (photos[n.id]
    ? `<img class="av av-${size}" src="${esc(photos[n.id])}" alt="" width="${size === 'lg' ? 48 : 24}" height="${size === 'lg' ? 48 : 24}" loading="lazy" decoding="async">`
    : `<span class="av av-${size} av-i" aria-hidden="true" style="--c:${nodeColor(n)};--t:${onColor(nodeColor(n))}">${esc(initials(n))}</span>`);
  // endorser groups: parties, clubs, unions, organizations, candidates, then everyone else
  const GROUPS: { label: string; types: string[]; key: boolean }[] = [
    { label: 'Parties', types: ['Political party'], key: true },
    { label: 'Democratic clubs', types: ['Democratic club'], key: true },
    { label: 'Clubs', types: ['Club'], key: true },
    { label: 'Unions', types: ['Union'], key: true },
    { label: 'Organizations', types: ['Political/advocacy org'], key: true },
    { label: 'Candidates and slates', types: ['Candidate', 'Candidate (withdrawn)', 'Slate'], key: true },
    { label: 'Everyone else', types: ['Individual'], key: false },
  ];
  const groupOf = (t: string) => GROUPS.find((x) => x.types.includes(t)) || GROUPS[GROUPS.length - 1];
  const rankTxt = (e: GEdge) => (e.rel !== 'Endorses' && e.kind !== 'member' ? ` <span class="rk"${e.rankNote ? ` title="${esc(e.rankNote)}"` : ''}>${esc(e.rel.replace(/^Ranked /, 'ranked '))}</span>` : '');
  const srcKey = (e: GEdge) => refNums(e).join(',');
  /** one shared source for every edge in the list? then it is cited once, in the banner */
  const sharedRef = (es: GEdge[]) => (es.length > 1 && es.every((e) => srcKey(e) === srcKey(es[0])) && srcKey(es[0]) ? refNums(es[0]) : null);
  const bannerSrc = (ns: number[] | null) => (ns ? `<p class="bsrc">Source: ${marker(ns)} ${ns.map((n) => esc(d.refs[n - 1].title)).join('; ')}</p>` : '');
  /** a key endorser: icon, name, a short description, ranking, reference marker */
  function keyRow(e: GEdge, otherId: string, cite: boolean) {
    const o = N(otherId);
    const desc = e.title || o.title;
    return `<li>${logoAv(o, 'sm') || typeGlyph(o.type)}<span class="kr">${nlink(o)}${rankTxt(e)}${cite ? marker(refNums(e)) : ''}${desc ? `<span class="desc">${esc(desc)}</span>` : ''}</span></li>`;
  }
  const LIM = 5;   // key names shown per group before "Show all"
  const fKey = (id: string) => esc(`${N(id).name} ${N(id).type}`.toLowerCase());
  /** live filter of a long endorser list (search box under "Endorsed by N groups") */
  function filterEndorsers(inp: HTMLInputElement) {
    const sec = inp.closest('.lead'); if (!sec) return;
    const q = inp.value.trim().toLowerCase(); let n = 0;
    sec.querySelectorAll<HTMLElement>('[data-f]').forEach((el) => {
      if (el.dataset.h === undefined) el.dataset.h = el.hidden ? '1' : '';
      const ok = !q || el.dataset.f!.includes(q); if (ok && q) n++;
      el.hidden = q ? !ok : el.dataset.h === '1';
    });
    sec.querySelectorAll<HTMLDetailsElement>('details.grp').forEach((dt) => {
      if (dt.dataset.o === undefined) dt.dataset.o = dt.open ? '1' : '';
      const any = !!dt.querySelector('[data-f]:not([hidden])');
      dt.hidden = !!q && !any; dt.open = q ? any : dt.dataset.o === '1';
    });
    sec.querySelectorAll<HTMLElement>('.showmore').forEach((b) => (b.hidden = !!q));
    sec.querySelector<HTMLElement>('.efnone')!.hidden = !q || n > 0;
    sec.querySelector<HTMLElement>('[data-efclear]')!.hidden = !q;
  }
  function endorserGroups(es: GEdge[], cite: boolean) {
    const by = new Map<string, GEdge[]>();
    for (const e of es) { const gl = groupOf(N(e.s).type).label; if (!by.has(gl)) by.set(gl, []); by.get(gl)!.push(e); }
    return GROUPS.filter((gr) => by.has(gr.label)).map((gr) => {
      const list = by.get(gr.label)!.sort((a, b) => (N(b.s).outDeg - N(a.s).outDeg) || N(a.s).name.localeCompare(N(b.s).name));
      const head = `<summary>${typeGlyph(gr.types[0])}<span>${gr.label}</span> <span class="cnt">${list.length}</span></summary>`;
      if (!gr.key) {   // everyone else: a compact run of names
        const names = list.slice().sort((a, b) => N(a.s).name.localeCompare(N(b.s).name)).map((e) => `<span class="ci" data-f="${fKey(e.s)}">${nlink(N(e.s))}${rankTxt(e)}${cite ? marker(refNums(e)) : ''}</span>`).join('');
        return `<details class="grp">${head}<p class="clist">${names}</p></details>`;   // collapsed: open to see every name
      }
      const rows = list.map((e, i) => keyRow(e, e.s, cite).replace('<li>', `<li data-f="${fKey(e.s)}"${i >= LIM ? ' class="more" hidden' : ''}>`)).join('');
      const more = list.length > LIM ? `<button class="showmore">Show all ${list.length}</button>` : '';
      return `<details class="grp" open>${head}<ul class="klist">${rows}</ul>${more}</details>`;
    }).join('');
  }
  /** what a node endorses (or its slate links): one row per target, with race and reference marker */
  function targetRows(es: GEdge[], cite: boolean) {
    return `<ul class="klist">${es.slice().sort((a, b) => (N(a.t).race || '').localeCompare(N(b.t).race || '') || N(a.t).name.localeCompare(N(b.t).name)).map((e) => {
      const t = N(e.t);
      return `<li>${typeGlyph(t.type)}<span class="kr">${nlink(t)}${t.race && t.type !== 'Slate' ? ` <span class="race-tag">${esc(raceShort(t.race))}</span>` : ''}${rankTxt(e)}${cite ? marker(refNums(e)) : ''}${e.rankNote ? `<span class="desc">${esc(e.rankNote)}</span>` : ''}</span></li>`;
    }).join('')}</ul>`;
  }
  /** candidates whose endorsements most resemble this one's: the number of group endorsers the two share */
  const grpBackers = (id: string) => new Set((edgesIn.get(id) || []).filter((e) => e.kind === 'endorsement' && N(e.s).grp).map((e) => e.s));
  function closest(id: string, k = 3) {
    const A = grpBackers(id);
    return d.coTargets.filter((t) => t !== id).map((t) => ({ t, p: [...grpBackers(t)].filter((x) => A.has(x)).length })).filter((x) => x.p > 0)
      .sort((x, y) => y.p - x.p || N(x.t).name.localeCompare(N(y.t).name)).slice(0, k);
  }
  const simLine = (id: string) => {
    const cl = closest(id); if (!cl.length) return '';
    return ` Similarly endorsed candidates include: ${cl.map((x, i) => `${nlink(N(x.t))}${i < cl.length - 1 ? ',' : ''}`).join(' ')}.`;
  };
  /** the bottom line of a candidate's panel: whose endorsement lists most resemble this one's */
  function placement(n: GNode) {
    if (!n.isTarget || n.analysisEndorser || !g.hasNode(n.id) || !d.coTargets.includes(n.id)) return '';
    const sim = simLine(n.id).trim(); if (!sim) return '';
    return `<p class="place">${sim}</p>`;
  }
  function nodePanel(id: string) {
    const n = N(id);
    const outs = edgesOut.get(id) || []; const ins = edgesIn.get(id) || [];
    const isMem = (e: GEdge) => /member/i.test(e.rel);
    const used = new Set<number>(); const use = (es: GEdge[]) => es.forEach((e) => refNums(e).forEach((x) => used.add(x)));
    const notes = (n.notes || []).filter((x) => !/^No endorsements recorded/.test(x.text)).map((x) => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.text)}</a>` : esc(x.text))).join(' ');
    const isC = n.isTarget && !n.analysisEndorser;
    const sub = [n.type === 'Candidate' || n.type === 'Slate' ? '' : n.type, n.race, !isC && n.title ? n.title : ''].filter(Boolean).join(' · ');
    const site = n.campaignUrl ? `<a class="site" href="${esc(n.campaignUrl)}" target="_blank" rel="noopener">Campaign site<span aria-hidden="true"> ↗</span></a>` : '';
    let html = `<div class="ptools"><button class="back" data-back>← Back</button><button class="cmpbtn" data-compare aria-label="Compare ${esc(n.name)} with others">+ Compare</button></div>
      <header class="nhead">${isC || n.type === 'Slate' || logoUrl(n.name, 48) ? avatar(n) : `<span class="av av-lg av-t" aria-hidden="true">${typeGlyph(n.type)}</span>`}<div><h2 tabindex="-1" id="ntitle">${esc(n.name)}</h2><p class="ntype">${esc(sub || n.type)}${site ? ` · ${site}` : ''}</p></div></header>`;
    // 1. who endorses this candidate (or, for an endorser, whom it endorses)
    // with a filter on, list only the visible links and say how many of the total are shown
    const lead = (label: string, all: GEdge[], es: GEdge[], body: (cite: boolean) => string) => {
      const sr = sharedRef(es); use(es);
      const via = label === 'Endorsed by' ? viaSlate(n) : 0;
      const num = label === 'Endorsed by' ? `${via ? `${via} via slate + ` : ''}${all.length} ${all.length === 1 ? 'group' : 'groups'}` : String(all.length);
      const cnt = es.length < all.length ? `<strong>${label} ${num}</strong> <span class="bsub">· ${es.length} shown (filter on)</span>` : `<strong>${label} ${num}</strong>`;
      const finder = label === 'Endorsed by' && isC && all.length > 10 ? `<div class="efind"><input type="search" class="efq" placeholder="Find a group" aria-label="Find a group among ${esc(n.name)}’s endorsers" autocomplete="off" spellcheck="false"><button type="button" class="efx" data-efclear aria-label="Clear search" hidden>×</button><p class="small muted efnone" role="status" hidden>No match</p></div>` : '';
      return `<section class="lead"><div class="banner"><p class="bn">${cnt}</p>${bannerSrc(sr)}</div>${finder}${es.length ? body(!sr) : ''}</section>`;
    };
    const insV = ins.filter(shownE), outsV = outs.filter(shownE);
    if (ins.length) html += lead('Endorsed by', ins, insV, (cite) => endorserGroups(insV, cite));
    else if (isC && viaSlate(n)) html += `<div class="banner"><p class="bn"><strong>Endorsed through the slate only</strong> <span class="bsub">· ${viaSlate(n)} via slate</span></p></div>`;
    else if (isC) html += `<div class="banner"><p class="bn"><strong>No group endorsements.</strong></p></div>`;
    if (outs.length) html += lead(ins.length ? 'Also endorses' : 'Endorses', outs, outsV, (cite) => targetRows(outsV, cite));
    if (notes) html += `<p class="small notes">${notes}</p>`;
    if (n.typeNote) html += `<p class="small muted">${esc(n.typeNote)}</p>`;
    // slate links (not endorsements)
    const links: [string, GEdge[], 's' | 't'][] = [
      ['Members', memberEdges.filter((e) => e.t === id && isMem(e)), 's'], ['Nominated by', memberEdges.filter((e) => e.t === id && !isMem(e)), 's'],
      ['Member of', memberEdges.filter((e) => e.s === id && isMem(e)), 't'], ['Nominated', memberEdges.filter((e) => e.s === id && !isMem(e)), 't'],
    ];
    for (const [h, es, side] of links) if (es.length) {
      use(es); const sr = sharedRef(es);
      html += `<details class="grp" open><summary><span>${h}</span> <span class="cnt">${es.length}</span> <span class="small muted nt">slate link, not an endorsement</span></summary>${sr ? bannerSrc(sr) : ''}<ul class="klist">${es.map((e) => { const o = N(side === 's' ? e.s : e.t); return `<li>${typeGlyph(o.type)}<span class="kr">${nlink(o)}${sr ? '' : marker(refNums(e))}</span></li>`; }).join('')}</ul></details>`;
    }
    // 2. the network analysis, last and in plain words
    html += placement(n);
    // 3. references used in this panel
    html += refList(used);
    return html;
  }

  /** default panel: every candidate by race, with endorsement counts */
  function candsPanel() {
    const rows = d.races.filter((r) => r.candidates.length).map((r) => {
      const cs = r.candidates.map(N).sort((a, b) => (edgesIn.get(b.id) || []).length - (edgesIn.get(a.id) || []).length || a.name.localeCompare(b.name));
      return `<section class="crace"><h3><i class="sw" style="background:${RACE_COLOR[r.race] || '#888'}"></i>${esc(r.race)}</h3><ul class="clist2">${cs.map((n) => {
        const k = (edgesIn.get(n.id) || []).length;
        return `<li>${avatar(n, 'sm')}${nlink(n)}<span class="num">${k ? k : n.memberOf ? 'via slate' : '0'}</span></li>`;
      }).join('')}</ul></section>`;
    }).join('');
    return `<h2 class="ph">Candidates</h2><p class="pintro">Select a name to see who endorses them. Numbers: endorsements.</p>${rows}`;
  }

  function racePanel() {
    const r = d.races.find((x) => x.race === state.race)!;
    const opts = d.races.map((x) => `<button data-race="${esc(x.race)}" aria-pressed="${x.race === state.race}">${esc(x.race)}</button>`).join('');
    const grpRank = (n: GNode) => (n.type === 'Slate' ? 0 : n.memberOf ? 1 : 2);
    const cands = r.candidates.map(N).sort((a, b) => grpRank(a) - grpRank(b) || (edgesIn.get(b.id) || []).length - (edgesIn.get(a.id) || []).length || a.name.localeCompare(b.name));
    const types = new Set<string>();
    const cards = cands.map((n) => {
      const ins = edgesIn.get(n.id) || []; const via = viaSlate(n);
      const tc = new Map<string, number>(); for (const e of ins) { const t = N(e.s).type; types.add(t); tc.set(t, (tc.get(t) || 0) + 1); }
      const num = via ? (ins.length ? `${via} via slate + ${ins.length}` : `${via} via slate`) : String(ins.length);
      return `<li class="rc">${avatar(n, 'sm')}${nlink(n, undefined, 'strong')}<span class="num">${num}</span>${ins.length || via ? typeBar(tc, via) : ''}${ins.length ? '' : `<p class="small muted">${via ? 'Endorsed through the slate only' : 'No endorsements recorded'}</p>`}</li>`;
    }).join('');
    const m = new Map<string, string[]>();
    for (const c of r.candidates) for (const e of edgesIn.get(c) || []) { if (!m.has(e.s)) m.set(e.s, []); m.get(e.s)!.push(c); }
    const shared = [...m.entries()].filter(([, cs]) => cs.length >= 2).sort((a, b) => b[1].length - a[1].length || N(a[0]).name.localeCompare(N(b[0]).name));
    const sharedHtml = shared.length ? `<ul class="shared">${shared.map(([s, cs]) => `<li>${typeGlyph(N(s).type)}${nlink(N(s))} <span class="small muted">→ ${cs.map((c) => esc(shortName(N(c)))).join(', ')}</span></li>`).join('')}</ul>`
      : '<p class="muted small">No endorser backs more than one candidate in this race.</p>';
    // Rent Board vs council
    let rbc = '';
    if (r.race === 'Rent Board') {
      const units: { label: string; ids: string[]; rep: string }[] = [];
      if (ix.slate) units.push({ label: 'Slate (page + members)', ids: [ix.slate.id, ...ix.slateMembers], rep: ix.slate.id });
      for (const n of cands) if (n.type !== 'Slate' && !n.memberOf) units.push({ label: shortName(n), ids: [n.id], rep: n.id });
      const council = d.nodes.filter((n) => n.isTarget && (n.race || '').startsWith('Council') && n.inDeg > 0);
      const endSet = (ids: string[]) => new Set(ids.flatMap((i) => (edgesIn.get(i) || []).map((e) => e.s)));
      rbc = units.map((u) => {
        const U = endSet(u.ids);
        const rows = council.map((c) => { const C = endSet([c.id]); const sh = [...U].filter((x) => C.has(x)).length; return { c, sh }; })
          .filter((x) => x.sh > 0).sort((a, b) => b.sh - a.sh || a.c.name.localeCompare(b.c.name)).slice(0, 6);
        return `<h4>${esc(u.label)}</h4><table class="mini"><thead><tr><th scope="col">Council candidate</th><th scope="col" class="num">Shared endorsers</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${nlink(x.c)} <span class="race-tag">${esc(raceShort(x.c.race))}</span></td><td class="num">${x.sh}</td></tr>`).join('')}</tbody></table>`;
      }).join('');
      rbc = `<h3>Shared with council candidates</h3>${rbc}`;
    }
    return `<h2 class="ph">Compare a race</h2><div class="seg wrap" role="group" aria-label="Race">${opts}</div>
      <ul class="rcs">${cards}</ul>${typeKey([...types])}${rbc}
      <h3>Endorsers shared within the race <span class="cnt">${shared.length}</span></h3>${sharedHtml}`;
  }

  // ---------- compare: up to MAXSEL nodes side by side ----------
  let capNote = false;
  function setMulti(m: string[], announce: boolean) {
    state.selected = null; state.multi = m.slice(0, MAXSEL);
    computeHidden(); renderFilter(); recompute(); refresh({ skipIndexation: true }); renderPanel();
    if (!m.length) goHome();
    if (announce) panel.querySelector<HTMLElement>('#ctitle')?.focus({ preventScroll: true });
  }
  /** shift-, cmd- or ctrl-click, "+ Add" in search, or any click while comparing: add the node, or remove it if already in */
  function toggle(id: string) {
    let m = state.multi.length ? [...state.multi] : state.selected ? [state.selected] : [];
    capNote = false;
    if (m.includes(id)) m = m.filter((x) => x !== id);
    else if (m.length >= MAXSEL) { capNote = true; renderPanel(); return; }
    else m.push(id);
    if (!m.length) { select(null); return; }
    setMulti(m, false);
  }
  const shortN = (n: GNode) => (n.type === 'Slate' ? n.name : /Individual|official|Candidate/.test(n.type) ? surname(n) : n.name);
  function comparePanel() {
    const sel = state.multi.map(N);
    const used = new Set<number>(); const cite = (es: GEdge[]) => { const ns = [...new Set(es.flatMap(refNums))].sort((a, b) => a - b); ns.forEach((x) => used.add(x)); return marker(ns); };
    const chips = `<ul class="cchips" aria-label="Selected">${sel.map((n) => `<li class="cchip">${avatar(n, 'sm')}${nlink(n, shortN(n))}<button class="cx" data-unsel="${esc(n.id)}" aria-label="Remove ${esc(n.name)}">×</button></li>`).join('')}<li><button class="cclear" data-clear>Clear</button></li></ul>`;
    let html = `<h2 class="ph" id="ctitle" tabindex="-1">Compare</h2>${chips}`;
    if (capNote) html += `<p class="small muted" role="status">Up to ${MAXSEL} at a time. Remove one to add another.</p>`;
    if (sel.length < 2) return html + `<p class="pintro">Add another name: shift-click it on the graph, or use “+ Add” in search.</p>`;
    // links among the selected themselves (e.g. an official who endorses a candidate)
    const between: GEdge[] = [];
    for (const a of sel) for (const e of edgesOut.get(a.id) || []) if (state.multi.includes(e.t)) between.push(e);
    const ends = sel.filter((n) => !n.isTarget || n.analysisEndorser), cands = sel.filter((n) => n.isTarget && !n.analysisEndorser);
    if (between.length) html += `<ul class="between">${between.map((e) => `<li>${nlink(N(e.s), shortN(N(e.s)))} endorses ${nlink(N(e.t), shortN(N(e.t)))}${cite([e])}</li>`).join('')}</ul>`;
    else if (ends.length && cands.length) html += `<p class="between">${sel.length === 2 ? `${esc(shortN(ends[0]))} does not endorse ${esc(shortN(cands[0]))}.` : 'None of them endorses another.'}</p>`;
    // neighbours through endorsements, respecting the filter
    const nb = new Map<string, Map<string, GEdge[]>>();   // selected id -> neighbour id -> edges
    let filtered = false;
    for (const a of sel) {
      const m = new Map<string, GEdge[]>();
      for (const e of [...(edgesIn.get(a.id) || []), ...(edgesOut.get(a.id) || [])]) {
        const o = e.s === a.id ? e.t : e.s; if (state.multi.includes(o)) continue;
        if (!shownE(e)) { filtered = true; continue; }
        (m.get(o) || m.set(o, []).get(o)!).push(e);
      }
      nb.set(a.id, m);
    }
    const common = [...nb.get(sel[0].id)!.keys()].filter((o) => sel.every((a) => nb.get(a.id)!.has(o)));
    const both = sel.length === 2 ? 'both' : `all ${sel.length}`;
    const what = !ends.length ? `endorsers who back ${both}` : !cands.length ? `candidates ${both} endorse` : `people and groups linked to ${both}`;
    const order = (ids: string[]) => ids.sort((x, y) => GROUPS.indexOf(groupOf(N(x).type)) - GROUPS.indexOf(groupOf(N(y).type)) || (N(y).outDeg + N(y).inDeg) - (N(x).outDeg + N(x).inDeg) || N(x).name.localeCompare(N(y).name));
    const rows = (ids: string[], edgesFor: (o: string) => GEdge[]) => order(ids).map((o, i) => {
      const n = N(o);
      return `<li${i >= LIM ? ' class="more" hidden' : ''}>${logoAv(n, 'sm') || typeGlyph(n.type)}<span class="kr">${nlink(n)}${n.race && n.isTarget ? ` <span class="race-tag">${esc(raceShort(n.race))}</span>` : ''}${cite(edgesFor(o))}</span></li>`;
    }).join('');
    const more = (k: number) => (k > LIM ? `<button class="showmore">Show all ${k}</button>` : '');
    html += `<section class="lead"><div class="banner"><p class="bn"><strong>In common: ${common.length}</strong> <span class="bsub">${what}${filtered ? ' · filter on' : ''}</span></p></div>
      ${common.length ? `<ul class="klist">${rows(common, (o) => sel.flatMap((a) => nb.get(a.id)!.get(o)!))}</ul>${more(common.length)}` : '<p class="small muted">Nobody in common.</p>'}</section>`;
    // what each one has alone
    for (const a of sel) {
      const only = [...nb.get(a.id)!.keys()].filter((o) => !common.includes(o));
      if (!only.length) continue;
      html += `<details class="grp only"><summary><span>Only ${esc(shortN(a))}</span> <span class="cnt">${only.length}</span></summary><ul class="klist">${rows(only, (o) => nb.get(a.id)!.get(o)!)}</ul>${more(only.length)}</details>`;
    }
    return html + refList(used);
  }

  function renderPanel() {
    panel.innerHTML = comparing() ? comparePanel() : state.selected ? nodePanel(state.selected) : state.view === 'race' ? racePanel() : candsPanel();
    panel.scrollTop = 0;
    updatePill();
  }
  function renderLegend() {
    const L = $('#legend');
    const races = d.races.filter((r) => r.candidates.length).map((r) => `<li><span class="dot cand" style="background:${RACE_COLOR[r.race] || '#888'}"></span><span>${esc(raceShort(r.race))}</span></li>`).join('');
    const used = new Set(d.nodes.filter((n) => !n.isTarget).map((n) => groupOfType(n.type)));
    const groups = Object.keys(GROUP_COLOR).filter((k) => used.has(k)).map((k) => `<li><span class="dot" style="background:${GROUP_COLOR[k]}"></span><span>${GROUP_LABEL[k]}</span></li>`).join('');
    L.innerHTML = `<p class="lh">Race category</p><ul>${races}</ul><p class="lh">Endorsers</p><ul>${groups}</ul>
      <p><span class="lline"></span>endorsement${memberEdges.length ? ' <span class="lline mem"></span>slate link' : ''}${state.view === 'race' ? ' <span class="ringk"></span>endorser shared within the race' : ''} <span class="selk"></span>selected</p>`;
  }
  // ---------- bottom sheet (narrow screens) ----------
  const sheet = $('#sheet'); const handle = $<HTMLButtonElement>('#sheetbtn');
  function setSheet(open: boolean) {
    sheet.classList.toggle('open', open); app.classList.toggle('sheet-open', open); handle.setAttribute('aria-expanded', String(open));
    handle.querySelector('span')!.textContent = open ? 'Hide details' : comparing() ? `Comparing ${state.multi.length}` : state.selected ? `Details: ${N(state.selected).name}` : 'Candidates and races';
  }
  handle.addEventListener('click', () => setSheet(!sheet.classList.contains('open')), on);
  function updatePill() { if (stackMQ.matches) setSheet(sheet.classList.contains('open') || !!state.selected || comparing()); }
  // ---------- interactions ----------
  function select(id: string | null, fly = true) {
    const had = state.selected || comparing();
    state.multi = [];
    state.selected = id; computeHidden(); renderFilter(); recompute(); refresh({ skipIndexation: true }); renderPanel();
    if (id && fly) { if (stackMQ.matches) setTimeout(() => flyTo(id), 260); else flyTo(id); }
    if (!id && had) goHome();
  }
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  function setView(v: View) {
    state.view = v; state.selected = null; state.multi = [];
    tabs.forEach((b) => { const on = b.dataset.view === v; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', `tab-${v}`);
    recompute(); refresh({ skipIndexation: true }); renderPanel(); renderLegend();
  }
  tabs.forEach((b) => {
    b.addEventListener('click', () => { setView(b.dataset.view as View); goHome(); }, on);
    b.addEventListener('keydown', (ev) => {
      const i = tabs.indexOf(b); let j = -1;
      if (ev.key === 'ArrowRight') j = (i + 1) % tabs.length; else if (ev.key === 'ArrowLeft') j = (i + tabs.length - 1) % tabs.length;
      else if (ev.key === 'Home') j = 0; else if (ev.key === 'End') j = tabs.length - 1;
      if (j >= 0) { ev.preventDefault(); tabs[j].focus(); tabs[j].click(); }
    }, on);
  });
  root.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    if (t.closest('.skip')) { ev.preventDefault(); $('#q').focus(); return; }   // its #q href would go to the article's URL
    const nb = t.closest<HTMLElement>('[data-node]');
    if (nb) {
      ev.preventDefault(); const id = nb.dataset.node!;
      const me = ev as MouseEvent;
      if (me.shiftKey || me.metaKey || me.ctrlKey) toggle(id); else select(id); return;
    }
    if (t.closest('[data-back]')) { select(null); return; }
    if (t.closest('[data-compare]')) { if (state.selected) setMulti([state.selected], true); return; }
    const un = t.closest<HTMLElement>('[data-unsel]'); if (un) { setMulti(state.multi.filter((x) => x !== un.dataset.unsel), true); return; }
    if (t.closest('[data-clear]')) { select(null); return; }
    const rb = t.closest<HTMLElement>('[data-race]'); if (rb) { state.race = rb.dataset.race!; recompute(); refresh({ skipIndexation: true }); renderPanel(); return; }
    if (t.closest('[data-ref]')) return;   // citation numbers open their source in a new tab
    const sm = t.closest<HTMLButtonElement>('.showmore');
    if (sm) { sm.previousElementSibling?.querySelectorAll('li.more').forEach((li) => { (li as HTMLElement).hidden = false; delete (li as HTMLElement).dataset.h; }); sm.remove(); }
    const ec = t.closest<HTMLElement>('[data-efclear]');
    if (ec) { const inp = ec.parentElement!.querySelector<HTMLInputElement>('.efq')!; inp.value = ''; filterEndorsers(inp); inp.focus(); }
  }, on);
  panel.addEventListener('input', (ev) => { const t = ev.target as HTMLElement; if (t.classList.contains('efq')) filterEndorsers(t as HTMLInputElement); }, on);
  $<HTMLInputElement>('#showall').addEventListener('change', (e) => { state.showAll = (e.target as HTMLInputElement).checked; setFrame(); fitSheet(); cam?.setState(home()); recompute(); refresh(); renderLegend(); }, on);
  root.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key !== 'Escape') return;
    const ef = e.target as HTMLInputElement | null;
    if (ef?.classList?.contains('efq') && ef.value) { ef.value = ''; filterEndorsers(ef); return; }   // Escape first clears the group search
    const fb = root.getElementById('filterbox') as HTMLDetailsElement | null;
    if (fb?.open) { fb.open = false; fb.querySelector('summary')?.focus(); return; }   // close the filter first
    if (state.selected || comparing()) select(null);
  }, on);
  const setPeek = (ev: Event) => { const t = (ev.target as HTMLElement)?.closest?.<HTMLElement>('[data-node]'); const id = t && ev.type !== 'focusout' && ev.type !== 'mouseout' ? t.dataset.node! : null; if (id !== peek) { peek = id; drawOverlay(); } };
  for (const ev of ['focusin', 'focusout', 'mouseover', 'mouseout']) root.addEventListener(ev, setPeek, { passive: true, signal });
  midMQ.addEventListener('change', () => drawOverlay());
  // portrait phones: the upright network is about as wide as it is tall, so it cannot fill the screen's height without
  // cropping its sides. Give the leftover height to the bottom sheet, which then shows the panel (a peek) instead of empty canvas.
  function fitSheet() {
    app.style.removeProperty('--peek'); sheet.classList.remove('peek'); homeMemo = null;
    if (!narrowMQ.matches || state.showAll) { app.classList.add('sheet-ready'); return; }
    home(); const spare = container.clientHeight - (homeBottom + 64);
    if (spare >= 120) { app.style.setProperty('--peek', `${Math.round(52 + spare)}px`); sheet.classList.add('peek'); }
    homeMemo = null;
    if (renderer) { renderer.resize(); cam?.setState(home()); }
    refresh();
    app.classList.add('sheet-ready');
  }
  fitSheet();
  let rsz = 0; let lastSize = `${host.clientWidth}x${host.clientHeight}`;
  const hostRO = new ResizeObserver(() => {
    const size = `${host.clientWidth}x${host.clientHeight}`; if (size === lastSize) return; lastSize = size;
    cancelAnimationFrame(rsz); rsz = requestAnimationFrame(fitSheet);
  });
  hostRO.observe(host); signal.addEventListener('abort', () => { hostRO.disconnect(); cancelAnimationFrame(rsz); });
  narrowMQ.addEventListener('change', () => { setFrame(); fitSheet(); cam?.setState(home()); recompute(); refresh(); renderLegend(); });

  // ---------- search (ARIA combobox) ----------
  const q = $<HTMLInputElement>('#q'); const qres = $('#qres');
  const searchIdx = d.nodes.map((n) => ({ id: n.id, key: norm([n.name, ...n.variants].join(' | ')) }));
  let hits: string[] = []; let hi = 0;
  // with something selected, each result also gets an "Add" option that puts it in the comparison
  let opts: { id: string; add: boolean }[] = [];
  function renderHits() {
    const canAdd = !!state.selected || comparing();
    opts = hits.flatMap((id) => (canAdd && id !== state.selected ? [{ id, add: false }, { id, add: true }] : [{ id, add: false }]));
    hi = Math.max(0, Math.min(hi, opts.length - 1));
    qres.classList.toggle('canadd', canAdd);
    qres.innerHTML = opts.map((o, i) => {
      const n = N(o.id);
      if (o.add) { const on = state.multi.includes(o.id); return `<li role="option" class="addopt" id="opt-${i}" aria-selected="${i === hi}" data-add="${esc(o.id)}" aria-label="${on ? 'Remove' : 'Add'} ${esc(n.name)} ${on ? 'from' : 'to'} the comparison">${on ? '− Remove' : '+ Add'}</li>`; }
      return `<li role="option" id="opt-${i}" aria-selected="${i === hi}" data-hit="${esc(o.id)}" class="${canAdd && o.id !== state.selected ? 'hasadd' : ''}">${n.isTarget ? avatar(n, 'sm') : typeGlyph(n.type)}<span>${esc(n.name)}</span><small>${esc(n.type)}${n.race ? ' · ' + esc(n.race) : ''}</small></li>`;
    }).join('')
      || (q.value.trim() ? '<li class="none" role="option" aria-disabled="true" aria-selected="false">No match</li>' : '');
    const open = !!q.value.trim();
    qres.hidden = !open; q.setAttribute('aria-expanded', String(open));
    if (opts.length) q.setAttribute('aria-activedescendant', `opt-${hi}`); else q.removeAttribute('aria-activedescendant');
  }
  q.addEventListener('input', () => {
    const s = norm(q.value.trim()); hi = 0;
    hits = s ? searchIdx.filter((x) => x.key.includes(s) && !HIDDEN.has(x.id)).map((x) => x.id)
      .sort((a, b) => (Number(norm(N(b).name).startsWith(s)) - Number(norm(N(a).name).startsWith(s))) || (N(b).outDeg + N(b).inDeg - N(a).outDeg - N(a).inDeg)).slice(0, 8) : [];
    renderHits();
  }, on);
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, opts.length - 1); renderHits(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { hi = Math.max(hi - 1, 0); renderHits(); e.preventDefault(); }
    else if (e.key === 'Enter' && opts[hi]) { e.preventDefault(); const o = opts[hi]; if (o.add || e.shiftKey) addFromSearch(o.id); else choose(o.id); }
    else if (e.key === 'Escape') { qres.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  }, on);
  qres.addEventListener('mousedown', (e) => {
    const ad = (e.target as HTMLElement).closest<HTMLElement>('[data-add]'); if (ad) { e.preventDefault(); addFromSearch(ad.dataset.add!); return; }
    const li = (e.target as HTMLElement).closest<HTMLElement>('[data-hit]'); if (li) { e.preventDefault(); const me = e as MouseEvent; if (me.shiftKey || me.metaKey || me.ctrlKey) addFromSearch(li.dataset.hit!); else choose(li.dataset.hit!); }
  }, on);
  q.addEventListener('blur', () => setTimeout(() => { qres.hidden = true; q.setAttribute('aria-expanded', 'false'); }, 120), on);
  function choose(id: string) { q.value = N(id).name; qres.hidden = true; q.setAttribute('aria-expanded', 'false'); if (comparing()) toggle(id); else select(id); }
  function addFromSearch(id: string) { q.value = ''; qres.hidden = true; q.setAttribute('aria-expanded', 'false'); toggle(id); }

  /** the starting state: everyone shown, the candidates view */
  function initState() { computeHidden(); renderFilter(); setView('cands'); }

  // ---------- filter control ----------
  const fbox = $<HTMLDetailsElement>('#filterbox');
  $('#ftypes').innerHTML = FTYPES.map((f) => `<button type="button" class="fchip" data-ft="${f.k}" aria-pressed="true">${typeGlyph(f.types[0])}${f.label}</button>`).join('');
  $('#fraces').innerHTML = RACES.map((r) => `<button type="button" class="fchip" data-fr="${esc(r)}" aria-pressed="true">${esc(raceShort(r))}</button>`).join('');
  function renderFilter() {
    fbox.querySelectorAll<HTMLButtonElement>('[data-ft]').forEach((b) => b.setAttribute('aria-pressed', String(!filt.hideT.has(b.dataset.ft!))));
    fbox.querySelectorAll<HTMLButtonElement>('[data-fr]').forEach((b) => b.setAttribute('aria-pressed', String(!filt.hideR.has(b.dataset.fr!))));
    const k = filt.hideT.size + filt.hideR.size; const fc = $('#fcount');
    fc.hidden = !k; fc.textContent = String(k); fc.setAttribute('aria-label', `${k} active`);
    const tot = g.order, vis = tot - [...HIDDEN].filter((id) => g.hasNode(id)).length;
    $('#fstat').textContent = k ? `${vis} of ${tot} shown` : 'Showing everyone';
    $<HTMLButtonElement>('#freset').disabled = !k;
  }
  function applyFilter() {
    if (state.selected && filt.hideR.has(N(state.selected).race || '')) state.selected = null;
    state.multi = state.multi.filter((x) => !filt.hideR.has(N(x).race || ''));
    computeHidden(); renderFilter(); homeMemo = null;
    recompute(); refresh(); renderPanel();
    if (narrowMQ.matches) cam?.setState(home());
  }
  fbox.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button'); if (!b) return;
    if (b.dataset.ft) { const k = b.dataset.ft; filt.hideT.has(k) ? filt.hideT.delete(k) : filt.hideT.add(k); applyFilter(); }
    else if (b.dataset.fr) { const r = b.dataset.fr; filt.hideR.has(r) ? filt.hideR.delete(r) : filt.hideR.add(r); applyFilter(); }
    else if (b.id === 'freset') { filt.hideT.clear(); filt.hideR.clear(); applyFilter(); }
  }, on);
  // clicks inside the shadow root reach the document retargeted to the host, so check the event's path instead
  document.addEventListener('click', (e) => { if (fbox.open && !e.composedPath().includes(fbox)) fbox.open = false; }, on);

  ($('#legendbox') as HTMLDetailsElement).open = host.clientWidth >= 1280;   // collapsed below 1280 px so it never covers the graph
  await tick(); if (signal.aborted) return;
  initState();
}

