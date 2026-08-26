const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { bindSectionXml } = require('../app/utils/chungju_survey_hwpx');

function cellText(inner) {
  return [...inner.matchAll(/<hp:t[^>]*>([^<]*)<\/hp:t>/g)]
    .map((m) => m[1])
    .join('')
    .replace(/\s+/g, '');
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
    col_e: '1234.5',
    col_be: '주변현황 테스트',
    col_bh: '종합의견',
    col_ag: 'Y',
    col_aq: 'N',
    col_ah: 'Y',
    col_ai: '홍길동',
  };
  const bound = bindSectionXml(xml, row);
  const cells = [...bound.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];

  let fail = 0;
  const samples = ['지번', '공부지목', '관리번호', '소재지', '종합의견', '사용자명'];
  for (let i = 0; i < cells.length - 1; i++) {
    const label = cellText(cells[i][1]);
    const valueInner = cells[i + 1][1];
    if (!label || cells[i + 1][1].includes('<hp:pic')) continue;
    if (!Object.values(row).some((v) => String(v || '').replace(/\s+/g, '') === cellText(valueInner))) {
      continue;
    }
    if (label.includes('관리번호')) continue;
    const hasCenter = /vertAlign="CENTER"/.test(valueInner);
    const hasTop = /vertAlign="TOP"/.test(valueInner);
    if (!hasCenter || hasTop) {
      if (samples.some((s) => label.includes(s.replace(/\s+/g, '')))) {
        console.log('FAIL', label, { hasCenter, hasTop });
      }
      fail++;
    }
  }

  // 값 칸 샘플: 지번(2), 공부지목(4), 소재지(174)
  for (const i of [2, 4, 174]) {
    const ok =
      /vertAlign="CENTER"/.test(cells[i][1]) && !/vertAlign="TOP"/.test(cells[i][1]);
    console.log(`value cell ${i} vcenter:`, ok ? 'OK' : 'FAIL');
    if (!ok) fail++;
  }

  // 관리번호(172)는 템플릿 TOP 유지
  const mgTop = /vertAlign="TOP"/.test(cells[172][1]) && !/vertAlign="CENTER"/.test(cells[172][1]);
  console.log('manageNo cell 172 top:', mgTop ? 'OK' : 'FAIL');
  if (!mgTop) fail++;

  // 라벨 칸은 TOP 유지
  for (const i of [1, 3, 171, 173]) {
    const ok = /vertAlign="TOP"/.test(cells[i][1]);
    console.log(`label cell ${i} top:`, ok ? 'OK' : 'FAIL');
    if (!ok) fail++;
  }

  if (fail) process.exitCode = 1;
  else console.log('all checked value cells vertically centered');
})();
