/* ============================================================
   gghMath.js — Astronomy + geometry utilities for GGH
   ============================================================ */

import { BRIDGE, GRID } from './constants';

export function degToRad(deg) { return deg * Math.PI / 180; }
export function radToDeg(rad) { return rad * 180 / Math.PI; }

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getTodayDOY() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now - start) / 86400000) + 1;
}

export function doyToDateStr(doy, year = new Date().getFullYear()) {
  const d = new Date(year, 0, 1);
  d.setDate(Number(doy));
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

// Bearing (degrees) from observer to target measured from true north
export function bearingDeg(fromLng, fromLat, toLng, toLat) {
  const phi1    = degToRad(fromLat);
  const phi2    = degToRad(toLat);
  const lambda1 = degToRad(fromLng);
  const lambda2 = degToRad(toLng);
  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  return (radToDeg(Math.atan2(y, x)) + 360) % 360;
}

export function signedAngleDiff(a, b) { return ((a - b + 540) % 360) - 180; }
export function normalize360(angle)   { return ((angle % 360) + 360) % 360; }
export function angularWidth(a, b)    { return Math.abs(signedAngleDiff(a, b)); }

export function sunsetUTC(dayNum, year, lat, lng) {
  const PI   = Math.PI;
  const zen  = 90.833;
  const gA   = 18;
  const days = isLeapYear(year) ? 366 : 365;
  const d    = new Date(Date.UTC(year, 0, dayNum));

  function eqTime(gamma) {
    return 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma)  - 0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2*gamma)- 0.040849 * Math.sin(2*gamma)
    );
  }

  function declin(gamma) {
    return (
      0.006918 -
      0.399912 * Math.cos(gamma)   + 0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2*gamma) + 0.000907 * Math.sin(2*gamma) -
      0.002697 * Math.cos(3*gamma) + 0.001480 * Math.sin(3*gamma)
    );
  }

  function hourAngle(dec) {
    return radToDeg(
      Math.acos(
        Math.cos(degToRad(zen)) / (Math.cos(degToRad(lat)) * Math.cos(dec)) -
        Math.tan(degToRad(lat)) * Math.tan(dec)
      )
    );
  }

  function solarMinutes(gHour) {
    const gamma = 2 * PI / days * (dayNum - 1 + (gHour - 12) / 24);
    return 720 - 4 * lng - eqTime(gamma) + 4 * hourAngle(declin(gamma));
  }

  // Two-pass refinement
  const smA = solarMinutes(gA);
  const smB = solarMinutes(smA / 60);

  return new Date(d.getTime() + smB * 60000);
}

export function sunsetLocalTime(dayNum, lat, lng, year = new Date().getFullYear()) {
  return sunsetUTC(dayNum, year, lat, lng).toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });
}

export function dayFrac(dayNum, lat, lng, year = new Date().getFullYear()) {
  const sunset     = sunsetUTC(dayNum, year, lat, lng);
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  return (sunset - startOfYear) / 86400000 + 1;
}

export function sunsetDeclination(dayFraction, daysThisYear) {
  const t = 2 * Math.PI * (dayFraction - 1) / daysThisYear;
  return radToDeg(
    0.006918 -
    0.399912 * Math.cos(t)   + 0.070257 * Math.sin(t) -
    0.006758 * Math.cos(2*t) + 0.000907 * Math.sin(2*t) -
    0.002697 * Math.cos(3*t) + 0.001480 * Math.sin(3*t)
  );
}

export function sunsetAzimuth(dayFraction, lat, year = new Date().getFullYear()) {
  const days    = isLeapYear(year) ? 366 : 365;
  const declDeg = sunsetDeclination(dayFraction, days);
  const val     = Math.sin(degToRad(declDeg)) / Math.cos(degToRad(lat));
  return ((360 - radToDeg(Math.acos(Math.max(-1, Math.min(1, val))))) % 360) + 0.5;
}

export function getBridgeBounds(lng, lat) {
  const thetaMid   = bearingDeg(lng, lat, BRIDGE.midpoint[0],   BRIDGE.midpoint[1]);
  const thetaNorth = bearingDeg(lng, lat, BRIDGE.northTower[0], BRIDGE.northTower[1]);
  const thetaSouth = bearingDeg(lng, lat, BRIDGE.southTower[0], BRIDGE.southTower[1]);
  const bridgeDelta  = angularWidth(thetaSouth, thetaNorth);
  const allowedDelta = bridgeDelta / 3;
  return {
    thetaMid, thetaNorth, thetaSouth, bridgeDelta, allowedDelta,
    center: thetaMid,
    upper:  normalize360(thetaMid + allowedDelta / 2),
    lower:  normalize360(thetaMid - allowedDelta / 2),
  };
}

export function boundaryResidual(dayNum, lat, lng, side, year) {
  const df    = dayFrac(dayNum, lat, lng, year);
  const sunAz = sunsetAzimuth(df, lat, year);
  const bounds = getBridgeBounds(lng, lat);
  return side === 'upper'
    ? signedAngleDiff(sunAz, bounds.upper)
    : signedAngleDiff(sunAz, bounds.lower);
}

export function findBoundaryLatAtLng(dayNum, lng, side, year) {
  const step = GRID.step;
  let prevLat = GRID.latMin;
  let prevVal = boundaryResidual(dayNum, prevLat, lng, side, year);

  for (let lat = GRID.latMin + step; lat <= GRID.latMax; lat += step) {
    const val = boundaryResidual(dayNum, lat, lng, side, year);
    if (Math.abs(val) < 1e-8) return lat;
    if ((prevVal < 0 && val > 0) || (prevVal > 0 && val < 0)) {
      let lo = prevLat, hi = lat, loV = prevVal, hiV = val;
      for (let i = 0; i < 32; i++) {
        const mid = (lo + hi) / 2;
        const midV = boundaryResidual(dayNum, mid, lng, side, year);
        if (Math.abs(midV) < 1e-8) return mid;
        if ((loV < 0 && midV > 0) || (loV > 0 && midV < 0)) { hi = mid; hiV = midV; }
        else                                                   { lo = mid; loV = midV; }
      }
      return (lo + hi) / 2;
    }
    prevLat = lat; prevVal = val;
  }
  return null;
}

export function buildBoundaryFillGeoJSON(dayNum, year) {
  // No GGH during summer
  if (dayNum >= 83 && dayNum <= 261) return { type: 'FeatureCollection', features: [] };

  const rows = [];
  for (let lng = GRID.lngMin; lng <= GRID.lngMax; lng += GRID.step) {
    const upperLat = findBoundaryLatAtLng(dayNum, lng, 'upper', year);
    const lowerLat = findBoundaryLatAtLng(dayNum, lng, 'lower', year);
    if (upperLat !== null && lowerLat !== null && upperLat >= lowerLat) {
      rows.push({ lng, upper: upperLat, lower: lowerLat });
    }
  }

  if (rows.length < 2) return { type: 'FeatureCollection', features: [] };

  // Split into contiguous segments
  const segments = [];
  let current = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].lng - rows[i-1].lng <= GRID.step * 1.5) {
      current.push(rows[i]);
    } else {
      if (current.length >= 2) segments.push(current);
      current = [rows[i]];
    }
  }
  if (current.length >= 2) segments.push(current);
  if (segments.length === 0) return { type: 'FeatureCollection', features: [] };

  const best = segments.reduce((a, b) => b.length > a.length ? b : a, segments[0]);
  const upper = best.map(p => [p.lng, p.upper]);
  const lower = best.map(p => [p.lng, p.lower]).reverse();
  const ring  = [...upper, ...lower, upper[0]];

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [ring] },
      properties: {},
    }],
  };
}

export function getWeightedRating(access, views, env) {
  return (1.3 * views + 1.1 * env + 0.6 * access) / 3;
}

export function ratingDots(score, max = 5) {
  const filled = Math.round(score);
  return '●'.repeat(filled) + '○'.repeat(max - filled);
}

export function formatDateRange(start, end) {
  return Number(start) === Number(end)
    ? doyToDateStr(Number(start))
    : `${doyToDateStr(Number(start))} – ${doyToDateStr(Number(end))}`;
}