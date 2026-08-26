const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');
const { exportChungjuSurveyHwpxMerged } = require('../app/utils/chungju_survey_hwpx');

(async () => {
  const out = path.resolve(__dirname, '../uploads/assets/_verify_pagenum.hwpx');
  await exportChungjuSurveyHwpxMerged(
    [
      { row: { fpop_key: 'A' }, images: [] },
      { row: { fpop_key: 'B' }, images: [] },
    ],
    out
  );
  const z = await JSZip.loadAsync(fs.readFileSync(out));
  for (const n of ['Contents/section0.xml', 'Contents/section1.xml']) {
    const s = await z.file(n).async('string');
    const pn = s.match(/<hp:pageNum[^/]*\/>/);
    const sn = s.match(/<hp:startNum[^/]*\/>/);
    const ft = s.match(/footer="\d+"/);
    console.log(n);
    console.log('  pageNum', pn && pn[0]);
    console.log('  startNum', sn && sn[0]);
    console.log('  footer', ft && ft[0]);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
