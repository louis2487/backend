const fs = require('fs');
const JSZip = require('jszip');
const { bindSectionXml, exportChungjuSurveyHwpx } = require('../app/utils/chungju_survey_hwpx');
const path = require('path');

(async () => {
  const out = path.join(__dirname, '../uploads/assets/_tdir.hwpx');
  await exportChungjuSurveyHwpx(
    {
      col_a: '4313010200102370003',
      col_b: '성남동 237-3',
      addr: '충주시 성남동 237-3 관아공원 남동쪽 220m 부근',
      col_d: '답',
      col_bh: '공익용도활용 테스트 긴 종합의견입니다',
      fpop_key: '4313010200102370003',
    },
    [],
    out
  );
  const z = await JSZip.loadAsync(fs.readFileSync(out));
  const xml = await z.file('Contents/section0.xml').async('string');
  const dirs = {};
  for (const m of xml.matchAll(/textDirection="([^"]+)"/g)) {
    dirs[m[1]] = (dirs[m[1]] || 0) + 1;
  }
  console.log('bound dirs', dirs);

  // dump a filled value cell fully
  const cells = [...xml.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  for (let i = 0; i < cells.length; i++) {
    const t = [...cells[i][1].matchAll(/<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g)]
      .map((x) => x[1])
      .join('');
    if (t.includes('관아공원') || t === '답' || t.includes('종합의견')) {
      console.log('\n=== cell', i, t.slice(0, 40));
      console.log(cells[i][1].slice(0, 600));
    }
  }
  fs.unlinkSync(out);
})().catch((e) => console.error(e));
