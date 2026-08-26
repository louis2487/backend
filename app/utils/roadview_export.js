'use strict';

const ExcelJS = require('exceljs');

function escapeCsv(value) {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function collectHeaders(rows) {
  const seen = new Set();
  const headers = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (k.startsWith('__')) continue;
      if (!seen.has(k)) {
        seen.add(k);
        headers.push(k);
      }
    }
  }
  // 로드뷰 컬럼을 뒤로
  const without = headers.filter((h) => h !== '로드뷰' && h !== '로드뷰_상태');
  if (headers.includes('로드뷰')) without.push('로드뷰');
  if (headers.includes('로드뷰_상태')) without.push('로드뷰_상태');
  return without;
}

function toCsvBuffer(rows) {
  const headers = collectHeaders(rows);
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  const text = `\uFEFF${lines.join('\r\n')}`;
  return Buffer.from(text, 'utf8');
}

async function toXlsxBuffer(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('로드뷰');
  const headers = collectHeaders(rows);
  sheet.addRow(headers);
  for (const row of rows) {
    sheet.addRow(headers.map((h) => row[h] ?? ''));
  }
  // PNU 등 긴 숫자는 텍스트로
  const pnuIdx = headers.findIndex((h) => h.toUpperCase() === 'PNU');
  if (pnuIdx >= 0) {
    sheet.getColumn(pnuIdx + 1).numFmt = '@';
  }
  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

module.exports = {
  toCsvBuffer,
  toXlsxBuffer,
  collectHeaders,
};
