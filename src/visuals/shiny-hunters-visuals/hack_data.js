// eslint-disable-next-line import/no-webpack-loader-syntax
import rawCsv from '!!raw-loader!./data.csv';

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function parseGeoloc(geoloc) {
  if (!geoloc || geoloc === 'Address not found') {
    return { lat: null, lng: null };
  }

  const [lat, lng] = geoloc.split(',').map((coord) => Number(coord.trim()));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: null, lng: null };
  }

  return { lat, lng };
}

function parsePinned(pinned) {
  return pinned && pinned.trim().toLowerCase() === 'true' ? true : null;
}

function rowsToUniversities(csv) {
  const [headers, ...rows] = parseCsv(csv);
  const nameIndex = headers.indexOf('Name');
  const geolocIndex = headers.indexOf('Geoloc');
  const pinnedIndex = headers.indexOf('Pinned');
  const universities = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameIndex] && row[nameIndex].trim();

    if (name) {
      const { lat, lng } = parseGeoloc(row[geolocIndex]);

      universities.push({
        id: i,
        name,
        searchName: name.toLowerCase(),
        lat,
        lng,
        pinned: parsePinned(row[pinnedIndex]),
      });
    }
  }

  return universities;
}

const universities = rowsToUniversities(rawCsv);
const mappableUniversities = universities.filter((u) => u.lat != null && u.lng != null);

export const hackData = {
  universities,
  mappableUniversities,
};
