const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');
const fs = require('fs');
const JSZip = require('jszip');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const xml = await z.file('Contents/section0.xml').async('string');
  const b = bindSectionXml(xml, {
    col_d: '답',
    col_b: '가로확인',
    fpop_key: 'A',
    col_a: 'A',
  });
  const cells = [...b.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  for (let i = 0; i < cells.length; i++) {
    const t = [...cells[i][1].matchAll(/<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g)]
      .map((m) => m[1])
      .join('');
    if (t === '답' || t === '가로확인') {
      const dir = (cells[i][1].match(/textDirection="([^"]+)"/) || [])[1];
      console.log({
        t,
        dir,
        hasLineseg: cells[i][1].includes('linesegarray'),
      });
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
