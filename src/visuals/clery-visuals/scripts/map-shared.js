import L from 'leaflet';
import { esc, fmt, reportBtn, shareBtn, tags } from './data';

// Both views begin over main campus and use the same incident details.
export function createIncidentMap(element, options = {}) {
  const map = L.map(element, {
    renderer: L.canvas({ tolerance: 6 }),
    zoomControl: false,
    ...options,
  }).setView([37.8719, -122.2585], 15);
  for (const name of ['World_Dark_Gray_Base', 'World_Dark_Gray_Reference']) {
    L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${name}/MapServer/tile/{z}/{y}/{x}`, {
      attribution: '&copy; Esri', maxZoom: 20, maxNativeZoom: 16,
    }).addTo(map);
  }
  return map;
}

export function incidentCard(incident, { highlightCrime = '' } = {}) {
  const time = Number.isFinite(incident.t) ? fmt(incident.t) : 'Time not listed';
  const crimes = incident.crime.split('|').map((crime) => {
    const text = crime.trim();
    const start = highlightCrime ? text.toLowerCase().indexOf(highlightCrime.toLowerCase()) : -1;
    if (start < 0) return esc(text);
    const end = start + highlightCrime.length;
    return `${esc(text.slice(0, start))}<mark class="clery-featured-crime">${esc(text.slice(start, end))}</mark>${esc(text.slice(end))}`;
  }).filter(Boolean).join('<br>');
  const details = `${tags(incident)}<div class="clery-incident-facts">${esc(incident.loc)}<br><span>${esc(time)} · #${esc(incident.case)}<br>${esc(incident.disp)}</span></div>`;
  return `<div class="card"><b>${crimes}</b><div class="clery-incident-details">${details}<div class="acts">${reportBtn(incident.doc)}${shareBtn(incident.case)}</div></div></div>`;
}

export function updateIncidentMarker(marker, incident, { highlightCrime = '' } = {}) {
  const card = incidentCard(incident, { highlightCrime });
  const categoryClass = highlightCrime ? ' clery-category-report' : '';
  // Refresh annotation contents/options without replacing the map geometry.
  marker.unbindTooltip().unbindPopup();
  marker.bindTooltip(card, { className: `tip${categoryClass}`, direction: 'top', offset: [0, -6] })
    .bindPopup(card, { className: `pin${categoryClass}`, minWidth: 278, maxWidth: 278, offset: [0, -4] });
  return marker;
}

export function createIncidentMarker(incident, options = {}) {
  const marker = L.circleMarker([incident.lat, incident.lng], {
    radius: 6, color: incident.color, fillColor: incident.color, fillOpacity: 0.75, weight: 1,
  });
  updateIncidentMarker(marker, incident, options);
  marker.on('popupopen', () => marker.closeTooltip())
    .on('tooltipopen', () => marker.isPopupOpen() && marker.closeTooltip());
  return marker;
}
