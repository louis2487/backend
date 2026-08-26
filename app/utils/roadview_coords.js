'use strict';

const proj4 = require('proj4');

// 한국 중부원점(서부원점 아님) — 과천 등 중부권 TM (EPSG:5186)
proj4.defs(
  'EPSG:5186',
  '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs'
);
proj4.defs(
  'EPSG:5181',
  '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs'
);
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

function looksLikeLonLat(x, y) {
  return Math.abs(x) <= 180 && Math.abs(y) <= 90;
}

function looksLikeKoreaTm(x, y) {
  return x > 100000 && x < 400000 && y > 1000000 && y < 3000000;
}

/**
 * @returns {{ lon: number, lat: number } | null}
 */
function toWgs84(x, y, fromCrs = 'EPSG:5186') {
  const nx = Number(x);
  const ny = Number(y);
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;

  if (looksLikeLonLat(nx, ny)) {
    // 한국: lon≈126~129, lat≈33~39
    if (nx > ny) return { lon: nx, lat: ny };
    return { lon: ny, lat: nx };
  }

  const crs = fromCrs || 'EPSG:5186';
  try {
    const [lon, lat] = proj4(crs, 'EPSG:4326', [nx, ny]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    return { lon, lat };
  } catch (_) {
    return null;
  }
}

function detectCrsFromPrj(prjText) {
  if (!prjText) return 'EPSG:5186';
  const t = prjText.toLowerCase();
  if (t.includes('5186') || (t.includes('korea_2000') && t.includes('central'))) {
    return 'EPSG:5186';
  }
  if (t.includes('5181')) return 'EPSG:5181';
  if (t.includes('wgs_84') || t.includes('gcs_wgs') || t.includes('geographic')) {
    return 'EPSG:4326';
  }
  return 'EPSG:5186';
}

function polygonCentroid(coords) {
  // coords: [[x,y], ...] or nested rings
  let ring = coords;
  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
    ring = coords[0];
  }
  if (!Array.isArray(ring) || ring.length === 0) return null;

  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const a = x1 * y2 - x2 * y1;
    area += a;
    cx += (x1 + x2) * a;
    cy += (y1 + y2) * a;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-12) {
    const xs = ring.map((p) => p[0]);
    const ys = ring.map((p) => p[1]);
    return {
      x: xs.reduce((s, v) => s + v, 0) / xs.length,
      y: ys.reduce((s, v) => s + v, 0) / ys.length,
    };
  }
  return { x: cx / (6 * area), y: cy / (6 * area) };
}

function geometryCentroid(geometry) {
  if (!geometry) return null;
  const type = geometry.type;
  const c = geometry.coordinates;
  if (!c) return null;

  if (type === 'Point') {
    return { x: c[0], y: c[1] };
  }
  if (type === 'MultiPoint') {
    const xs = c.map((p) => p[0]);
    const ys = c.map((p) => p[1]);
    return {
      x: xs.reduce((s, v) => s + v, 0) / xs.length,
      y: ys.reduce((s, v) => s + v, 0) / ys.length,
    };
  }
  if (type === 'LineString') {
    const mid = c[Math.floor(c.length / 2)];
    return { x: mid[0], y: mid[1] };
  }
  if (type === 'MultiLineString') {
    return polygonCentroid(c[0]);
  }
  if (type === 'Polygon') {
    return polygonCentroid(c);
  }
  if (type === 'MultiPolygon') {
    return polygonCentroid(c[0]);
  }
  return null;
}

function roadviewUrl(lon, lat) {
  const la = Number(lat).toFixed(6);
  const lo = Number(lon).toFixed(6);
  return `https://map.kakao.com/link/roadview/${la},${lo}`;
}

module.exports = {
  toWgs84,
  detectCrsFromPrj,
  geometryCentroid,
  roadviewUrl,
  looksLikeKoreaTm,
  looksLikeLonLat,
};
