import L from 'leaflet';
import 'leaflet.heat';
import { createIncidentMap, createIncidentMarker, updateIncidentMarker } from './map-shared';
import { beforePublicationData, esc, hasMapLocation, pastYearRows } from './data';
import { buildStoryYears } from './story-years';
import { storyLocationCounts } from './story-location-counts';
import { createScope } from '../lifecycle';
import { createStoryCallouts } from './story-callouts';

// Leaflet.heat 0.2 leaves a scheduled redraw behind when its layer is removed.
// Cancel it when reversing the scroll or switching away from the story.
const StoryHeat = L.HeatLayer.extend({
  redraw() {
    return this._map ? L.HeatLayer.prototype.redraw.call(this) : this;
  },
  onRemove(map) {
    L.Util.cancelAnimFrame(this._frame);
    this._frame = null;
    L.HeatLayer.prototype.onRemove.call(this, map);
  },
});

// Match the opening passage's past-year window. The dashboard keeps the full
// archive; the story keeps its main-campus framing as passages scroll beside it.
export default function mountStoryMap({ root, data, publicationDate }) {
  const storyData = beforePublicationData(data, publicationDate);
  const element = root.querySelector('.clery-story-map-canvas');
  // Draw beyond the visible map so dots entering during a flight already have
  // geometry, rather than appearing only when Leaflet redraws at moveend.
  const renderer = L.svg({ padding: 1.5 });
  // Story flights use flyTo's frame animation. Avoid a second CSS zoom
  // animation being queued when stop() interrupts a flight at fractional zoom.
  const map = createIncidentMap(element, { scrollWheelZoom: false, zoomAnimation: false, renderer });
  const initialView = { center: map.getCenter(), zoom: map.getZoom() };
  const scope = createScope();
  const crimes = pastYearRows(storyData, publicationDate).filter((incident) => incident.crime);
  const located = crimes.filter(hasMapLocation);
  // The closing invitation previews the live tool; the analysis above keeps
  // its publication-anchored past-year window.
  const latestLocated = data.rows.filter((incident) => incident.crime && Number.isFinite(incident.t) && hasMapLocation(incident))
    .sort((a, b) => b.t - a.t).slice(0, 100);
  const pastYearEnd = new Date(`${publicationDate}T00:00:00`);
  const pastYearStart = new Date(pastYearEnd);
  pastYearStart.setFullYear(pastYearStart.getFullYear() - 1);
  pastYearEnd.setDate(pastYearEnd.getDate() - 1);
  const shortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const pastYearLabel = `${shortDate(pastYearStart)}–${shortDate(pastYearEnd)}`;
  const years = buildStoryYears(storyData);
  const scroller = root.closest('.clery-root');
  const callouts = createStoryCallouts({ root, map, incidents: storyData.rows });
  const experiment = root.closest('.clery-scrolly')?.querySelector('[data-scene="yearly-heatmap"]');
  const card = experiment?.querySelector('.clery-story-card');
  const legend = root.querySelector('.clery-story-heat-legend');
  const yearText = legend?.querySelector('[data-clery-year]');
  const dots = L.layerGroup().addTo(map);
  const yearlyDots = L.layerGroup().addTo(map);
  // Keep concentration below the incident dots and outside their hit testing.
  // Each mapped report contributes equally; this is not a crime-risk estimate.
  // One fixed intensity scale is used for every year.
  const heat = new StoryHeat([], {
    radius: 26,
    blur: 22,
    minOpacity: 0.08,
    maxZoom: 15,
    max: 12,
    gradient: { 0.2: '#2563eb', 0.45: '#22d3ee', 0.65: '#facc15', 0.85: '#fb923c', 1: '#ef4444' },
  });
  let aggregateMarkers = [];
  let aggregateReferenceZoom = map.getZoom();
  const updateAggregateScale = () => {
    // Leaflet scales the entire SVG during a flight. Counter-scale each white
    // dot around its own center so its screen radius stays at its resting size.
    root.style.setProperty('--clery-aggregate-scale', String(map.getZoomScale(aggregateReferenceZoom, map.getZoom())));
  };
  const resetAggregateScale = () => {
    // A renderer update rebuilds geometry at the current zoom, so its parent
    // no longer supplies a zoom scale to compensate for.
    aggregateReferenceZoom = map.getZoom();
    updateAggregateScale();
  };
  renderer.on('update', resetAggregateScale);
  map.on('zoom', updateAggregateScale);
  const updateAggregateTargets = () => {
    // Compare in screen pixels so crowded locations behave consistently at
    // different zoom levels. Every larger neighbor suppresses a smaller dot.
    const radius = 40;
    const cells = new Map();
    aggregateMarkers.forEach(({ marker, clearHighlight }) => {
      const point = map.project(marker.getLatLng(), map.getZoom());
      const cx = Math.floor(point.x / radius), cy = Math.floor(point.y / radius);
      let interactive = true;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (cells.get(`${cx + dx},${cy + dy}`)?.some((other) => point.distanceTo(other) <= radius)) interactive = false;
        }
      }
      const key = `${cx},${cy}`;
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(point);
      marker.options.interactive = interactive;
      marker.getElement()?.classList.toggle('leaflet-interactive', interactive);
      if (!interactive) {
        clearHighlight();
        marker.closeTooltip();
        marker.closePopup();
      }
    });
    // SVG paths stack in DOM order. Put interactive dots above the context
    // dots, with the busiest locations on top of other interactive dots.
    [...aggregateMarkers].reverse().forEach(({ marker }) => {
      if (marker.options.interactive) marker.bringToFront();
    });
  };
  map.on('zoomend', updateAggregateTargets);
  let activeKey;
  let cameraTarget = 'opening';
  // Keep one SVG path per incident throughout the story. Opacity changes
  // never replace paths or mix projections from different camera positions.
  const incidentMarkers = new Map();
  [...new Set([...located, ...latestLocated])].forEach((incident) => {
    const marker = createIncidentMarker(incident);
    marker.options.className = 'clery-incident-dot';
    marker.addTo(dots);
    incidentMarkers.set(incident, marker);
  });
  const show = (period, passage) => {
    const featuredCase = passage?.dataset.case;
    const crimePrefix = passage?.dataset.crimePrefix;
    const hotspots = passage?.dataset.scene === 'reporting-hotspots';
    const latest = passage?.dataset.scene === 'latest-reports';
    const followsIncident = featuredCase && passage?.dataset.camera === 'incident';
    const nextCamera = hotspots ? 'hotspots' : followsIncident ? `case:${featuredCase}` : 'opening';
    const moveCamera = nextCamera !== cameraTarget;
    const aggregate = Boolean(period) || hotspots;
    const matchesCategory = (incident) => incident.crime.trimStart().toUpperCase().startsWith(`${crimePrefix}:`);
    const key = period?.key || (featuredCase ? `case:${featuredCase}:${passage.dataset.scene}` : passage?.dataset.scene || 'past-year');
    if (activeKey === key) return;
    const sameReport = featuredCase && root.dataset.featuredCase === featuredCase;
    activeKey = key;
    if (sameReport && !moveCamera) {
      root.dataset.scene = passage.dataset.scene;
      callouts.update(passage);
      return;
    }
    const animateMap = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    callouts.hide();
    if (moveCamera) map.stop();
    cameraTarget = nextCamera;
    map.closePopup();
    aggregateMarkers = [];
    yearlyDots.clearLayers();
    const incidents = period ? period.incidents : latest ? latestLocated : located;
    if (aggregate) {
      // The past-year hotspot view uses white dots only. Retain the dormant
      // historical experiment without enabling its heat layer here.
      if (period) {
        heat.setLatLngs(incidents.map((incident) => [incident.lat, incident.lng, 1]));
        if (!map.hasLayer(heat)) heat.addTo(map);
      } else if (map.hasLayer(heat)) map.removeLayer(heat);
      if (yearText) {
        yearText.textContent = period ? period.key : pastYearLabel;
        if (period) yearText.dateTime = period.key;
        else yearText.removeAttribute('datetime');
      }
      if (period) root.dataset.year = period.key;
      else delete root.dataset.year;
      const rangeLabel = period ? String(period.year) : pastYearLabel;
      legend?.setAttribute('aria-label', `Incident concentration in ${rangeLabel}: cooler colors show fewer nearby reports; warmer colors show more.`);
      element.setAttribute('aria-label', `Approximate locations of crimes reported to UCPD in ${rangeLabel}`);
    } else {
      if (map.hasLayer(heat)) map.removeLayer(heat);
      delete root.dataset.year;
      element.setAttribute('aria-label', latest
        ? `Approximate locations of the ${latestLocated.length} most recent reports to UCPD`
        : 'Approximate locations of crimes reported to UCPD in the past year');
    }
    root.dataset.scene = period ? 'yearly-heatmap' : (passage?.dataset.scene || 'all-incidents');
    if (featuredCase) root.dataset.featuredCase = featuredCase;
    else delete root.dataset.featuredCase;
    if (crimePrefix) root.dataset.crimePrefix = crimePrefix;
    else delete root.dataset.crimePrefix;
    root.dataset.visibleIncidents = String(crimePrefix ? incidents.filter(matchesCategory).length : incidents.length);
    if (aggregate) {
      // Keep the original marker paths mounted so scrolling back restores
      // their geometry and hover targets without rebuilding them.
      incidentMarkers.forEach((marker) => {
        marker.setStyle({ opacity: 0, fillOpacity: 0 });
        marker.options.interactive = false;
        marker.getElement()?.classList.remove('leaflet-interactive');
      });
      // One dot per exact location. Area is proportional to report count,
      // using the same scale for the past-year overview and historical years.
      storyLocationCounts(incidents).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name) || a.lat - b.lat || a.lng - b.lng).forEach((location) => {
        const { lat, lng, count, name, otherNames, types } = location;
        const commonTypes = types.map((type) => `<li><span>${esc(type.label)}</span><strong>${type.count.toLocaleString()}</strong></li>`).join('');
        const aliases = otherNames.length ? `<div class="clery-location-aliases">Other location labels: ${otherNames.map(esc).join('; ')}</div>` : '';
        const rangeLabel = period ? `in ${period.year}` : 'in the past year';
        const card = `<div class="card clery-location-summary"><b>${esc(name)}</b><span>${count.toLocaleString()} reported incident${count === 1 ? '' : 's'} ${rangeLabel}</span><div class="clery-location-types-title">Most common crime types</div><ul class="clery-location-types">${commonTypes}</ul>${aliases}</div>`;
        const marker = L.circleMarker([lat, lng], {
          className: 'clery-aggregate-dot',
          radius: 1.875 * Math.sqrt(count),
          color: '#000', fillColor: '#fff', weight: 0, fillOpacity: 0.85,
        });
        let hovered = false;
        const outline = () => marker.setStyle({ weight: hovered || marker.isPopupOpen() ? 2 : 0 });
        marker.bindTooltip(card, { className: 'tip clery-location-tip', direction: 'top', offset: [0, -8] })
          .bindPopup(card, { className: 'pin', minWidth: 278, maxWidth: 278, offset: [0, -8] })
          .on('mouseover', () => { hovered = true; outline(); })
          .on('mouseout', () => { hovered = false; outline(); })
          .on('popupopen', () => { marker.closeTooltip(); outline(); })
          .on('popupclose', outline)
          .on('tooltipopen', () => marker.isPopupOpen() && marker.closeTooltip())
          .addTo(yearlyDots);
        aggregateMarkers.push({ marker, clearHighlight() { hovered = false; marker.setStyle({ weight: 0 }); } });
      });
      updateAggregateTargets();
    } else {
      let featuredMarker;
      const visibleIncidents = new Set(incidents);
      if (!map.hasLayer(dots)) dots.addTo(map);
      incidentMarkers.forEach((marker, incident) => {
        const matching = crimePrefix && matchesCategory(incident);
        const visible = visibleIncidents.has(incident) && (!crimePrefix || matching);
        updateIncidentMarker(marker, incident, {
          highlightCrime: matching ? passage.dataset.highlightCrime : '',
        });
        const interactive = visible && (!featuredCase || incident.case === featuredCase);
        marker.options.interactive = interactive;
        marker.getElement()?.classList.toggle('leaflet-interactive', interactive);
        marker.setStyle({ opacity: visible ? 1 : 0, fillOpacity: visible ? 0.75 : 0 });
        if (matching) marker.bringToFront();
        if (visible && incident.case === featuredCase) featuredMarker = marker;
      });
      if (featuredCase) {
        const incident = storyData.rows.find((item) => item.case === featuredCase);
        if (!featuredMarker && incident && hasMapLocation(incident)) {
          featuredMarker = createIncidentMarker(incident).addTo(dots);
        }
        callouts.show(passage, featuredMarker, incident, { moveCamera: Boolean(moveCamera && followsIncident) });
      }
    }
    if (moveCamera && hotspots) {
      const mobile = matchMedia('(max-width: 760px)').matches;
      map.flyToBounds([[37.865, -122.312], [37.893, -122.247]], {
        paddingTopLeft: [28, 40],
        paddingBottomRight: [28, mobile ? Math.min(300, map.getSize().y * 0.4) : 40],
        maxZoom: 14,
        animate: animateMap,
        duration: 1,
      });
    } else if (moveCamera && !followsIncident) map.flyTo(initialView.center, initialView.zoom, {
      animate: animateMap,
      duration: 1,
    });
  };
  const updateScene = () => {
    if (!scroller) return;
    const viewport = scroller.getBoundingClientRect();
    // The heatmap experiment is dormant unless its section exists in MDX.
    let period = null;
    if (experiment && card && years.length) {
      const bounds = experiment.getBoundingClientRect();
      const anchor = viewport.top + Math.max(24, scroller.clientHeight / 2 - 120);
      const progress = (anchor - bounds.top) / Math.max(1, experiment.offsetHeight - card.offsetHeight);
      period = progress < 0 ? null : years[Math.min(years.length - 1, Math.floor(progress * years.length))];
    }
    const passage = period ? null : callouts.passageAt(viewport.top + scroller.clientHeight * 0.7);
    show(period, passage);
    callouts.place();
  };
  let queued = false;
  const schedule = () => {
    // Update endpoints in the scroll event itself; scene selection can wait
    // until the next frame without letting a connector lag behind its text.
    callouts.place();
    if (queued) return;
    queued = true;
    scope.frame(() => { queued = false; updateScene(); });
  };
  show(null);
  updateScene();
  if (scroller) scope.listen(scroller, 'scroll', schedule, { passive: true });
  const resize = new ResizeObserver(() => {
    // A view change can detach the map before React runs its effect cleanup.
    // The heat renderer needs a nonempty canvas when invalidating its size.
    if (element.isConnected && element.clientWidth && element.clientHeight) map.invalidateSize();
    schedule();
  });
  resize.observe(element);
  if (experiment) resize.observe(experiment);
  return {
    mapped: located.length,
    total: crimes.length,
    dispose() {
      renderer.off('update', resetAggregateScale);
      map.off('zoom', updateAggregateScale);
      root.style.removeProperty('--clery-aggregate-scale');
      map.off('zoomend', updateAggregateTargets);
      resize.disconnect();
      scope.dispose();
      callouts.dispose();
      map.remove();
    },
  };
}
