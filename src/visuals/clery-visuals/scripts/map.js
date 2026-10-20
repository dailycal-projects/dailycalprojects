// Adapted from ucpd_crime_log/src/scripts/app.js.
import L from 'leaflet';
import { esc, fmt, hasMapLocation, hue, shareBtn } from './data.js';
import { createIncidentMap, createIncidentMarker } from './map-shared';
import { runTour, tourSeen } from './tour.js';
import { createScope } from '../lifecycle';
import { createDashboardOffsets } from './dashboard-offsets';

export default function mountMap({ root, data }) {
  const scope = createScope();
  const { listen, frame } = scope;
  const id = (value) => root.querySelector(`#${value}`);
  let endDrag = null;
  const HOUR = 3600e3;
  const VIEW_MONTHS = 4;
  const SELECTION_POSITION = 2 / 3;

  const map = createIncidentMap(id('map'));
  const layer = L.layerGroup().addTo(map);

  const tl = id('tl');
  const canvas = tl.querySelector('canvas');
  const band = id('band');
  const handle = id('handle');
  const rangeEl = id('range');

  let incidents = [];
  let offsets;
  let t0, t1, start, end, viewStart, viewEnd, latestViewStart;

  function shiftMonths(time, amount) {
    const date = new Date(time);
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + amount);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return date.getTime();
  }

  function viewportStartForSelection(time) {
    let first = shiftMonths(time, -VIEW_MONTHS);
    // Calendar months vary in length; settle the selection at two-thirds of
    // the visible span while keeping four calendar months across the screen.
    for (let i = 0; i < 4; i++) {
      const span = shiftMonths(first, VIEW_MONTHS) - first;
      first = time - span * SELECTION_POSITION;
    }
    return first;
  }

  // The archive's bounds and the selected range are independent of the four
  // months currently visible. Keep that span on screen when resizing.
  function setViewportStart(time) {
    viewStart = Math.max(Math.min(t0, latestViewStart), Math.min(latestViewStart, time));
    viewEnd = shiftMonths(viewStart, VIEW_MONTHS);
  }

  function revealTime(time) {
    const padding = (viewEnd - viewStart) * 0.05;
    if (time < viewStart) setViewportStart(time - padding);
    else if (time > viewEnd) setViewportStart(shiftMonths(time, -VIEW_MONTHS) + padding);
  }


  const list = id('list');
  const countEl = id('count');
  let shown = [];
  let listKey = null;

  function render() {
    shown = [];
    for (const i of incidents) {
      const on = i.t >= start && i.t <= end;
      if (on) shown.push(i);
      if (i.m && on !== layer.hasLayer(i.m)) {
        if (on) {
          offsets.update(i);
          if (i.offsetLine) layer.addLayer(i.offsetLine);
          layer.addLayer(i.m);
        } else {
          layer.removeLayer(i.m);
          if (i.offsetLine) layer.removeLayer(i.offsetLine);
        }
      }
    }
    const key = shown.length ? `${shown[0].idx}-${shown.at(-1).idx}-${shown.length}` : '';
    if (key !== listKey) {
      listKey = key;
      countEl.textContent = `${shown.length} incident${shown.length === 1 ? '' : 's'}`;
      renderStats();
      list.innerHTML = shown.map((i, k) => `<div data-k="${k}"${i.m ? '' : ' class="nomap"'}><i style="background:${i.color}"></i><b>${esc(i.crime)}</b><span>${esc(i.loc)} · ${esc(fmt(i.t))}</span>${shareBtn(i.case)}</div>`).join('');
    }
    rangeEl.textContent = `${fmt(start)} – ${fmt(end)}`;
    renderBand();
  }

  function renderBand() {
    const w = tl.clientWidth;
    const x = (t) => ((t - viewStart) / (viewEnd - viewStart)) * w;
    band.hidden = end < viewStart || start > viewEnd;
    band.style.left = `${x(start)}px`;
    band.style.width = `${Math.max(2, x(end) - x(start))}px`;
  }

  function drawTrack() {
    const dpr = devicePixelRatio || 1;
    const w = tl.clientWidth, h = tl.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const g = canvas.getContext('2d');
    if (!g || !w || !h) return;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.scale(dpr, dpr);
    const x = (t) => ((t - viewStart) / (viewEnd - viewStart)) * w;
    g.font = '10px ui-sans-serif, system-ui, sans-serif';
    g.textBaseline = 'bottom';
    const d = new Date(viewStart); d.setDate(1); d.setHours(0, 0, 0, 0);
    if (d.getTime() < viewStart) d.setMonth(d.getMonth() + 1);
    let lastLabel = -Infinity;
    for (; d.getTime() <= viewEnd; d.setMonth(d.getMonth() + 1)) {
      const px = x(d.getTime());
      g.fillStyle = '#1d1f23';
      g.fillRect(px, 8, 1, h - 30);
      const label = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
      if (px - lastLabel > 52 && px > 0 && px + g.measureText(label).width + 3 < w) {
        g.fillStyle = '#6b7078';
        g.fillText(label, px + 3, h - 5);
        lastLabel = px;
      }
    }
    const mid = 8 + (h - 30) / 2;
    for (const i of incidents) {
      if (i.t < viewStart || i.t > viewEnd) continue;
      g.fillStyle = i.color;
      g.globalAlpha = 0.8;
      g.fillRect(x(i.t) - 0.5, mid - 8 + ((hue(i.case) % 16)), 1.5, 3);
    }
    g.globalAlpha = 1;
  }

  function drag(e, mode) {
    if (e.button !== 0 || e.isPrimary === false) return;
    endDrag?.();
    e.preventDefault(); e.stopPropagation();
    const w = tl.clientWidth;
    if (!w) return;
    const px0 = e.clientX, s0 = start, e0 = end;
    const v0 = viewStart, span0 = viewEnd - viewStart;
    const pointer = e.pointerId;
    let moved = false;
    tl.setPointerCapture(pointer);
    const move = (ev) => {
      if (ev.pointerId !== pointer) return;
      const dx = ev.clientX - px0;
      if (!moved && Math.abs(dx) < 5) return;
      moved = true;
      const dt = (dx / w) * span0;
      if (mode === 'pan') {
        root.classList.add('timeline-panning');
        setViewportStart(v0 - dt);
        drawTrack();
        renderBand();
        return;
      }
      if (mode === 'resize') {
        start = Math.min(Math.max(t0, s0 + dt), end - HOUR);
        revealTime(start);
      } else {
        const span = e0 - s0;
        end = Math.min(t1, Math.max(t0 + span, e0 + dt));
        start = end - span;
        revealTime(dx < 0 ? start : end);
      }
      drawTrack();
      render();
    };
    // While dragging, drop the tour's spotlight so the timeline reads at full strength; re-aim it on release.
    root.classList.add('dragging');
    const finish = (snap = false, clientX = px0) => {
      removeMove(); removeUp(); removeCancel(); removeBlur();
      if (tl.hasPointerCapture(pointer)) tl.releasePointerCapture(pointer);
      root.classList.remove('dragging', 'timeline-panning');
      endDrag = null;
      if (snap) {
        const rect = tl.getBoundingClientRect();
        const t = viewStart + ((clientX - rect.left) / w) * (viewEnd - viewStart);
        const span = end - start;
        end = Math.min(t1, Math.max(t0 + span, t + span / 2));
        start = end - span;
        render();
      }
      touring?.place();
    };
    const removeMove = listen(window, 'pointermove', move);
    const removeUp = listen(window, 'pointerup', (ev) => {
      if (ev.pointerId === pointer) finish(mode === 'pan' && !moved, ev.clientX);
    });
    const removeCancel = listen(window, 'pointercancel', (ev) => {
      if (ev.pointerId === pointer) finish();
    });
    const removeBlur = listen(window, 'blur', () => finish());
    endDrag = () => finish();
  }
  listen(handle, 'pointerdown', (e) => drag(e, 'resize'));
  listen(band, 'pointerdown', (e) => drag(e, 'move'));
  listen(tl, 'pointerdown', (e) => drag(e, 'pan'));
  listen(window, 'resize', () => { map.invalidateSize(); drawTrack(); render(); });

  const pie = id('pie');
  const legend = id('legend');
  const OTHER = '#4a4e55';

  // Top 10 crime types in the current window, the rest folded into "Other".
  function renderStats() {
    const counts = new Map();
    for (const i of shown) {
      const c = counts.get(i.type) || counts.set(i.type, { type: i.type, color: i.color, n: 0 }).get(i.type);
      c.n++;
    }
    const sorted = [...counts.values()].sort((a, b) => b.n - a.n);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10).reduce((n, c) => n + c.n, 0);
    if (rest) top.push({ type: 'Other', color: OTHER, n: rest });

    const total = shown.length, R = 60, C = 64;
    let a = -Math.PI / 2;
    pie.innerHTML = total ? top.map((s) => {
      const label = `<title>${esc(s.type)}: ${s.n}</title>`;
      if (s.n === total) return `<circle cx="${C}" cy="${C}" r="${R}" fill="${s.color}">${label}</circle>`;
      const b = a + (s.n / total) * Math.PI * 2;
      const p = (t) => `${(C + R * Math.cos(t)).toFixed(2)} ${(C + R * Math.sin(t)).toFixed(2)}`;
      const d = `M${C} ${C}L${p(a)}A${R} ${R} 0 ${b - a > Math.PI ? 1 : 0} 1 ${p(b)}Z`;
      a = b;
      return `<path d="${d}" fill="${s.color}">${label}</path>`;
    }).join('') : `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#2a2d32"/>`;
    legend.innerHTML = top.map((s) => `<li><i style="background:${s.color}"></i><span>${esc(s.type)}</span><b>${s.n}</b></li>`).join('');
  }

  const itemAt = (e) => shown[e.target.closest('[data-k]')?.dataset.k];
  listen(list, 'click', (e) => {
    const i = itemAt(e);
    if (!i) return;
    if (i.m) { map.flyTo(i.m.getLatLng(), Math.max(map.getZoom(), 17), { duration: 0.6 }); i.m.openPopup(); }
    else if (i.doc) window.open(i.doc, '_blank', 'noopener');
  });

  function populate(rows) {
    incidents = rows.filter((i) => i.crime && isFinite(i.t)).sort((a, b) => b.t - a.t).map((original, idx) => {
      const i = { ...original };
      if (hasMapLocation(i)) {
        i.m = createIncidentMarker(i);
      }
      return Object.assign(i, { idx });
    });
    offsets = createDashboardOffsets(map, incidents);
    const latest = incidents[0]?.t ?? Date.now();
    t0 = Math.min(...incidents.map((i) => i.t), latest - 72 * HOUR) - 6 * HOUR; t1 = latest;
    end = t1; start = end - 72 * HOUR;
    latestViewStart = viewportStartForSelection(start);
    setViewportStart(latestViewStart);
    drawTrack(); render();
    if (incidents.length && (!tourSeen() || location.hash === '#tour')) startTour();
  }

  const mapwrap = id('mapwrap');
  let touring = null;
  const updateOffsets = () => {
    shown.forEach((incident) => offsets?.update(incident));
    touring?.place();
  };
  map.on('zoomend', updateOffsets);

  function startTour() {
    touring?.end();
    history.replaceState(null, '', location.pathname + location.search);
    const pick = () => shown.find((i) => i.m) || incidents.find((i) => i.m);
    const dotRect = () => {
      const i = pick();
      if (!i) return null;
      const p = map.latLngToContainerPoint(i.m.getLatLng()), r = mapwrap.getBoundingClientRect();
      return new DOMRect(r.left + p.x - 9, r.top + p.y - 9, 18, 18);
    };
    // The dot, grown to cover its hover card or pinned popup when one is open.
    const dotWithCard = () => {
      const r = dotRect(), m = pick()?.m;
      const el = m?.isPopupOpen() ? m.getPopup().getElement() : m?.getTooltip()?.isOpen() ? m.getTooltip().getElement() : null;
      if (!r || !el) return r;
      const c = el.getBoundingClientRect();
      const x = Math.min(r.left, c.left), y = Math.min(r.top, c.top);
      return new DOMRect(x, y, Math.max(r.right, c.right) - x, Math.max(r.bottom, c.bottom) - y);
    };
    const focusDot = () => {
      map.closePopup();
      const i = pick();
      if (i && !layer.hasLayer(i.m)) {
        end = Math.min(t1, i.t + HOUR);
        start = Math.max(t0, end - 72 * HOUR);
        setViewportStart(viewportStartForSelection(start));
        drawTrack();
        render();
      }
      if (i) map.panInside(i.m.getLatLng(), { paddingTopLeft: [60, 120], paddingBottomRight: [380, 160], animate: false });
    };
    const steps = [
      { target: dotWithCard, before: focusDot, text: matchMedia('(hover: none)').matches  // touch screens can't hover
          ? '<b>Try clicking on a dot</b> to see its details.'
          : '<b>Try hovering on a dot</b> to see its details. You can also click to pin it.' },
      { target: () => band, before: () => { map.closePopup(); revealTime(end); drawTrack(); renderBand(); }, text: 'Drag the orange band to move the selected time range.' },
      { target: () => handle, pad: 8, text: 'Pull its left edge to widen the time range.' },
      { target: () => innerWidth <= 640 ? root.querySelector('[data-clery-view="table"]') : id('all'), text: 'Open the full sheet to search across every incident in our archive.' },
    ];
    const t = runTour(steps, { root, onEnd: () => { map.off('move', t.place).off('tooltipopen tooltipclose popupopen popupclose', replace); touring = null; } });
    const replace = () => frame(t.place);
    map.on('move', t.place).on('tooltipopen tooltipclose popupopen popupclose', replace);
    touring = t;
  }

  listen(id('help'), 'click', (e) => { e.preventDefault(); if (incidents.length) startTour(); });

  const resize = new ResizeObserver(() => { map.invalidateSize(); drawTrack(); render(); touring?.place(); });
  populate(data.rows);
  resize.observe(root);
  return () => {
    map.off('zoomend', updateOffsets);
    endDrag?.();
    touring?.end();
    scope.dispose();
    resize.disconnect();
    root.classList.remove('dragging', 'timeline-panning');
    map.remove();
    list.replaceChildren();
  };

}
