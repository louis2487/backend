/**
 * 짧은 값=개별공시지가(char7/para32), 긴 값=위치(char6/para97) 스타일 검증
 */
const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');
const fs = require('fs');
const JSZip = require('jszip');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const xml = await z.file('Contents/section0.xml').async('string');
  const bound = bindSectionXml(xml, {
    col_a: 'SHORT1',
    col_b: '검증동9-9',
    addr: '충주시 아주아주아주긴주소문자열입니다 좌측정렬되어야합니다',
    col_d: '답',
    col_s: '159900',
    col_f: '전라북도 장수군 산서면 보산로 1864-16',
    col_bh: '이것은종합의견으로충분히길어서좌측에붙어있어야하는긴문장입니다',
    fpop_key: 'SHORT1',
  });

  function cellText(inner) {
    return [...inner.matchAll(/<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g)]
      .map((m) => m[1])
      .join('');
  }

  const cells = [...bound.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)].map(
    (m) => m[1]
  );
  const byLabel = (label) => {
    const idx = cells.findIndex((inner) => cellText(inner).replace(/\s+/g, '') === label);
    return idx >= 0 ? cells[idx + 1] : null;
  };

  const checks = [
    ['개별공시지가', '159900', '7', '32'],
    ['도로명', '전라북도 장수군 산서면 보산로 1864-16', '6', '97'],
    ['위치', '충주시 아주아주아주긴주소문자열입니다 좌측정렬되어야합니다', '6', '97'],
    ['지번', '검증동9-9', '7', '32'],
    ['공부지목', '답', '7', '32'],
  ];

  let fail = 0;
  for (const [label, wantText, wantChar, wantPara] of checks) {
    const inner = byLabel(label);
    if (!inner) {
      console.log('FAIL', label, 'cell missing');
      fail++;
      continue;
    }
    const text = cellText(inner);
    const char = (inner.match(/charPrIDRef="(\d+)"/) || [])[1];
    const para = (inner.match(/paraPrIDRef="(\d+)"/) || [])[1];
    const ok = text === wantText && char === wantChar && para === wantPara;
    console.log(ok ? 'OK' : 'FAIL', label, { text: text.slice(0, 28), char, para });
    if (!ok) fail++;
  }
  if (fail) process.exitCode = 1;
  else console.log('done');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
