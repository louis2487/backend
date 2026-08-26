const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');

async function main() {
  const tpl = path.resolve(__dirname, '../app/templates/chungju_land_survey_template.hwpx');
  const z = await JSZip.loadAsync(fs.readFileSync(tpl));
  const xml = await z.file('Contents/section0.xml').async('string');
  const cells = [];
  const re = /<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g;
  let m;
  while ((m = re.exec(xml))) {
    const parts = [];
    const tre = /<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g;
    let t;
    while ((t = tre.exec(m[1]))) parts.push(t[1]);
    cells.push(parts.join('').replace(/\s+/g, '').trim());
  }
  console.log('cells', cells.length);
  console.log('지번 next', cells[1], '->', JSON.stringify(cells[2]));
  console.log('관리번호 next', cells[171], '->', JSON.stringify(cells[172]));
  console.log('has 성남동', xml.includes('성남동'));
  console.log('has 1344900 sample', xml.includes('1,344,900'));

  const bound = bindSectionXml(xml, {
    col_a: 'TESTKEY001',
    col_b: '테스트동 1-1',
    addr: '충주시 테스트동 1-1',
    col_d: '대',
    col_e: '100',
    fpop_key: 'TESTKEY001',
  });
  console.log('bound has TESTKEY001', bound.includes('TESTKEY001'));
  console.log('bound has 테스트동', bound.includes('테스트동'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
