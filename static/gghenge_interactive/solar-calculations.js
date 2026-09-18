/* ============================================================
   SOLAR CALCULATIONS
   Uses the data in solar-ephemeris.js to calculate the sun's position
   and sunset time at a given latitude and longitude.
   Azimuth = direction clockwise from true north, in degrees.
   Altitude = Sun's angle above horizontal, in degrees (negative = below horiztonal).
   timeMs = milliseconds since Jan 1, 1970, 00:00 UTC.
   ============================================================ */

// run this function immediately, with globalThis passed in as root (see last line)
// the wrapper keeps helpers private; only GGHSolar is made global below
(function (root) {
  "use strict";
  const data = root.GGHEphemeris; // read the global data object from solar-ephemeris.js
  const RAD = Math.PI / 180; // multiply degrees by RAD to get radians
  const DAY_MS = 86400000; // milliseconds in one day
  // sun's center at nominal sunset; includes an allowance for its radius and refraction
  const SUNSET_ALTITUDE = -0.833;

  // convert any angle to the range [0, 360)
  const normalize = angle => ((angle % 360) + 360) % 360;

  // evaluate a+bx+cx^2+dx^3 using four numbers from a day's data row
  // offset selects the group of four; x is the fraction of the UTC day elapsed
  function polynomial(row, offset, x) {
    return ((row[offset + 3] * x + row[offset + 2]) * x + row[offset + 1]) * x + row[offset];
  }

  // get the sun's position relative to Earth's center at a given time
  // returns RA and declination (sky coordinates), distance, and Earth's orientation
  function equatorial(timeMs) {
    const day = (timeMs - data.startMs) / DAY_MS;
    const index = Math.floor(day);
    if (!Number.isFinite(day) || index < 0 || index >= data.days.length) {
      throw new RangeError("Solar ephemeris covers August 31, 2026 through April 2, 2027 UTC");
    }
    const row = data.days[index]; // select the UTC day's row in GGHEphemeris
    const x = day - index;
    return {
      ra: polynomial(row, 0, x), dec: polynomial(row, 4, x),
      distance: polynomial(row, 8, x), gast: polynomial(row, 12, x),
      poleX: polynomial(row, 16, x) * RAD / 3600,
      poleY: polynomial(row, 20, x) * RAD / 3600
    };
  }

  // convert the viewing location to x, y, z coordinates in km from Earth's center
  // also save its sin/cos values for converting the sun's position to this view
  function observer(latitude, longitude) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new RangeError("Invalid observer coordinates");
    }
    const phi = latitude * RAD, lambda = longitude * RAD;
    const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
    const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
    // use WGS84 (Earth's slightly flattened shape), with observer elevation set to 0
    const eccentricity2 = 0.0066943799901413165;
    const n = 6378.137 / Math.sqrt(1 - eccentricity2 * sinPhi * sinPhi);
    return {sinPhi, cosPhi, sinLambda, cosLambda,
      x: n * cosPhi * cosLambda, y: n * cosPhi * sinLambda,
      z: n * (1 - eccentricity2) * sinPhi};
  }

  // find the sun's direction and height at a given time, using an observer() result
  // returns { altitude, azimuth } in degrees; altitude has no atmospheric refraction added
  function positionAt(timeMs, site) {
    const sun = equatorial(timeMs);
    const longitude = (sun.ra - sun.gast) * RAD;
    const declination = sun.dec * RAD;
    let x = Math.cos(declination) * Math.cos(longitude) * sun.distance;
    let y = Math.cos(declination) * Math.sin(longitude) * sun.distance;
    let z = Math.sin(declination) * sun.distance;
    // account for the small movement of Earth's rotation axis relative to its surface
    const cx = Math.cos(sun.poleX), sx = Math.sin(sun.poleX);
    const cy = Math.cos(sun.poleY), sy = Math.sin(sun.poleY);
    [x, z] = [cx * x + sx * z, -sx * x + cx * z];
    [y, z] = [cy * y - sy * z, sy * y + cy * z];
    // shift the viewpoint from Earth's center to the observer (solar parallax)
    x -= site.x; y -= site.y; z -= site.z;
    const distance = Math.hypot(x, y, z);
    x /= distance; y /= distance; z /= distance;
    // adjust for the small apparent shift caused by the observer moving as Earth rotates
    const omegaOverC = 7.2921150e-5 / 299792.458;
    const bx = -site.y * omegaOverC, by = site.x * omegaOverC;
    const dot = x * bx + y * by;
    x += bx - x * dot; y += by - y * dot; z -= z * dot;
    // express the sun's direction in the observer's local east, north, and up directions
    const east = -site.sinLambda * x + site.cosLambda * y;
    const north = -site.sinPhi * (site.cosLambda * x + site.sinLambda * y) + site.cosPhi * z;
    const up = site.cosPhi * (site.cosLambda * x + site.sinLambda * y) + site.sinPhi * z;
    return {
      altitude: Math.atan2(up, Math.hypot(east, north)) / RAD,
      azimuth: normalize(Math.atan2(east, north) / RAD)
    };
  }

  // find when the descending sun reaches SUNSET_ALTITUDE on the requested day
  // dayOfYear starts at 1 on Jan 1 of the given year
  // returns { timeMs, azimuth }, or null if there is no sunset
  function sunset(year, dayOfYear, latitude, longitude) {
    const site = observer(latitude, longitude);
    const midnight = Date.UTC(year, 0, dayOfYear);
    // start near 6pm by local mean solar time (based on longitude, not the clock timezone)
    let timeMs = midnight + (18 - longitude / 15) * 3600000;
    const noon = midnight + (12 - longitude / 15) * 3600000;
    const end = noon + DAY_MS / 2;
    // first try: use the sun's height and rate of descent to improve the time estimate
    // repeat until its height is close enough to SUNSET_ALTITUDE (Newton's method)
    for (let i = 0; i < 8; i++) {
      const position = positionAt(timeMs, site);
      const residual = position.altitude - SUNSET_ALTITUDE;
      if (Math.abs(residual) < 1e-8) return {timeMs, azimuth: position.azimuth};
      const slope = (positionAt(timeMs + 1000, site).altitude - position.altitude) / 1000;
      const next = timeMs - residual / slope;
      if (slope >= 0 || !Number.isFinite(next) || next < noon || next > end) break;
      timeMs = next;
    }
    // check every 30 minutes for the sun crossing the target height
    let lo = noon, loAltitude = positionAt(lo, site).altitude;
    for (let hi = noon + 1800000; hi <= end; hi += 1800000) {
      const hiAltitude = positionAt(hi, site).altitude;
      if (loAltitude >= SUNSET_ALTITUDE && hiAltitude <= SUNSET_ALTITUDE) {
        let upper = hi;
        // narrow the crossing interval by checking its midpoint each time
        for (let i = 0; i < 32; i++) {
          const mid = (lo + upper) / 2;
          if (positionAt(mid, site).altitude > SUNSET_ALTITUDE) lo = mid;
          else upper = mid;
        }
        timeMs = (lo + upper) / 2;
        return {timeMs, azimuth: positionAt(timeMs, site).azimuth};
      }
      lo = hi; loAltitude = hiAltitude;
    }
    return null; // no sunset found, e.g. during polar day or night
  }

  // create the global GGHSolar object so index_fa26.html can use these functions
  // root is globalThis, so root.GGHSolar means globalThis.GGHSolar
  // the wrapper assigns this object to the global scope; it does not return it
  root.GGHSolar = {
    // GGHSolar.sunset(year, dayOfYear, latitude, longitude): sunset time and azimuth
    sunset,
    // GGHSolar.position(timeMs, latitude, longitude): altitude and azimuth at any time
    position: (timeMs, latitude, longitude) => positionAt(timeMs, observer(latitude, longitude)),
    // GGHSolar.sunsetAltitude: the number -0.833, not a function
    sunsetAltitude: SUNSET_ALTITUDE
  };
})(globalThis); // call the wrapper with the global object as its root argument
