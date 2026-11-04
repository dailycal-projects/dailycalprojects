// Adapted from ucpd_crime_log/src/scripts/data.js.
import { csvParse } from 'd3';
import { viewHref } from '../views';
import STATUTES from './statutes.json';

const BASE = 'https://docs.google.com/spreadsheets/d/1tib7sgkUmbr4M7MXzn78MzTENa0qXbjpGCCSszXBkLg';
const OLD_BASE = 'https://docs.google.com/spreadsheets/d/1ccCXzUZKwDrQiQrAvXG9pBfg6Ek4S0NURqNaN9YxH_g';
export const DATA_SOURCES = [
  { label: 'Raw Data', href: `${BASE}/edit?gid=1110217855#gid=1110217855`, csv: `${BASE}/gviz/tq?tqx=out:csv&sheet=Incidents` },
  { label: 'Older Raw Data', href: `${OLD_BASE}/edit?gid=713202959#gid=713202959`, csv: `${OLD_BASE}/gviz/tq?tqx=out:csv&gid=713202959` },
];
const ARCHIVE = `${BASE}/htmlview/sheet?headers=true&gid=1110217855`;

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
export const fmt = (t) => new Date(t).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const LINK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 013.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 014.5 9l1-1"/></svg>';
const CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';
const ext = (n) => `<svg viewBox="0 0 16 16" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h4v4M13 3L7.5 8.5M11.5 9.5V13h-8.5V4.5H6.5"/></svg>`;
const EXT = ext(14);
export const reportBtn = (doc) => (doc ? `<a class="share" href="${esc(doc)}" target="_blank" rel="noopener" title="Open report">${EXT}</a>` : '');
// Crime(s) segments look like "10851(A): VC; Take Vehicle…" → statute key "VC 10851(A)".
const STATUTE_KEYS = Object.fromEntries(Object.entries(STATUTES).map(([k, v]) => [k.toUpperCase(), [k, v]]));
const statutesIn = (crime) => {
  const found = new Map();
  for (const seg of crime.split('|')) {
    const m = seg.trim().match(/^\*?([^:]+):\s*([A-Z]{2})\b/i);
    const hit = m && STATUTE_KEYS[`${m[2]} ${m[1].replace(/\s+/g, '')}`.toUpperCase()];
    if (hit) found.set(hit[0], hit[1]);
  }
  return [...found];
};

// Badges and statute chips shown under an incident's crime, shared by map and sheet views.
export const tags = (i) => {
  const out = (i.vawa ? ['<abbr class="badge" title="Violence Against Women Act">VAWA</abbr>'] : [])
    .concat(i.statutes.map(([k, url]) => `<a class="chip" href="${esc(url)}" target="_blank" rel="noopener">${esc(k)}${ext(10)}</a>`));
  return out.length ? `<span class="tags">${out.join('')}</span>` : '';
};

export const shareBtn = (c) => (c ? `<button class="share" data-case="${esc(c)}" title="Copy link">${LINK}</button>` : '');

// Sharing belongs to this mounted viewer and points to the article's table view.
export function bindSharing(root) {
  let active = true;
  const timers = new Set();
  const onClick = (event) => {
    const button = event.target.closest?.('button.share[data-case]');
    if (!button || !root.contains(button)) return;
    event.stopPropagation();
    const url = new URL(viewHref('table', { case: button.dataset.case }), window.location.href);
    if (!navigator.clipboard?.writeText) {
      button.title = url.href;
      return;
    }
    navigator.clipboard.writeText(url.href).then(() => {
      if (!active || !root.contains(button)) return;
      button.innerHTML = CHECK;
      button.classList.add('done');
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (active) {
          button.innerHTML = LINK;
          button.classList.remove('done');
        }
      }, 1200);
      timers.add(timer);
    }).catch(() => { if (active) button.title = url.href; });
  };
  root.addEventListener('click', onClick, true);
  return () => {
    active = false;
    root.removeEventListener('click', onClick, true);
    timers.forEach(clearTimeout);
  };
}

export const hue = (s) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 360;
};
// Crime type: the text before the first ":" ("INFO: Information Only Report" → "INFO").
export const typeOf = (crime) => crime.split(':')[0].trim().toUpperCase();
export const colorFor = (crime) => `hsl(${hue(typeOf(crime))} 75% 58%)`;

// A campus-wide label does not identify a location precise enough to plot.
// Keep these reports in the underlying data and searchable table.
export const hasMapLocation = (incident) => Number.isFinite(incident.lat)
  && Number.isFinite(incident.lng)
  && !/^campus(?:\s*;\s*campus)?$/i.test((incident.loc || '').replace(/^\s*\*+\s*/, '').trim());

function parseTime(r) {
  const d = (r['Reported'] || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  const tm = [r['Reported'], r['Occurred start'], r['Occurred end']].join(' ').match(/\b(\d{1,2}):(\d{2})\b/);
  let y, m, day;
  if (d) { [, m, day, y] = d.map(Number); if (y < 100) y += 2000; }
  else if (/^\d{4}-\d{2}-\d{2}/.test(r['Log date'] || '')) [y, m, day] = r['Log date'].split('-').map(Number);
  else return NaN;
  return new Date(y, m - 1, day, tm ? +tm[1] : 12, tm ? +tm[2] : 0).getTime();
}

// The public sheet is the source of truth. The HTML export retains report links
// that the CSV export omits; a missing archive never prevents viewing incidents.
async function fetchText(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Crime log request failed (${response.status}).`);
  return response.text();
}

const docLinks = async (signal) => {
  try {
    const html = await fetchText(ARCHIVE, signal);
    const links = {};
    for (const [, id, name] of html.matchAll(/document\/d\/([\w-]+)[^>]*>([^<]+\.docx?)</g)) {
      links[name.trim()] = `https://docs.google.com/document/d/${id}/edit`;
    }
    return links;
  } catch (error) {
    if (signal?.aborted) throw error;
    return {};
  }
};

export function parseRows(text, links = {}) {
  const data = csvParse(text.replace(/^\uFEFF/, ''));
  if (!data.columns.includes('Crime(s)') || !data.columns.includes('Case #')) {
    throw new Error('The incident sheet did not return the expected CSV columns.');
  }
  const fields = data.columns.filter((f) => f.trim() && !/^_\d+$/.test(f) && data.some((r) => r[f]?.trim()));
  const rows = data.map((r) => {
    const crime = (r['Crime(s)'] || '').trim();
    return {
      raw: r, crime, t: parseTime(r),
      lat: parseFloat(r['Latitude']), lng: parseFloat(r['Longitude']),
      loc: r['Location'], case: r['Case #'] || '', disp: r['Disposition'],
      doc: links[(r['Source file'] || '').trim()],
      type: typeOf(crime),
      color: colorFor(crime),
      vawa: /VAWA/i.test(r['Flags'] || ''),
      statutes: statutesIn(crime),
    };
  }).filter((i) => i.crime || i.case);
  const latest = rows.reduce((last, row) => Number.isFinite(row.t) ? Math.max(last, row.t) : last, -Infinity);
  return { rows, fields, latest };
}

// Keep distinct entries for a case that was reported again on another date.
// Only identical records are duplicates; a case number alone is not unique.
export function mergeData(datasets) {
  const fields = [...new Set(datasets.flatMap((data) => data.fields))];
  const seen = new Set();
  const rows = datasets.flatMap((data) => data.rows).filter((row) => {
    const key = JSON.stringify(fields.map((field) => row.raw[field]?.trim() || ''));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const latest = rows.reduce((last, row) => Number.isFinite(row.t) ? Math.max(last, row.t) : last, -Infinity);
  return { rows, fields, latest };
}

// Parse a calendar date in the same local time used by the reported timestamps.
// Missing publication metadata must never fall back to today's/latest date.
function publicationDay(publicationDate) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publicationDate || '');
  const date = parts && new Date(+parts[1], +parts[2] - 1, +parts[3]);
  if (!date || date.getFullYear() !== +parts[1]
    || date.getMonth() !== +parts[2] - 1 || date.getDate() !== +parts[3]) {
    throw new Error('The story requires a valid YYYY-MM-DD publication date.');
  }
  return date;
}

// The story's historical comparison also stops before publication. Return a
// separate dataset so the live viewer's shared cached data stays intact.
export function beforePublicationData(data, publicationDate) {
  const end = publicationDay(publicationDate).getTime();
  const rows = data.rows.filter((row) => Number.isFinite(row.t) && row.t < end);
  const latest = rows.reduce((last, row) => Math.max(last, row.t), -Infinity);
  return { ...data, rows, latest };
}

// A year before publication: include the first day, exclude publication day.
export function pastYearRows(data, publicationDate) {
  const end = publicationDay(publicationDate);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  return data.rows.filter((row) => Number.isFinite(row.t) && row.t >= start.getTime() && row.t < end.getTime());
}

let cached;
export async function load({ signal } = {}) {
  if (cached) return cached;
  const [texts, links] = await Promise.all([
    Promise.all(DATA_SOURCES.map((source) => fetchText(source.csv, signal))),
    docLinks(signal),
  ]);
  const data = mergeData(texts.map((text) => parseRows(text, links)));
  if (!signal?.aborted) cached = data;
  return data;
}
