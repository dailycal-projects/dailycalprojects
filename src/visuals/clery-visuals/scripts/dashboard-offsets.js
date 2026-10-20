import L from 'leaflet';

// Allocate slots from the full archive, never from the sliding selection.
// Newest reports sit closest to the reported location; older reports occupy
// successive rings. Filtering dates only reveals or hides existing slots.
export function createDashboardOffsets(map, incidents) {
  const groups = new Map();
  for (const incident of incidents) {
    if (!incident.m) continue;
    const key = `${incident.lat},${incident.lng}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(incident);
  }
  const pane = map.createPane('clery-offset-lines');
  pane.style.zIndex = '399';
  pane.style.pointerEvents = 'none';
  const renderer = L.canvas({ pane: 'clery-offset-lines' });
  for (const group of groups.values()) {
    group.sort((a, b) => b.t - a.t || a.case.localeCompare(b.case) || a.crime.localeCompare(b.crime) || a.idx - b.idx);
    group.forEach((incident, index) => {
      if (!index) {
        incident.dotOffset = L.point(0, 0);
        return;
      }
      let ring = 1, slot = index - 1;
      let capacity = Math.floor(2 * Math.PI * ring);
      while (slot >= capacity) {
        slot -= capacity;
        ring += 1;
        capacity = Math.floor(2 * Math.PI * ring);
      }
      const angle = -Math.PI / 2 + 2 * Math.PI * slot / capacity;
      incident.dotOffset = L.point(16 * ring * Math.cos(angle), 16 * ring * Math.sin(angle));
      incident.offsetLine = L.polyline([[incident.lat, incident.lng], [incident.lat, incident.lng]], {
        renderer, color: '#b9bdc4', weight: 0.7, opacity: 0.35, interactive: false,
      });
    });
  }
  return {
    update(incident) {
      if (!incident.m || !incident.dotOffset) return;
      const origin = L.latLng(incident.lat, incident.lng);
      const position = map.unproject(map.project(origin).add(incident.dotOffset));
      incident.m.setLatLng(position);
      incident.offsetLine?.setLatLngs([origin, position]);
    },
  };
}
