const { bindSectionXml, buildLabelValues } = require('../app/utils/chungju_survey_hwpx');
const JSZip = require('jszip');
const fs = require('fs');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const sec = await z.file('Contents/section0.xml').async('string');
  const row = {
    col_a: '4313010200102370003',
    addr: '성남동 237-3',
    fpop_key: '4313010200102370003',
    col_b: '성남동 237-3',
  };
  const bound = bindSectionXml(sec, row);
  const cells = [...bound.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  for (const i of [171, 172, 173, 174]) {
    const inner = cells[i][1];
    const text = [...inner.matchAll(/<hp:t[^>]*>([^<]*)<\/hp:t>/g)]
      .map((m) => m[1])
      .join('|');
    const charPr = [...inner.matchAll(/charPrIDRef="(\d+)"/g)].map((m) => m[1]);
    const paraPr = [...inner.matchAll(/paraPrIDRef="(\d+)"/g)].map((m) => m[1]);
    console.log(`cell ${i}: text=[${text}] charPr=${charPr.join(',')} paraPr=${paraPr.join(',')}`);
  }
})();
