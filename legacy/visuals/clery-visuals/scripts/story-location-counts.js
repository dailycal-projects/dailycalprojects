// Aggregate only reports in the active story view's date range.
export function storyLocationCounts(incidents) {
  const groups = new Map();
  for (const incident of incidents) {
    if (!Number.isFinite(incident.lat) || !Number.isFinite(incident.lng)) continue;
    const key = `${incident.lat},${incident.lng}`;
    if (!groups.has(key)) {
      groups.set(key, { lat: incident.lat, lng: incident.lng, count: 0, names: new Map(), types: new Map() });
    }
    const group = groups.get(key);
    group.count += 1;
    const name = (incident.loc || '').replace(/^\*+\s*/, '').replace(/\s+/g, ' ').trim();
    if (name) group.names.set(name, (group.names.get(name) || 0) + 1);

    // A report can list several charges. Count each code once per report,
    // grouping spelling/description variations under the same statute code.
    const reportTypes = new Map();
    for (const segment of (incident.crime || '').split('|')) {
      const text = segment.replace(/^\s*\*+/, '').trim();
      if (!text) continue;
      const colon = text.indexOf(':');
      const code = colon < 0 ? text : text.slice(0, colon).trim();
      const parts = (colon < 0 ? text : text.slice(colon + 1)).split(';').map((part) => part.trim());
      const book = /^[A-Z]{2}$/i.test(parts[0]) ? parts.shift().toUpperCase() : '';
      const label = parts[0] || code;
      const type = `${book} ${code}`.trim().toUpperCase();
      if (!reportTypes.has(type)) reportTypes.set(type, label);
    }
    for (const [type, label] of reportTypes) {
      if (!group.types.has(type)) group.types.set(type, { count: 0, labels: new Map() });
      const item = group.types.get(type);
      item.count += 1;
      item.labels.set(label, (item.labels.get(label) || 0) + 1);
    }
  }
  const rankedNames = (names) => [...names].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return [...groups.values()].map(({ names, types, ...group }) => {
    const locations = rankedNames(names).map(([name]) => name);
    return {
      ...group,
      name: locations[0] || 'Location not listed',
      otherNames: locations.slice(1, 3),
      types: [...types.values()].map((item) => ({
        label: rankedNames(item.labels)[0][0],
        count: item.count,
      })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 5),
    };
  });
}
