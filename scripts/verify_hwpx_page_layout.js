const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');

function countLineseg(inner) {
  return (inner.match(/<hp:linesegarray>/g) || []).length;
}

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync(path.join(__dirname, '../app/templates/0724.hwpx'))
  );
  const xml = await z.file('Contents/section0.xml').async('string');
  const row = {
    col_a: '4574031034101330010',
    addr: '전라북도 장수군 산서면 보산로 1864-16',
    fpop_key: '4574031034101330010',
    col_b: '성남동 237-3',
    col_d: '답',
    col_be: '주변',
    col_bh: '의견',
    col_ag: 'Y',
    col_aq: 'N',
  };
  const bound = bindSectionXml(xml, row);

  const tplCells = [...xml.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  const bndCells = [...bound.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];

  for (const i of [172, 174]) {
    const t = countLineseg(tplCells[i][1]);
    const b = countLineseg(bndCells[i][1]);
    console.log(`cell ${i} lineseg ${t} -> ${b}`, t === b ? 'OK' : 'FAIL');
  }

  const mg = bndCells[172][1];
  const sj = bndCells[174][1];
  const mgTpl = tplCells[172][1];
  const mgUnchanged =
    !/paraPrIDRef="77"/.test(mg) &&
    (mg.match(/paraPrIDRef="\d+"/g) || []).join() ===
      (mgTpl.match(/paraPrIDRef="\d+"/g) || []).join() &&
    /vertAlign="TOP"/.test(mg);
  const sjVcenter = /vertAlign="CENTER"/.test(sj);
  console.log('manageNo unchanged:', mgUnchanged, mgUnchanged ? 'OK' : 'FAIL');
  console.log('sojaeji vertical center:', sjVcenter, sjVcenter ? 'OK' : 'FAIL');

  const tables = [...bound.matchAll(/<hp:tbl\b[^>]*>[\s\S]*?<\/hp:tbl>/g)];
  const t1 = tables[1];
  const t2 = tables[2];
  const between = bound.slice(t1.index + t1[0].length, t2.index);
  const spacers = (between.match(/paraPrIDRef="77"/g) || []).length;
  const mgPara = bound.slice(Math.max(0, t2.index - 250), t2.index);
  const pageBreak = /pageBreak="1"/.test(mgPara);
  console.log('spacer paragraphs between inv/manage:', spacers, spacers === 0 ? 'OK' : 'FAIL');
  console.log('pageBreak before manage table:', pageBreak, pageBreak ? 'OK' : 'FAIL');

  if (spacers !== 0 || !pageBreak || !mgUnchanged || !sjVcenter) process.exitCode = 1;
})();
