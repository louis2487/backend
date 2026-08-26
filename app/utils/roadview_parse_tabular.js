'use strict';

const fs = require('fs');
const iconv = require('iconv-lite');
const XLSX = require('xlsx');

const HANGUL_RE = /[가-힣]/;
const MARKER_RE = /PNU|재산|토지|지번|공부|과천|순번|로드뷰/;

function hangulScore(text) {
  if (!text) return 0;
  const sample = text.slice(0, 8000);
  let n = 0;
  for (let i = 0; i < sample.length; i++) {
    if (sample.charCodeAt(i) >= 0xac00 && sample.charCodeAt(i) <= 0xd7a3) n++;
  }
  return n;
}

/**
 * UTF-8 / CP949 자동 판별 (Excel 한글 CSV는 보통 CP949)
 */
function decodeCsvBuffer(buf) {
  if (!buf || !buf.length) return '';

  // UTF-8 BOM
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.slice(3).toString('utf8');
  }

  const asUtf8 = buf.toString('utf8');
  const asCp949 = iconv.decode(buf, 'cp949');

  const utf8Bad = asUtf8.includes('\uFFFD');
  const cp949Bad = asCp949.includes('\uFFFD');
  const utf8Hangul = hangulScore(asUtf8);
  const cp949Hangul = hangulScore(asCp949);
  const utf8Mark = MARKER_RE.test(asUtf8);
  const cp949Mark = MARKER_RE.test(asCp949);

  // 명확한 승자
  if (!cp949Bad && cp949Hangul > utf8Hangul + 5) return asCp949;
  if (!utf8Bad && utf8Hangul > cp949Hangul + 5) return asUtf8.replace(/^\uFEFF/, '');

  if (!cp949Bad && cp949Mark && cp949Hangul >= utf8Hangul) return asCp949;
  if (!utf8Bad && utf8Mark) return asUtf8.replace(/^\uFEFF/, '');

  // 기본: 한글이 더 많은 쪽
  if (cp949Hangul >= utf8Hangul) return asCp949;
  return asUtf8.replace(/^\uFEFF/, '');
}

/** multer/latin1 등으로 깨진 문자열 복원 */
function maybeFixMojibake(s) {
  const str = String(s ?? '');
  if (!str || HANGUL_RE.test(str)) return str;
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8');
    if (HANGUL_RE.test(fixed)) return fixed;
  } catch (_) {}
  return str;
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsvText(text) {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map((h) => maybeFixMojibake(h).trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 1 && cols[0].trim() === '') continue;
    const row = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c] || `col_${c}`;
      row[key] = maybeFixMojibake(cols[c] != null ? cols[c] : '');
    }
    rows.push(normalizeRow(row));
  }
  return rows;
}

function parseCsvFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return parseCsvText(decodeCsvBuffer(buf));
}

function parseXlsxFile(filePath) {
  const wb = XLSX.readFile(filePath, { cellDates: false, raw: false, codepage: 65001 });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  return rows.map((r) => normalizeRow(r));
}

function normalizeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = maybeFixMojibake(String(k).trim());
    if (v == null) {
      out[key] = '';
    } else if (typeof v === 'number') {
      out[key] = Number.isInteger(v) && Math.abs(v) >= 1e14 ? String(v) : v;
    } else {
      out[key] = maybeFixMojibake(String(v));
    }
  }
  return out;
}

function findCoordFields(row) {
  const keys = Object.keys(row);
  const lower = Object.fromEntries(keys.map((k) => [k.toLowerCase(), k]));

  const lonKey =
    lower.lon ||
    lower.lng ||
    lower.longitude ||
    lower['경도'] ||
    lower.x ||
    lower['x좌표'] ||
    lower['좌표x'];
  const latKey =
    lower.lat ||
    lower.latitude ||
    lower['위도'] ||
    lower.y ||
    lower['y좌표'] ||
    lower['좌표y'];

  if (lonKey && latKey) {
    return { xKey: lonKey, yKey: latKey };
  }
  return null;
}

module.exports = {
  parseCsvFile,
  parseXlsxFile,
  findCoordFields,
  normalizeRow,
  decodeCsvBuffer,
  parseCsvText,
};
