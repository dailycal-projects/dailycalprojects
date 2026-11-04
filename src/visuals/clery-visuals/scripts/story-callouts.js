import { esc, hasMapLocation } from './data';
import { incidentCard } from './map-shared';

// The copy and statute quotation stay in MDX. This module positions the
// featured report and connects it to the passage currently being read.
export function createStoryCallouts({ root, map, incidents }) {
  const section = root.closest('.clery-scrolly');
  const passages = [...section.querySelectorAll('.clery-story-step')];
  const svg = section.querySelector('.clery-story-connectors');
  const caseLine = svg.querySelector('[data-clery-case-line]');
  const statuteLine = svg.querySelector('[data-clery-statute-line]');
  let active;
  let note;
  let fallback;
  let frame;
  const cameraViews = new Map();

  function passageAt(line) {
    return passages.filter((passage) => (passage.querySelector('.clery-story-card') || passage).getBoundingClientRect().top <= line).at(-1);
  }

  function hide() {
    cancelAnimationFrame(frame);
    frame = null;
    clearHighlights();
    active = null;
    delete svg.dataset.definitionVisible;
    note?.remove();
    fallback?.remove();
    note = fallback = null;
    svg.setAttribute('hidden', '');
    caseLine.setAttribute('d', '');
    statuteLine.setAttribute('d', '');
  }

  // Choose the layout from available width, never from the popup's animated
  // position. That keeps the note on one side throughout a camera flight.
  function noteLayout(popupWidth, mapWidth) {
    const beside = mapWidth >= popupWidth + 228;
    return { beside, width: beside ? Math.min(320, mapWidth - popupWidth - 48) : Math.min(320, mapWidth - 24) };
  }

  function place() {
    cancelAnimationFrame(frame);
    frame = null;
    if (!active || !root.isConnected) return;
    const popup = fallback || active.marker?.getPopup().getElement();
    if (!popup?.isConnected) {
      svg.setAttribute('hidden', '');
      if (note) note.hidden = true;
      return;
    }
    const box = popup.querySelector('.leaflet-popup-content-wrapper') || popup;
    const popupRect = box.getBoundingClientRect();
    const mapRect = root.getBoundingClientRect();
    const cardRect = active.passage.querySelector('.clery-story-card').getBoundingClientRect();
    svg.removeAttribute('hidden');
    // The SVG stays fixed while the story scrolls. Measure in its viewport
    // coordinates rather than compensating for the scrolling section's offset.
    const origin = svg.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
    const mobile = matchMedia('(max-width: 760px)').matches;
    // Keep the same attachment points as the card scrolls past the popup.
    const x1 = (mobile ? (cardRect.left + cardRect.right) / 2 : cardRect.left) - origin.left;
    const y1 = (mobile ? cardRect.top : (cardRect.top + cardRect.bottom) / 2) - origin.top;
    const x2 = (mobile ? (popupRect.left + popupRect.right) / 2 : popupRect.right) - origin.left;
    const y2 = (mobile ? popupRect.bottom : popupRect.top + 20) - origin.top;
    // The code-definition passage only connects the chip to its definition.
    caseLine.setAttribute('d', active.passage.dataset.caseLine === 'false' ? '' : `M${x1},${y1} L${x2},${y2}`);
    statuteLine.setAttribute('d', '');
    if (!note) return;

    const statute = active.passage.querySelector('[data-clery-statute]').dataset.cleryStatute;
    const link = [...popup.querySelectorAll('a.chip')].find((item) => item.textContent.trim() === statute);
    const layout = noteLayout(popupRect.width, mapRect.width);
    note.style.width = `${layout.width}px`;
    note.hidden = false;
    const left = layout.beside
      ? popupRect.left - mapRect.left - layout.width - 24
      : Math.max(12, Math.min(mapRect.width - layout.width - 12, popupRect.left - mapRect.left));
    const top = layout.beside
      ? popupRect.top - mapRect.top
      : popupRect.bottom - mapRect.top + 20;
    note.style.left = `${left}px`;
    note.style.top = `${top}px`;
    if (link) {
      link.classList.add('clery-featured-statute');
      const from = link.getBoundingClientRect(), to = note.getBoundingClientRect();
      const x1 = (layout.beside ? from.left : (from.left + from.right) / 2) - origin.left;
      const y1 = (layout.beside ? (from.top + from.bottom) / 2 : from.bottom) - origin.top;
      const x2 = (layout.beside ? to.right : (to.left + to.right) / 2) - origin.left;
      const y2 = (layout.beside ? (to.top + to.bottom) / 2 : to.top) - origin.top;
      statuteLine.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
    }
  }

  function schedulePlace() {
    if (frame == null) frame = requestAnimationFrame(place);
  }

  function clearHighlights() {
    const popup = fallback || active?.marker?.getPopup().getElement();
    popup?.querySelectorAll('.clery-featured-crime').forEach((mark) => mark.replaceWith(...mark.childNodes));
    popup?.querySelectorAll('.clery-featured-statute').forEach((chip) => chip.classList.remove('clery-featured-statute'));
  }

  function highlightCrime(popup, text) {
    const heading = popup?.querySelector('.card > b');
    if (!heading || !text) return;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const index = node.textContent.indexOf(text);
      if (index < 0) continue;
      const mark = document.createElement('mark');
      mark.className = 'clery-featured-crime';
      mark.textContent = text;
      node.replaceWith(document.createTextNode(node.textContent.slice(0, index)), mark,
        document.createTextNode(node.textContent.slice(index + text.length)));
      break;
    }
  }

  function setPassage(passage) {
    clearHighlights();
    note?.remove();
    note = null;
    active.passage = passage;
    const source = passage.querySelector('[data-clery-statute]');
    svg.dataset.definitionVisible = String(Boolean(source));
    if (source) {
      note = source.cloneNode(true);
      note.hidden = true;
      root.append(note);
    }
  }

  function focus(marker) {
    const passage = active.passage;
    const size = map.getSize();
    const group = passage.dataset.cameraGroup;
    const key = `${group || passage.dataset.case}:${size.x}:${size.y}`;
    let view = cameraViews.get(key);
    if (!view) {
      const popup = marker.getPopup().getElement();
      const width = popup.querySelector('.leaflet-popup-content-wrapper').offsetWidth;
      const height = group ? Math.max(240, popup.offsetHeight) : popup.offsetHeight;
      const linked = group ? passages.filter((item) => item.dataset.cameraGroup === group) : [passage];
      const locations = [...new Set(linked.map((item) => item.dataset.case))]
        .map((caseNumber) => incidents.find((incident) => incident.case === caseNumber && hasMapLocation(incident)))
        .filter(Boolean);
      const source = linked.map((item) => item.querySelector('[data-clery-statute]')).find(Boolean);
      const layout = noteLayout(width, size.x);
      let noteHeight = 0;
      if (source) {
        const measure = source.cloneNode(true);
        measure.hidden = false;
        measure.style.width = `${layout.width}px`;
        measure.style.visibility = 'hidden';
        root.append(measure);
        noteHeight = measure.offsetHeight;
        measure.remove();
      }
      const mobile = matchMedia('(max-width: 760px)').matches;
      const padding = mobile ? 6 : 24;
      const availableHeight = size.y - (mobile ? Math.min(280, size.y * 0.33) : 0);
      // Compute bounds from fixed coordinates and annotation sizes at each
      // destination zoom, never from an in-flight popup's screen position.
      for (let zoom = 15; zoom >= 12; zoom--) {
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        locations.forEach((incident) => {
          const point = map.project([incident.lat, incident.lng], zoom);
          const withDefinition = linked.some((item) => item.dataset.case === incident.case && item.querySelector('[data-clery-statute]'));
          left = Math.min(left, point.x - width / 2 - (withDefinition && layout.beside ? layout.width + 24 : 0));
          right = Math.max(right, point.x + width / 2);
          top = Math.min(top, point.y - height - 12);
          bottom = Math.max(bottom, point.y + (withDefinition && !layout.beside ? noteHeight + 20 : 0));
        });
        if ((right - left <= size.x - padding * 2 && bottom - top <= availableHeight - padding * 2) || zoom === 12) {
          view = {
            center: map.unproject([(left + right) / 2, (top + bottom) / 2 + (size.y - availableHeight) / 2], zoom),
            zoom,
          };
          cameraViews.set(key, view);
          break;
        }
      }
    }
    map.flyTo(view.center, view.zoom, {
      animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: 1,
    });
  }

  // Consecutive steps can annotate the same report without rebuilding its
  // marker or closing its popup. Only the new definition fades into view.
  function update(passage) {
    if (!active) return;
    setPassage(passage);
    const popup = fallback || active.marker?.getPopup().getElement();
    highlightCrime(popup, passage.dataset.highlightCrime);
    place();
  }

  function show(passage, marker, incident, { moveCamera = true } = {}) {
    hide();
    active = { passage, marker };
    setPassage(passage);
    if (marker) {
      Object.assign(marker.getPopup().options, { autoPan: false, closeButton: false, closeOnClick: false });
      marker.openPopup();
      const popup = marker.getPopup().getElement();
      popup.dataset.featuredCase = passage.dataset.case;
      highlightCrime(popup, passage.dataset.highlightCrime);
      if (moveCamera) focus(marker);
    } else {
      // Show the real report without inventing coordinates if geocoding is absent.
      fallback = document.createElement('div');
      fallback.className = 'clery-featured-report';
      fallback.innerHTML = incident
        ? `${incidentCard(incident)}<small>Location is not mapped.</small>`
        : `Report #${esc(passage.dataset.case)} is not available in the current data.`;
      root.append(fallback);
    }
    place();
  }

  map.on('move zoomend popupopen popupclose', schedulePlace);
  return {
    passageAt,
    show,
    update,
    hide,
    place,
    dispose() {
      map.off('move zoomend popupopen popupclose', schedulePlace);
      hide();
    },
  };
}
