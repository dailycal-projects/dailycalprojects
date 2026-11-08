import L from 'leaflet';

// Only visible reports occupy slots. Keep surviving dots in their current
// slots where possible, moving outer dots inward to fill newly empty spaces.
export function createDashboardOffsets(map) {
  let groups = new Map();
  const pane = map.createPane('clery-offset-lines');
  pane.style.zIndex = '399';
  pane.style.pointerEvents = 'none';
  const renderer = L.canvas({ pane: 'clery-offset-lines' });
  function positionFor(index) {
    if (!index) return L.point(0, 0);
    let ring = 1, slot = index - 1;
    let capacity = Math.floor(2 * Math.PI * ring);
    while (slot >= capacity) {
      slot -= capacity;
      ring += 1;
      capacity = Math.floor(2 * Math.PI * ring);
    }
    const angle = -Math.PI / 2 + 2 * Math.PI * slot / capacity;
    return L.point(16 * ring * Math.cos(angle), 16 * ring * Math.sin(angle));
  }

  function update(incident) {
    if (!incident.m || !incident.dotOffset) return;
    const origin = L.latLng(incident.lat, incident.lng);
    const position = map.unproject(map.project(origin).add(incident.dotOffset));
    incident.m.setLatLng(position);
    if (incident.dotSlot > 0 && !incident.offsetLine) {
      incident.offsetLine = L.polyline([origin, position], {
        renderer, color: '#b9bdc4', weight: 0.7, opacity: 0.35, interactive: false,
      });
    }
    incident.offsetLine?.setLatLngs([origin, position]);
  }

  return {
    update,
    setVisible(incidents) {
      const visibleGroups = new Map();
      for (const incident of incidents) {
        if (!incident.m) continue;
        const key = `${incident.lat},${incident.lng}`;
        if (!visibleGroups.has(key)) visibleGroups.set(key, []);
        visibleGroups.get(key).push(incident);
      }
      const nextGroups = new Map();
      for (const [key, visible] of visibleGroups) {
        const previous = groups.get(key) || new Map();
        if (previous.size === visible.length && visible.every((incident) => previous.has(incident))) {
          nextGroups.set(key, previous);
          continue;
        }
        const slots = new Map();
        const occupied = new Set();
        visible.forEach((incident) => {
          const slot = previous.get(incident);
          if (slot !== undefined && slot < visible.length) {
            slots.set(incident, slot);
            occupied.add(slot);
          }
        });
        const free = Array.from({ length: visible.length }, (_, index) => index).filter((slot) => !occupied.has(slot));
        const pending = visible.filter((incident) => !slots.has(incident)).sort((a, b) =>
          (previous.get(a) ?? Infinity) - (previous.get(b) ?? Infinity)
          || b.t - a.t || a.case.localeCompare(b.case) || a.idx - b.idx);
        pending.forEach((incident, index) => slots.set(incident, free[index]));
        slots.forEach((slot, incident) => {
          if (previous.has(incident) && incident.dotSlot === slot) return;
          incident.dotSlot = slot;
          incident.dotOffset = positionFor(slot);
          update(incident);
        });
        nextGroups.set(key, slots);
      }
      groups = nextGroups;
    },
  };
}
