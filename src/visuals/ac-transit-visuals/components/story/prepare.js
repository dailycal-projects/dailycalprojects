import { corridorLatLngs, totalAt } from "../ridership-data";
import { BERKELEY_BOUNDARY } from "./berkeley-boundary";

// Web Mercator at zoom 0 (a 256 px world), identical to Leaflet's EPSG:3857
// projection. Everything the story draws is projected once into this space;
// a frame only has to scale by 2^zoom and translate, which is what keeps the
// map smooth while the camera flies and the week scrubs underneath it.
export function mercator(lat, lon) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return [
    ((lon + 180) / 360) * 256,
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256,
  ];
}

export function pointInRing(lat, lon, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function projectRing(coordinates, lonLat) {
  const out = new Float64Array(coordinates.length * 2);
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  coordinates.forEach((coordinate, index) => {
    const [x, y] = lonLat ? mercator(coordinate[1], coordinate[0]) : mercator(coordinate[0], coordinate[1]);
    out[index * 2] = x;
    out[index * 2 + 1] = y;
    bounds[0] = Math.min(bounds[0], x);
    bounds[1] = Math.min(bounds[1], y);
    bounds[2] = Math.max(bounds[2], x);
    bounds[3] = Math.max(bounds[3], y);
  });
  return { pts: out, bounds };
}

// The stop groups around the UC Berkeley campus: Bancroft, Durant, Hearst,
// Gayley, Piedmont and the Oxford/University edge. The same set drives the
// inferred-trips region and the weekly ridership chart.
const CAMPUS = { south: 37.866, north: 37.8765, west: -122.2665, east: -122.2505 };

function relativeSeries(data, keys) {
  const series = new Float32Array(data.W);
  let base = 0;
  for (const key of keys) base += totalAt(data, "group", key, data.BASE);
  for (let week = 0; week < data.W; week += 1) {
    let sum = 0;
    for (const key of keys) sum += totalAt(data, "group", key, week);
    series[week] = base > 0 ? sum / base : NaN;
  }
  return series;
}

function haversine(a, b) {
  const r = 6371008.8;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = p2 - p1;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

const cache = new WeakMap();

export function prepareStory(data) {
  if (cache.has(data)) return cache.get(data);
  const { meta } = data;
  const groups = meta.stop_groups;

  const gx = new Float64Array(groups.n);
  const gy = new Float64Array(groups.n);
  const groupInBerkeley = new Uint8Array(groups.n);
  const berkeleyGroups = [];
  const campusKeys = [];
  for (let key = 0; key < groups.n; key += 1) {
    const [x, y] = mercator(groups.lat[key], groups.lon[key]);
    gx[key] = x;
    gy[key] = y;
    if (pointInRing(groups.lat[key], groups.lon[key], BERKELEY_BOUNDARY)) {
      groupInBerkeley[key] = 1;
      berkeleyGroups.push(key);
    }
    if (
      groups.lat[key] > CAMPUS.south && groups.lat[key] < CAMPUS.north
      && groups.lon[key] > CAMPUS.west && groups.lon[key] < CAMPUS.east
    ) campusKeys.push(key);
  }

  // Areas are projected for both levels the story uses. A passage can switch
  // from block groups to tracts without re-projecting, and the two sets are
  // keyed by the same index space their weekly arrays use.
  const projectAreas = (collection, keys) => {
    const index = new Map(keys.map((id, i) => [String(id), i]));
    const out = [];
    for (const feature of collection?.features || []) {
      const key = index.get(String(feature.properties?.geoid));
      if (key === undefined || !feature.geometry) continue;
      const polygons = feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
      const rings = [];
      const bounds = [Infinity, Infinity, -Infinity, -Infinity];
      let latSum = 0;
      let lonSum = 0;
      let count = 0;
      for (const polygon of polygons) {
        for (const ring of polygon) {
          const projected = projectRing(ring, true);
          rings.push(projected.pts);
          bounds[0] = Math.min(bounds[0], projected.bounds[0]);
          bounds[1] = Math.min(bounds[1], projected.bounds[1]);
          bounds[2] = Math.max(bounds[2], projected.bounds[2]);
          bounds[3] = Math.max(bounds[3], projected.bounds[3]);
        }
        for (const [lon, lat] of polygon[0]) {
          lonSum += lon;
          latSum += lat;
          count += 1;
        }
      }
      out.push({
        key,
        rings,
        bounds,
        inBerkeley: count > 0 && pointInRing(latSum / count, lonSum / count, BERKELEY_BOUNDARY),
      });
    }
    return out;
  };

  const areasByLevel = {
    bgroup: projectAreas(data.geo.blockgroups, meta.bgroups),
    tract: projectAreas(data.geo.tracts, meta.tracts),
  };
  const areas = areasByLevel.bgroup;

  const corridors = {};
  // Which corridors lie in Berkeley and how long each one is, in metres. The
  // traffic section needs both: the city filter for what it averages, and the
  // length to weight that average by bus-km rather than by corridor count,
  // which would let a 40 m stub count as much as Shattuck.
  const corridorMeta = {};
  for (const [era, features] of Object.entries(data.corridors)) {
    const latLngs = features.map((feature) => corridorLatLngs(feature));
    // The smoothed corridor curve, flattened: see corridorLatLngs.
    corridors[era] = latLngs.map((pts) => projectRing(pts, false));
    corridorMeta[era] = latLngs.map((pts) => {
      let length = 0;
      let latSum = 0;
      let lonSum = 0;
      for (let i = 0; i < pts.length; i += 1) {
        latSum += pts[i][0];
        lonSum += pts[i][1];
        if (i > 0) length += haversine(pts[i - 1], pts[i]);
      }
      const lat = latSum / pts.length;
      const lon = lonSum / pts.length;
      return { length, inBerkeley: pointInRing(lat, lon, BERKELEY_BOUNDARY) };
    });
  }

  const prepared = {
    gx,
    gy,
    groupInBerkeley,
    berkeleyGroups,
    campusKeys,
    areas,
    areasByLevel,
    corridors,
    corridorMeta,
    berkeley: projectRing(BERKELEY_BOUNDARY, false).pts,
    series: {
      berkeley: relativeSeries(data, berkeleyGroups),
      system: relativeSeries(data, Array.from({ length: groups.n }, (_, key) => key)),
    },
    odLists: {},
  };
  cache.set(data, prepared);
  return prepared;
}

// Named places the copy points at. `keys` picks what the on-map label
// measures, at the level it is measured: a stop group where the story is
// about a stop, block groups where the stop groups changed underneath it --
// Tempo's median stations are new stop groups with no 2020 baseline, so only
// the areas around International Blvd can show its growth.
// Every AC Transit Transbay line in the data, including the ones that have not
// run since 2020, so the year-over-year share counts what was lost.
const TRANSBAY_ROUTES = [
  "B", "C", "CB", "E", "F", "FS", "G", "H", "J", "L", "LA", "LC", "M", "NL", "NX", "NX1", "NX2",
  "NX3", "NX4", "NXC", "O", "OX", "P", "S", "SB", "U", "V", "W", "Z",
];

export function resolvePlaces(data) {
  const groups = data.meta.stop_groups;
  const named = (pattern) => {
    const keys = [];
    for (let key = 0; key < groups.n; key += 1) if (pattern.test(groups.name[key])) keys.push(key);
    return keys;
  };
  const areasOf = (keys) => [...new Set(keys.map((key) => groups.bgroup[key]).filter((key) => key >= 0))];
  return {
    bancroft: {
      label: "Bancroft Way & College Ave.",
      lat: 37.86929, lon: -122.25513, level: "group", keys: named(/^Bancroft Way & College Av$/),
    },
    sanPablo: {
      label: "San Pablo Ave. & University Ave.",
      lat: 37.86912, lon: -122.29206, level: "group", keys: named(/^University Av & San Pablo Av$/),
    },
    tempo: {
      label: "International Blvd.",
      lat: 37.75911, lon: -122.18647, level: "bgroup", keys: areasOf(named(/International Blvd/)),
    },
    // The Transbay lines as a whole, reported as their past year against the
    // year before the pandemic (routesYearShare), not the terminal's one week.
    transbay: {
      label: "Transbay lines",
      lat: 37.78976, lon: -122.39606,
      routes: TRANSBAY_ROUTES.filter((route) => data.routeW.ix.has(route)),
    },
    ucVillage: { label: "UC Village", lat: 37.88428, lon: -122.29889 },
    // The commute passages point at four tracts by number. Their centres come
    // from the tract geometry rather than being written down, so they follow
    // a boundary revision instead of drifting off it.
    tract4238: tract(data, "4238"),
    tract4235: tract(data, "4235"),
    tract4425: tract(data, "4425.02"),
    tract4403: tract(data, "4403.01"),
  };
}

// A named Census tract as a place the story can ring and label. Census writes
// the suffix padded ("4425.02"); the label drops the padding, the way the
// copy says it out loud.
function tract(data, name) {
  const feature = (data.geo?.tracts?.features || [])
    .find((f) => f.properties?.name === `Census Tract ${name}`);
  const label = `Tract ${name.replace(/\.0*(\d)/, ".$1")}`;
  if (!feature) return { label, lat: 0, lon: 0, missing: true };
  const polygons = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
  let latSum = 0;
  let lonSum = 0;
  let count = 0;
  for (const [lon, lat] of polygons[0][0]) {
    lonSum += lon;
    latSum += lat;
    count += 1;
  }
  const key = data.meta.tracts.indexOf(feature.properties.geoid);
  return {
    label,
    lat: latSum / count,
    lon: lonSum / count,
    level: "tract",
    keys: key >= 0 ? [key] : [],
  };
}
