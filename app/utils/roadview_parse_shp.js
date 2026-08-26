'use strict';

const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');
const {
  detectCrsFromPrj,
  geometryCentroid,
  toWgs84,
} = require('./roadview_coords');

function hangulScore(rows) {
  let n = 0;
  const limit = Math.min(rows.length, 30);
  for (let i = 0; i < limit; i++) {
    for (const v of Object.values(rows[i])) {
      const s = String(v ?? '');
      for (let j = 0; j < s.length; j++) {
        const c = s.charCodeAt(j);
        if (c >= 0xac00 && c <= 0xd7a3) n++;
      }
    }
  }
  return n;
}

async function readShapefileWithEncoding(shpPath, dbfPath, encoding) {
  const source = await shapefile.open(shpPath, dbfPath, { encoding });
  const rows = [];
  while (true) {
    const result = await source.read();
    if (result.done) break;
    const feature = result.value;
    const props = feature.properties || {};
    const row = {};
    for (const [k, v] of Object.entries(props)) {
      row[String(k).trim()] = v == null ? '' : v;
    }
    row.__geometry = feature.geometry;
    rows.push(row);
  }
  return rows;
}

async function readShapefile(shpPath) {
  const base = shpPath.replace(/\.shp$/i, '');
  const dbfPath = `${base}.dbf`;
  const prjPath = `${base}.prj`;

  if (!fs.existsSync(shpPath)) {
    throw new Error(`SHP 파일이 없습니다: ${shpPath}`);
  }
  if (!fs.existsSync(dbfPath)) {
    throw new Error(`DBF 파일이 필요합니다: ${path.basename(dbfPath)}`);
  }

  let crs = 'EPSG:5186';
  if (fs.existsSync(prjPath)) {
    crs = detectCrsFromPrj(fs.readFileSync(prjPath, 'utf8'));
  }

  // 국내 SHP DBF는 보통 CP949/EUC-KR
  let rows;
  try {
    const euc = await readShapefileWithEncoding(shpPath, dbfPath, 'euc-kr');
    const utf = await readShapefileWithEncoding(shpPath, dbfPath, 'utf-8');
    rows = hangulScore(euc) >= hangulScore(utf) ? euc : utf;
  } catch (_) {
    rows = await readShapefileWithEncoding(shpPath, dbfPath, 'utf-8');
  }

  for (const row of rows) {
    const geometry = row.__geometry;
    delete row.__geometry;
    const c = geometryCentroid(geometry);
    if (c) {
      const wgs = toWgs84(c.x, c.y, crs);
      if (wgs) {
        row.__lon = wgs.lon;
        row.__lat = wgs.lat;
      }
    }
  }

  return rows;
}

function resolveShpFromUploads(files) {
  const list = [];
  if (files.file) list.push(...files.file);
  if (files.files) list.push(...files.files);

  const shp = list.find((f) => /\.shp$/i.test(f.originalname || f.filename));
  if (!shp) return null;
  return { shp, all: list };
}

module.exports = {
  readShapefile,
  resolveShpFromUploads,
};
