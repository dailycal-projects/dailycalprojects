import { hasMapLocation } from './data';

// Include every calendar year, including years without mapped reports.
// Reported dates match the dashboard's timeline; locations remain approximate.
export function buildStoryYears(data) {
  const first = 2020;
  const latest = new Date(data.latest);
  const last = Number.isFinite(data.latest) ? latest.getFullYear() : first;
  const years = [];
  for (let year = first; year <= last; year++) {
    years.push({
      key: String(year),
      year,
      incidents: [],
    });
  }
  for (const incident of data.rows) {
    if (!incident.crime || !Number.isFinite(incident.t) || !hasMapLocation(incident)) continue;
    const date = new Date(incident.t);
    years[date.getFullYear() - first]?.incidents.push(incident);
  }
  return years;
}
