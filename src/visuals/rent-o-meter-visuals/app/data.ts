// Loads public/data/*, built by scripts/build_dc_app_data.py (see its docstring for the raw layout).
import { assetBase } from "./host";
import { strings } from "./strings";
import { fmt } from "./text";

export type Unit = {
  b: number; // building index
  i: number; // index within the building
  label: string;
  beds: number; // -1 = unknown
  rent: number; // 0 = no usable rent
  tenure: number | null; // years before the export date
  before: boolean; // move-in date is a base-date placeholder: "here since then or earlier"
  rented: boolean;
  ua: number; // index into building.uaddrs
  flagged?: { rent: number; why: "annual" | "outlier" }; // registry rent looked like an error; rent set to 0
  expected: number; // rent-o-meter for someone who moved in when this tenant did (0 = no estimate)
};

export type Building = {
  i: number;
  address: string;
  zip: string;
  lat: number;
  lon: number;
  era: number | null; // 20-year band built in (index into strings.building.eras); the year itself isn't shipped
  total: number;
  approx: boolean;
  controlled: boolean;
  district: number; // city council district, 0-7 (see Dataset.districts)
  landlord: number; // index into Dataset.landlords, -1 = not named (owns fewer than 3 parcels)
  owner: number; // index into Dataset.owners, -1 = no owner name on file
  expected: number[]; // rent-o-meter: expected rent for someone moving in now, by bedrooms 0..5 (5 = 5+)
  units: Unit[];
  uaddrs: string[];
  rentCount: number;
};

export type SearchEntry = { text: string; key: string; b: number; ua: number };

export type Owners = {
  names: string[];
  parcels: number[];
  units: number[];
  premium: (number | null)[]; // $/unit/month vs the rent-o-meter, owners of 6+ parcels only
};

export type District = { name: string; rings: [number, number][][] }; // rings in [lon, lat]

export type Dataset = {
  asof: string;
  districts: District[];
  landlords: string[]; // owners of 3+ parcels, largest first (scripts/build_dc_app_landlords.py)
  owners: Owners; // every building's owner, for the story (scripts/build_dc_app_rentometer.py)
  rentRange: { market: [number, number]; controlled: [number, number] }; // middle-half range, x the estimate
  byYear: { from: number; market: number[]; controlled: number[] }; // x Building.expected for a typed move-in year
  tile: [number, number];
  buildings: Building[];
  search: SearchEntry[];
  rents: Unit[]; // every unit with a usable rent
};

type RawUnit = [string, number, number, number | null, number, number, number];
type RawBuilding = [string, string, number, number, number | null, number, number, RawUnit[], string[], number];

const base = assetBase;

export function normalizeAddress(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bplace\b/g, "pl")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\broad\b/g, "rd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\blane\b/g, "ln")
    .replace(/\bterrace\b/g, "ter")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadDataset(): Promise<Dataset> {
  const [res, dres, lres, ores, rres] = await Promise.all(
    ["buildings", "districts", "landlords", "owners", "rentometer"].map((f) => fetch(`${base}data/${f}.json`)),
  );
  for (const r of [res, dres, lres, ores, rres]) if (!r.ok) throw new Error(fmt(strings.errors.data, { status: r.status }));
  const owners = (await ores.json()) as Owners & { of: number[] };
  const meter = (await rres.json()) as {
    range: Dataset["rentRange"];
    exp: number[][];
    unit: number[][];
    byYear: Dataset["byYear"];
    flags: [number, string, number, number, "annual" | "outlier"][];
  };
  const flagged = new Map(meter.flags.map(([b, label, beds, rent, why]) => [`${b}|${label}|${beds}|${rent}`, why]));
  const dist = (await dres.json()) as { names: string[]; rings: number[][][]; of: number[] };
  const lords = (await lres.json()) as { names: string[]; of: number[] };
  const raw = (await res.json()) as {
    asof: string;
    tile: [number, number];
    buildings: RawBuilding[];
    search: [string, number, number][];
  };
  const rents: Unit[] = [];
  const buildings = raw.buildings.map((r, bi): Building => {
    const units = r[7].map(
      (u, i): Unit => ({
        b: bi,
        i,
        label: u[0],
        beds: u[1],
        rent: u[2],
        tenure: u[3] === null ? null : u[3] / 10,
        before: u[4] === 1,
        rented: u[5] === 1,
        ua: u[6],
        expected: meter.unit[bi][i],
      }),
    );
    for (const u of units) {
      // rents the rent-o-meter build flagged as registry errors don't count anywhere
      const why = flagged.get(`${bi}|${u.label}|${u.beds}|${u.rent}`);
      if (why && u.rent > 0) {
        u.flagged = { rent: u.rent, why };
        u.rent = 0;
      }
      if (u.rent > 0 && u.beds >= 0) rents.push(u);
    }
    return {
      i: bi,
      address: r[0],
      zip: r[1],
      lat: r[2],
      lon: r[3],
      era: r[4],
      total: r[5],
      approx: r[6] === 1,
      units,
      uaddrs: r[8],
      controlled: r[9] === 1,
      district: dist.of[bi],
      landlord: lords.of[bi],
      owner: owners.of[bi],
      expected: meter.exp[bi],
      rentCount: units.filter((u) => u.rent > 0).length,
    };
  });
  const search = raw.search.map(([text, b, ua]) => ({ text, b, ua, key: normalizeAddress(text) }));
  const districts = dist.names.map((name, i) => ({ name, rings: dist.rings[i].map((r) => decode(r, 0)) }));
  return {
    asof: raw.asof,
    tile: raw.tile,
    districts,
    landlords: lords.names,
    owners,
    rentRange: meter.range,
    byYear: meter.byYear,
    buildings,
    search,
    rents,
  };
}

// --- parcel tiles ---------------------------------------------------------------------------------

export type Parcel = { b: number; pts: [number, number][] }; // [lon, lat]

const tileCache = new Map<string, Promise<Parcel[]>>();

function decode(flat: number[], from: number): [number, number][] {
  let x = flat[from];
  let y = flat[from + 1];
  const pts: [number, number][] = [[x / 1e5, y / 1e5]];
  for (let k = from + 2; k < flat.length; k += 2) {
    x += flat[k];
    y += flat[k + 1];
    pts.push([x / 1e5, y / 1e5]);
  }
  return pts;
}

function loadTile(tx: number, ty: number): Promise<Parcel[]> {
  const key = `${tx}_${ty}`;
  let p = tileCache.get(key);
  if (!p) {
    p = fetch(`${base}data/tiles/${key}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<number[][]>) : []))
      .then((rows) => rows.map((row) => ({ b: row[0], pts: decode(row, 1) })))
      .catch(() => []);
    tileCache.set(key, p);
  }
  return p;
}

export async function loadParcels(
  ds: Dataset,
  bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number },
): Promise<Parcel[]> {
  const [w, h] = ds.tile;
  const tx0 = Math.floor((bbox.minLon + 123) / w);
  const tx1 = Math.floor((bbox.maxLon + 123) / w);
  const ty0 = Math.floor((bbox.minLat - 37) / h);
  const ty1 = Math.floor((bbox.maxLat - 37) / h);
  const jobs: Promise<Parcel[]>[] = [];
  // a parcel is filed under the tile of its first vertex, so read one tile of margin
  for (let tx = tx0 - 1; tx <= tx1 + 1; tx++) for (let ty = ty0 - 1; ty <= ty1 + 1; ty++) jobs.push(loadTile(tx, ty));
  return (await Promise.all(jobs)).flat();
}

// --- streets -------------------------------------------------------------------------------------

export type Street = { major: boolean; pts: [number, number][] };
let streetsPromise: Promise<Street[]> | null = null;

export function loadStreets(): Promise<Street[]> {
  streetsPromise ??= fetch(`${base}data/streets.json`)
    .then((r) => r.json() as Promise<number[][]>)
    .then((rows) => rows.map((row) => ({ major: row[0] === 1, pts: decode(row, 1) })));
  return streetsPromise;
}

// --- blocks --------------------------------------------------------------------------------------

/** A literal city block: touching parcels, with the buildings on them (scripts/build_dc_app_blocks.py). */
export type Block = { members: number[]; rings: [number, number][][] }; // rings in [lon, lat]
let blocksPromise: Promise<Block[]> | null = null;

export function loadBlocks(): Promise<Block[]> {
  blocksPromise ??= fetch(`${base}data/blocks.json`)
    .then((r) => r.json() as Promise<[number[], ...number[][]][]>)
    .then((rows) => rows.map(([members, ...rings]) => ({ members, rings: rings.map((r) => decode(r, 0)) })));
  return blocksPromise;
}
