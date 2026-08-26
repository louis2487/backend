const fs = require('fs');
const JSZip = require('jszip');
const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const xml = await z.file('Contents/section0.xml').async('string');
  const dirs = [...xml.matchAll(/textDirection="([^"]+)"/g)].map((m) => m[1]);
  const uniq = {};
  for (const d of dirs) uniq[d] = (uniq[d] || 0) + 1;
  console.log('template textDirection', uniq);

  // sample first value cell subList
  const cells = [...xml.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  for (const i of [2, 8, 154]) {
    const m = cells[i][1].match(/textDirection="([^"]+)"/);
    const p = cells[i][1].match(/<hp:p\b[^>]*>/);
    console.log('cell', i, 'dir', m && m[1], 'p', p && p[0].slice(0, 120));
  }

  // check if charPr has vert
  const header = await z.file('Contents/header.xml').async('string');
  const vert = [...header.matchAll(/vert[^=]*="([^"]+)"/g)].slice(0, 20);
  console.log(
    'header vert attrs',
    [...new Set(vert.map((v) => v[0]))].slice(0, 30)
  );
})().catch((e) => console.error(e));
