// Shared, data-driven prose. Every number, name and claim in here is computed from graph.json.
import type { Data, GNode } from './types';
import PALETTE from './palette.json';

// node colours: candidates by race, endorsers by type group (the same groups as the filter chips)
export const RACE_COLOR: Record<string, string> = PALETTE.race;
export const GROUP_COLOR: Record<string, string> = PALETTE.group;
export const GROUP_TYPES: Record<string, string[]> = PALETTE.groupTypes;
export const GROUP_LABEL: Record<string, string> = { people: 'Individuals', officials: 'Elected officials', unions: 'Unions', clubs: 'Clubs and parties', advocacy: 'Advocacy groups' };
export const groupOfType = (t: string) => Object.keys(GROUP_TYPES).find((k) => GROUP_TYPES[k].includes(t));
export const nodeColor = (n: GNode) => (n.isTarget ? RACE_COLOR[n.race || ''] || PALETTE.other : GROUP_COLOR[groupOfType(n.type) || ''] || PALETTE.other);
export const SLATE = 'Berkeley Right to Housing slate';

// actor types: shapes, and colours from the endorser type groups above
export const TYPE_ORDER = ['Candidate', 'Candidate (withdrawn)', 'Slate', 'Political party', 'Democratic club', 'Club', 'Political/advocacy org', 'Union',
  'Current elected official', 'Former elected official', 'Individual'];
export const TYPE_SHAPE: Record<string, string> = {
  'Candidate': '●', 'Candidate (withdrawn)': '○', 'Slate': '◆', 'Political party': '⬟', 'Democratic club': '■', 'Club': '◼', 'Political/advocacy org': '▲', 'Union': '▼',
  'Current elected official': '★', 'Former elected official': '☆', 'Individual': '•',
};
export const TYPE_RAMP: Record<string, string> = {
  'Candidate': '#1b1b1b', 'Candidate (withdrawn)': '#8c8c8c', 'Slate': '#1b1b1b',
  ...Object.fromEntries(Object.entries(PALETTE.groupTypes).flatMap(([g, ts]) => ts.map((t) => [t, (PALETTE.group as Record<string, string>)[g]]))),
};

export const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function listJoin(a: string[], conj = 'and'): string {
  if (a.length <= 1) return a.join('');
  if (a.length === 2) return `${a[0]} ${conj} ${a[1]}`;
  return `${a.slice(0, -1).join(', ')}, ${conj} ${a[a.length - 1]}`;
}
export const semiJoin = (a: string[]) => (a.length <= 2 ? a.join(a.length === 2 ? '; and ' : '') : `${a.slice(0, -1).join('; ')}; and ${a[a.length - 1]}`);
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const numWord = (n: number) => (n >= 0 && n < NUM.length ? NUM[n] : String(n));
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const pct = (p: number) => (p > 0 && p < 0.005 ? "<1%" : p < 1 && p >= 0.995 ? ">99%" : `${Math.round(p * 100)}%`);
export const plural = (n: number, one: string, many = one + 's') => (n === 1 ? one : many);

function lum(h: string) {
  const c = (x: number) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * c(parseInt(h.slice(1, 3), 16)) + 0.7152 * c(parseInt(h.slice(3, 5), 16)) + 0.0722 * c(parseInt(h.slice(5, 7), 16));
}
export const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const onColor = (bg: string) => (contrast('#ffffff', bg) >= 4.5 ? '#ffffff' : '#111111');

let LABELS = new Map<string, string>();
/** reader-facing name of a source page: the organization, the candidate's campaign site, or the county voter guide */
export const srcLabel = (u: string) => {
  const l = LABELS.get(u); if (l) return l;
  if (u.includes('acvote.alamedacountyca.gov')) return 'Alameda County voter guide';
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; }
};
export const srcHref = (u: string, pg?: string) => (pg && /\.pdf$/i.test(u) ? `${u}#page=${encodeURIComponent(pg)}` : u);

export function index(d: Data) {
  if (d.urlLabels) LABELS = new Map(d.urls.map((u, i) => [u, d.urlLabels[i]]));
  const byId = new Map<string, GNode>(d.nodes.map((n) => [n.id, n]));
  const byName = new Map<string, GNode>(d.nodes.map((n) => [n.name, n]));
  const out = new Map<string, string[]>(); const inn = new Map<string, string[]>();
  for (const e of d.edges) {
    if (e.kind === 'member') continue;
    if (!out.has(e.s)) out.set(e.s, []); out.get(e.s)!.push(e.t);
    if (!inn.has(e.t)) inn.set(e.t, []); inn.get(e.t)!.push(e.s);
  }
  const slate = d.nodes.find((n) => n.type === 'Slate' && n.isTarget);
  const slateMembers = d.nodes.filter((n) => slate && n.memberOf === slate.id).map((n) => n.id);
  return { byId, byName, out, inn, slate, slateMembers };
}
export type Ix = ReturnType<typeof index>;

/** two letters for an avatar without a photo: first and last name ("Igor A. Tregub" -> "IT") */
export const initials = (n: GNode) => { const w = n.name.replace(/[“"][^”"]*[”"]/g, ' ').replace(/[^\p{L}\s'’-]/gu, ' ').trim().split(/\s+/).filter(Boolean); return ((w[0]?.[0] || '') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };
export const surname = (n: GNode) => (n.type === 'Slate' ? 'the slate' : n.name.replace(/[“"][^”"]*[”"]\s*/, '').trim().split(/\s+/).pop()!);
export const shortName = (n: GNode) => (n.type === 'Slate' ? n.name.replace(/^Berkeley /, '') : n.name.replace(/ [“"][^”"]*[”"]/, ''));
export const raceShort = (r?: string) => (r || '').replace('Council ', '');

export const nlink = (n: GNode, label?: string, cls = '') => `<button class="nlink ${cls}" data-node="${esc(n.id)}">${esc(label ?? n.name)}</button>`;
export const typeGlyph = (t: string) => `<span class="tg" aria-hidden="true" title="${esc(t)}">${TYPE_SHAPE[t] || '•'}</span>`;

/** up to k distinct sources behind a set of edges, primary (org's own page) first */
export function keySources(d: Data, filter: (e: Data['edges'][number]) => boolean, k = 3) {
  const seen = new Map<string, { u: string; pg?: string; pr: boolean; n: number }>();
  for (const e of d.edges) if (filter(e)) for (const x of e.src) {
    const u = d.urls[x.u]; const key = u + (x.pg || '');
    const cur = seen.get(key) || { u, pg: x.pg, pr: !!x.pr, n: 0 }; cur.n++; seen.set(key, cur);
  }
  return [...seen.values()].sort((a, b) => Number(b.pr) - Number(a.pr) || b.n - a.n).slice(0, k);
}
export function sourcesLine(d: Data, srcs: { u: string; pg?: string; pr: boolean }[]) {
  if (!srcs.length) return '';
  const uniq = new Map<string, { u: string; pg?: string; pr: boolean }>();
  for (const s of srcs) if (!uniq.has(s.u + (s.pg || ''))) uniq.set(s.u + (s.pg || ''), s);
  return ` <span class="fsrc">Sources: ${[...uniq.values()].map((s) => `<a href="${esc(srcHref(s.u, s.pg))}" target="_blank" rel="noopener">${esc(srcLabel(s.u))}${s.pg ? ` p.&nbsp;${esc(s.pg)}` : ''}</a>${s.pr ? ' <span class="prim">primary</span>' : ''}`).join(', ')}</span>`;
}
const pageSrc = (n: GNode) => (n.endorsementsPage || n.campaignUrl ? [{ u: (n.endorsementsPage || n.campaignUrl)!, pr: false }] : []);

/** source lines prefer primary pages (an organization's own list) */
export function primaryFirst(d: Data, filter: (e: Data['edges'][number]) => boolean, k = 3) {
  const all = keySources(d, filter, 50); const pr = all.filter((x) => x.pr);
  return (pr.length ? pr : all).slice(0, k);
}

export interface Texts {
  headline: string; findings: string[]; title: string; description: string; statsLine: string;
  overviewAlt: string; overviewKey: string; graphSummary: string; strip: string;
}

/** shared endorsers between the slate and every other candidate, by raw count */
export function slateShares(d: Data, ix: Ix) {
  const sl = ix.slate; if (!sl) return null;
  const sE = new Set(ix.inn.get(sl.id) || []);
  const rows = d.nodes.filter((n) => n.isTarget && n.id !== sl.id && !n.analysisEndorser)
    .map((n) => ({ n, k: new Set((ix.inn.get(n.id) || []).filter((x) => sE.has(x))).size }))
    .filter((x) => x.k > 0).sort((a, b) => b.k - a.k || a.n.name.localeCompare(b.n.name));
  return { sl, nS: sE.size, rows };
}
export function buildTexts(d: Data): Texts {
  const ix = index(d); const S = d.summary;
  const N = (id: string) => ix.byId.get(id)!;
  const nRaces = d.races.filter((r) => r.candidates.length).length;
  const findings: string[] = [];
  const so = d.slateOverlap;

  // ---- headline + lede: raw counts of shared backers (no clustering), with the base rate ----
  const sh = slateShares(d, ix);
  const top3 = sh ? sh.rows.slice(0, 3) : [];
  const slRace = sh?.sl.race || '';
  let headline = 'Berkeley endorsement network, November 2026';
  let strip = '';
  if (sh && top3.length) {
    const [a, b] = top3;
    const lb = so?.leadBoot;
    const aSure = !b || b.k < a.k && (!lb || lb.a !== a.n.id || lb.aLeads >= 0.95);
    const maj = (r?: typeof a) => !!r && r.k * 2 > sh.nS;
    if (maj(a) && (aSure || !maj(b))) headline = `Most of the ${slRace} slate’s backers also back ${a.n.name}`;
    else if (maj(a) && maj(b)) headline = `Most of the ${slRace} slate’s backers also back ${a.n.name} and ${b.n.name}`;
    else if (aSure) headline = `The ${slRace} slate shares the most backers with ${a.n.name}`;
    let p = `Of the ${nlink(sh.sl, 'slate’s')} ${sh.nS} backers, ${listJoin(top3.map((r, i) => `${r.k}${i === 0 ? ' also back' : ''} ${nlink(r.n)}`))}.`;
    const base = top3.map((r) => so?.council.find((c) => c.t === r.n.id));
    if (so && base.every((b) => b && b.base !== undefined)) {
      p += ` Among other multi-candidate endorsers, ${listJoin(top3.map((r, i) => `${pct(base[i]!.base ?? 0)}${i === 0 ? ' back' : ''} ${esc(surname(r.n))}`))}.`;
      // the candidate whose list is shortest yet most drawn from the slate's
      const rows = top3.map((r, i) => ({ r, c: base[i]! }));
      const g = rows.slice().sort((x, y) => x.c.nList - y.c.nList)[0];
      if (g && g.r.k * 2 > g.c.nList && rows.every((x) => x === g || x.c.nList > g.c.nList)) p += ` ${esc(surname(g.r.n))} has only ${g.c.nList} backers, but ${g.r.k} of them also back the slate.`;
    }
    findings.push(p);
    // headline graphic: of the slate's backers, how many back each council candidate; tick = base rate
    if (so) {
      const rowsC = so.council.slice().sort((x, y) => y.n - x.n || N(x.t).name.localeCompare(N(y.t).name));
      const hl = new Set(top3.filter((r) => headline.includes(r.n.name)).map((r) => r.n.id));   // bars for the candidates the headline names
      const W = (v: number) => `${((100 * v) / sh.nS).toFixed(2)}%`;
      strip = `<figure class="strip" aria-labelledby="strip-cap"><div class="strip-rows" role="img" aria-label="${esc(rowsC.map((c) => `${N(c.t).name}: ${c.n} of ${sh.nS}; other endorsers ${pct(c.base ?? 0)}`).join('. '))}">${rowsC.map((c) => `<div class="srow${hl.has(c.t) ? ' hl' : ''}" aria-hidden="true"><span class="sname">${esc(surname(N(c.t)))}</span><span class="sbar"><i style="width:${W(c.n)}"></i>${c.base !== undefined ? `<b style="left:${W(c.base * sh.nS)}"></b>` : ''}<span class="snum" style="left:${W(c.n)}">${c.n}</span></span></div>`).join('')}</div><figcaption id="strip-cap">Bars: how many of the slate’s ${sh.nS} backers also back each council candidate. Ticks: the share of other multi-candidate endorsers who do.</figcaption></figure>`;
    }
  }

  // ---- overview figure key + alt ----
  const used = new Set(d.nodes.filter((n) => !n.isTarget && !n.leaf && n.grp).map((n) => groupOfType(n.type)));
  const sw = (c: string) => `<i class="sw" style="background:${c}"></i>`;
  const overviewKey = `<p class="small okey2"><span><b>Candidates</b>, outlined, by race:</span> ${Object.entries(RACE_COLOR).filter(([r]) => d.races.some((x) => x.race === r)).map(([r, c]) => `<span>${sw(c)}${esc(raceShort(r))}</span>`).join(' ')}<br><span><b>Endorsers</b>:</span> ${Object.keys(GROUP_COLOR).filter((k) => used.has(k)).map((k) => `<span>${sw(GROUP_COLOR[k])}${GROUP_LABEL[k]}</span>`).join(' ')}. Dashed: slate link.</p>`;
  const overviewAlt = `Network diagram of the ${S.nCore} most connected candidates and endorsers, each line one endorsement. Candidates are coloured by race and endorsers by type.`;
  const graphSummary = `Interactive network of ${d.nodes.filter((n) => n.grp || n.isTarget).length} candidates and endorsers and ${S.nGroupEdges} endorsements. ${overviewAlt} Use search or the side panel to explore by keyboard.`;
  const nCand = d.nodes.filter((n) => n.isTarget && n.type !== 'Slate' && !n.analysisEndorser).length;
  const nSlates = d.nodes.filter((n) => n.isTarget && n.type === 'Slate').length;
  const statsLine = `${S.nEndorsementEdges.toLocaleString('en-US')} endorsements · ${S.nEndorsers} endorsers · ${nRaces} races`;
  return {
    headline: 'Who backs whom in Berkeley’s November 2026 election', findings, statsLine, overviewAlt, overviewKey, graphSummary, strip,
    title: 'Who backs whom in Berkeley’s November 2026 election | The Daily Californian',
    description: 'The Daily Californian mapped which political groups and elected officials are backing which candidates.',
  };
}
