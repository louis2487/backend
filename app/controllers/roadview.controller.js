'use strict';

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const {
  parseCsvFile,
  parseXlsxFile,
  findCoordFields,
} = require('../utils/roadview_parse_tabular');
const {
  readShapefile,
  resolveShpFromUploads,
} = require('../utils/roadview_parse_shp');
const {
  toWgs84,
  roadviewUrl,
  looksLikeKoreaTm,
} = require('../utils/roadview_coords');
const {
  geocodeAddress,
  buildAddressFromRow,
  getApiKey,
} = require('../utils/roadview_kakao');
const { toCsvBuffer, toXlsxBuffer } = require('../utils/roadview_export');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extOf(name) {
  const i = String(name).lastIndexOf('.');
  return i >= 0 ? String(name).slice(i + 1).toLowerCase() : '';
}

function cleanupFiles(files) {
  const list = [];
  if (!files) return;
  if (files.file) list.push(...files.file);
  if (files.files) list.push(...files.files);
  for (const f of list) {
    try {
      if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
    } catch (_) {}
  }
}

async function extractZipToDir(zipPath, destDir) {
  const buf = fs.readFileSync(zipPath);
  const zip = await JSZip.loadAsync(buf);
  fs.mkdirSync(destDir, { recursive: true });
  const written = [];
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const base = path.basename(name);
    if (!base || base.startsWith('.')) continue;
    const out = path.join(destDir, base);
    const content = await entry.async('nodebuffer');
    fs.writeFileSync(out, content);
    written.push(out);
  }
  return written;
}

function stageShpSet(files, workDir) {
  fs.mkdirSync(workDir, { recursive: true });
  const list = [];
  if (files.file) list.push(...files.file);
  if (files.files) list.push(...files.files);

  let shpStem = null;
  for (const f of list) {
    const orig = f.originalname || f.filename;
    const ext = extOf(orig);
    const stem = path.basename(orig, path.extname(orig));
    if (ext === 'shp') shpStem = stem;
  }
  if (!shpStem) return null;

  for (const f of list) {
    const orig = f.originalname || f.filename;
    const ext = extOf(orig);
    if (!['shp', 'dbf', 'shx', 'prj', 'cpg', 'sbn', 'sbx'].includes(ext)) continue;
    const dest = path.join(workDir, `${shpStem}.${ext}`);
    fs.copyFileSync(f.path, dest);
  }
  const shpPath = path.join(workDir, `${shpStem}.shp`);
  if (!fs.existsSync(shpPath)) return null;
  return shpPath;
}

async function enrichRows(rows) {
  const sample = rows[0] || {};
  const coordFields = findCoordFields(sample);
  let geocodeCount = 0;
  const maxGeocode = 5000;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let lon = row.__lon;
    let lat = row.__lat;
    delete row.__lon;
    delete row.__lat;

    if ((lon == null || lat == null) && coordFields) {
      const x = row[coordFields.xKey];
      const y = row[coordFields.yKey];
      const crs = looksLikeKoreaTm(Number(x), Number(y)) ? 'EPSG:5186' : 'EPSG:4326';
      const wgs = toWgs84(x, y, crs);
      if (wgs) {
        lon = wgs.lon;
        lat = wgs.lat;
      }
    }

    if ((lon == null || lat == null) && geocodeCount < maxGeocode) {
      const addr = buildAddressFromRow(row);
      if (addr) {
        geocodeCount++;
        const wgs = await geocodeAddress(addr);
        if (wgs) {
          lon = wgs.lon;
          lat = wgs.lat;
        } else {
          row['로드뷰'] = '';
          row['로드뷰_상태'] = '주소검색실패';
          continue;
        }
        if (geocodeCount % 20 === 0) await sleep(50);
      }
    }

    if (
      lon != null &&
      lat != null &&
      Number.isFinite(Number(lon)) &&
      Number.isFinite(Number(lat))
    ) {
      row['로드뷰'] = roadviewUrl(lon, lat);
      row['로드뷰_상태'] = 'ok';
    } else {
      row['로드뷰'] = '';
      row['로드뷰_상태'] = row['로드뷰_상태'] || '좌표없음';
    }
  }

  return { rows, geocodeCount };
}

exports.convert = async (req, res) => {
  const workDirs = [];
  try {
    const format = String(req.body.format || req.query.format || 'xlsx').toLowerCase();
    const outFmt = format === 'csv' ? 'csv' : 'xlsx';

    if (!getApiKey()) {
      console.warn('KAKAO_REST_API_KEY 미설정 — 주소검색 비활성, 좌표만 사용');
    }

    const files = req.files || {};
    const single = (files.file && files.file[0]) || null;
    const multi = files.files || [];

    if (!single && multi.length === 0) {
      return res.status(400).send({
        msg: '업로드 파일이 없습니다. file 또는 files[]를 전송하세요.',
      });
    }

    let rows = [];
    let sourceName = 'result';

    if (single && extOf(single.originalname) === 'zip') {
      const dir = path.join(path.dirname(single.path), `unzip_${Date.now()}`);
      workDirs.push(dir);
      const extracted = await extractZipToDir(single.path, dir);
      const shp = extracted.find((p) => /\.shp$/i.test(p));
      const csv = extracted.find((p) => /\.csv$/i.test(p));
      const xlsx = extracted.find((p) => /\.xlsx?$/i.test(p));
      if (shp) {
        rows = await readShapefile(shp);
        sourceName = path.basename(shp, '.shp');
      } else if (csv) {
        rows = parseCsvFile(csv);
        sourceName = path.basename(csv, path.extname(csv));
      } else if (xlsx) {
        rows = parseXlsxFile(xlsx);
        sourceName = path.basename(xlsx, path.extname(xlsx));
      } else {
        return res.status(400).send({ msg: 'ZIP 안에 shp/csv/xlsx가 없습니다.' });
      }
    } else if (
      resolveShpFromUploads(files) ||
      (single && extOf(single.originalname) === 'shp') ||
      multi.some((f) => extOf(f.originalname) === 'shp')
    ) {
      const dir = path.join(
        path.dirname((single || multi[0]).path),
        `shp_${Date.now()}`
      );
      workDirs.push(dir);
      const shpPath = stageShpSet(files, dir);
      if (!shpPath) {
        return res.status(400).send({
          msg: 'SHP 세트가 불완전합니다. .shp/.dbf/.shx (및 .prj)를 함께 업로드하세요.',
        });
      }
      rows = await readShapefile(shpPath);
      sourceName = path.basename(shpPath, '.shp');
    } else if (single && extOf(single.originalname) === 'csv') {
      rows = parseCsvFile(single.path);
      sourceName = path.basename(single.originalname, path.extname(single.originalname));
    } else if (single && ['xlsx', 'xls'].includes(extOf(single.originalname))) {
      rows = parseXlsxFile(single.path);
      sourceName = path.basename(single.originalname, path.extname(single.originalname));
    } else {
      return res.status(400).send({
        msg: '지원 형식: .csv, .xlsx, .shp(+dbf/shx/prj), .zip',
      });
    }

    if (!rows.length) {
      return res.status(400).send({ msg: '데이터 행이 없습니다.' });
    }

    const enriched = await enrichRows(rows);
    rows = enriched.rows;

    const buf = outFmt === 'csv' ? toCsvBuffer(rows) : await toXlsxBuffer(rows);
    const outName = `${sourceName}_로드뷰.${outFmt === 'csv' ? 'csv' : 'xlsx'}`;
    const encoded = encodeURIComponent(outName);

    // 전역 Content-Type: application/json 미들웨어 덮어쓰기
    try {
      res.removeHeader('Content-Type');
    } catch (_) {}
    res.setHeader(
      'Content-Type',
      outFmt === 'csv'
        ? 'text/csv; charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${outName.replace(/[^\w.\-]/g, '_')}"; filename*=UTF-8''${encoded}`
    );
    res.setHeader('X-Roadview-Rows', String(rows.length));
    res.setHeader('X-Roadview-Geocode', String(enriched.geocodeCount));
    return res.status(200).send(buf);
  } catch (err) {
    console.error('roadview convert error:', err);
    return res.status(500).send({
      msg: err.message || '변환 중 오류가 발생했습니다.',
    });
  } finally {
    cleanupFiles(req.files);
    for (const dir of workDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) {}
    }
  }
};
