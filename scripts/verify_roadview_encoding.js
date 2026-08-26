'use strict';

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const ExcelJS = require('exceljs');
const {
  parseCsvFile,
} = require('../app/utils/roadview_parse_tabular');

const outDir = 'C:/sejong/load/back/uploads';

function writeSampleCsv(srcPath, destPath, encoding) {
  const rows = parseCsvFile(srcPath).slice(0, 2);
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const s = String(r[h] ?? '');
          if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(',')
    ),
  ];
  const text = lines.join('\r\n');
  const buf =
    encoding === 'cp949'
      ? iconv.encode(text, 'cp949')
      : Buffer.from(`\uFEFF${text}`, 'utf8');
  fs.writeFileSync(destPath, buf);
}

async function checkXlsx(p) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(p);
  const s = wb.worksheets[0];
  const h = s.getRow(1).values.slice(1);
  const r = s.getRow(2).values.slice(1);
  const idx = Object.fromEntries(h.map((x, i) => [x, i]));
  return {
    재산명: r[idx['재산명']],
    지번: r[idx['지번']],
    JIBUN: r[idx['JIBUN']],
    로드뷰: String(r[idx['로드뷰']] || '').slice(0, 50),
  };
}

(async () => {
  const utf8Sample = path.join(outDir, 'enc_sample_utf8.csv');
  const cp949Sample = path.join(outDir, 'enc_sample_cp949.csv');
  writeSampleCsv('C:/sejong/load/hyper.csv', utf8Sample, 'utf8');
  writeSampleCsv('C:/sejong/load/hyper.csv', cp949Sample, 'cp949');

  const { execFileSync } = require('child_process');
  const run = (file, out) => {
    execFileSync(
      'curl.exe',
      [
        '-s',
        '-m',
        '120',
        '-o',
        out,
        '-w',
        '%{http_code}',
        '-F',
        `file=@${file}`,
        '-F',
        'format=xlsx',
        'http://182.213.27.207:60040/v1/load/roadview/convert',
      ],
      { encoding: 'utf8' }
    );
  };

  const outUtf8 = path.join(outDir, 'out_utf8.xlsx');
  const outCp949 = path.join(outDir, 'out_cp949.xlsx');
  const code1 = run(utf8Sample, outUtf8);
  const code2 = run(cp949Sample, outCp949);

  const result = {
    http: { utf8: code1, cp949: code2 },
    utf8: await checkXlsx(outUtf8),
    cp949: await checkXlsx(outCp949),
  };
  fs.writeFileSync(
    path.join(outDir, 'out_verify.json'),
    JSON.stringify(result, null, 2),
    'utf8'
  );
  console.log('ok');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
