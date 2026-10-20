// Adapted from ucpd_crime_log/src/scripts/table.js.
import { esc, shareBtn, tags } from './data.js';
import { createScope } from '../lifecycle';

export default function mountTable({ root, data, caseNumber }) {
  const scope = createScope();
  const { listen } = scope;
  const id = (value) => root.querySelector(`#${value}`);
  const q = id('q');
  const n = id('n');
  const thead = root.querySelector('thead');
  const tbody = root.querySelector('tbody');
  const LIMIT = 1000;
  const TIME_COLS = new Set(['Log date', 'Reported']);
  const WIDE = new Set(['Crime(s)', 'Notes', 'Location', 'Disposition', 'Flags']);
  const HIDDEN = new Set(['Geocode note', 'Parse check']);

  let rows = [], fields = [], sortKey = 'Reported', dir = -1;

  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function cell(r, f, hl) {
    let v = esc(r.raw[f]);
    if (hl) v = v.replace(hl, '<mark>$&</mark>');
    if (f === 'Crime(s)') return `<i style="background:${r.color}"></i>${v}${tags(r)}`;
    if (f === 'Source file' && r.doc) return `<a href="${r.doc}" target="_blank" rel="noopener">${v}</a>`;
    return v;
  }

  function render() {
    const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = terms.length ? rows.filter((r) => terms.every((t) => r.text.includes(t))) : rows;
    const hl = terms.length ? new RegExp(terms.map((t) => reEsc(esc(t))).join('|'), 'gi') : null;
    n.textContent = hits.length > LIMIT ? `${LIMIT} of ${hits.length}` : `${hits.length}`;
    tbody.innerHTML = hits.slice(0, LIMIT).map((r) => `<tr><td class="s">${shareBtn(r.case)}</td>${fields.map((f) => `<td${WIDE.has(f) ? ' class="w"' : ''}>${cell(r, f, hl)}</td>`).join('')}</tr>`).join('');
  }

  function sort() {
    const time = TIME_COLS.has(sortKey);
    rows.sort((a, b) => dir * (time ? (a.t || 0) - (b.t || 0) : String(a.raw[sortKey] ?? '').localeCompare(String(b.raw[sortKey] ?? ''), undefined, { numeric: true })));
    thead.innerHTML = `<tr><th></th>${fields.map((f) => `<th data-f="${esc(f)}">${esc(f)}${f === sortKey ? (dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr>`;
    render();
  }

  listen(thead, 'click', (e) => {
    const f = e.target.closest('th')?.dataset.f;
    if (!f) return;
    dir = f === sortKey ? -dir : 1;
    sortKey = f;
    sort();
  });
  listen(q, 'input', render);

  q.value = caseNumber || '';

  fields = data.fields.filter((f) => !HIDDEN.has(f));
  rows = data.rows.map((r) => ({ ...r, text: fields.map((f) => r.raw[f]).join(' ').toLowerCase() }));
  sort();
  return () => { scope.dispose(); thead.replaceChildren(); tbody.replaceChildren(); };

}
