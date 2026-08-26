/**
 * 0724.hwpx 샘플 값을 비우고 templates/0724.hwpx · chungju_land_survey_template.hwpx 생성
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, '0724.hwpx');
const OUT_DIR = path.resolve(__dirname, '../app/templates');
const OUT = path.join(OUT_DIR, '0724.hwpx');
const OUT_LEGACY = path.join(OUT_DIR, 'chungju_land_survey_template.hwpx');

/** 라벨(정규화) → 바로 다음 셀이 값인 경우 */
const LABEL_WITH_VALUE = new Set(
  [
    '지번',
    '공부지목',
    '공부면적(㎡)',
    '도로명',
    '현황지목',
    '실면적(㎡)',
    '용도지역',
    '토지이용상황',
    '도로접면',
    '지형높이',
    '지형형상',
    '기준년도',
    '재산기준가격',
    '개별공시지가',
    '표준지공시지가',
    '재산구분',
    '회계구분',
    '재산관리관',
    '분업관리관',
    '분임관리관',
    '위임관리관',
    '재산번호',
    '공유지분',
    '공유인수',
    '소유권변동일자',
    '소유권변동원인',
    '취득일자',
    '취득부서',
    '취득방법',
    '취득가액',
    '취득사유',
    '취득면적',
    '국토계획법상',
    '기타법령상',
    '토지이용규제기본법시행령제9조제4항각호',
    '도시계획사업',
    '개발사업',
    '대부여부',
    '피대부자수',
    '무단점유여부',
    '무단점유자수',
    '위치',
    '주변현황',
    '활용방안',
    '특기사항',
    '특이사항',
    '종합의견',
    '조사자',
    '조사일자',
    '확인자',
    '확인일자',
    '관리번호',
    '소재지',
  ].map(normalize)
);

function normalize(s) {
  return String(s || '')
    .replace(/\s+/g, '')
    .trim();
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellText(inner) {
  const parts = [];
  const re = /<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g;
  let m;
  while ((m = re.exec(inner))) parts.push(m[1]);
  return normalize(parts.join(''));
}

function setCellText(inner, text) {
  const escaped = escapeXml(text == null ? '' : String(text));
  let found = false;
  let result = inner.replace(
    /<hp:t(\s[^>]*)?>([^<]*)<\/hp:t>|<hp:t\s*\/>/g,
    (match, attrs) => {
      if (!found) {
        found = true;
        const a = attrs || '';
        return `<hp:t${a}>${escaped}</hp:t>`;
      }
      if (match.endsWith('/>')) return '<hp:t/>';
      return `<hp:t${attrs || ''}></hp:t>`;
    }
  );
  if (!found) {
    if (/<hp:run([^>]*)\/>/.test(result)) {
      result = result.replace(
        /<hp:run([^>]*)\/>/,
        `<hp:run$1><hp:t>${escaped}</hp:t></hp:run>`
      );
    } else if (/<hp:run([^>]*)>/.test(result)) {
      result = result.replace(
        /<hp:run([^>]*)>/,
        `<hp:run$1><hp:t>${escaped}</hp:t>`
      );
    }
  }
  return result;
}

function clearSectionValues(xml) {
  const parts = [];
  const re = /<hp:tc(\b[^>]*)>([\s\S]*?)<\/hp:tc>/g;
  let last = 0;
  let m;
  const cells = [];
  while ((m = re.exec(xml))) {
    cells.push({
      fullStart: m.index,
      fullEnd: m.index + m[0].length,
      attrs: m[1],
      inner: m[2],
      text: cellText(m[2]),
      hasPic: m[2].includes('<hp:pic'),
    });
  }

  const clearIdx = new Set();
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (c.hasPic) continue;
    if (LABEL_WITH_VALUE.has(c.text) && i + 1 < cells.length && !cells[i + 1].hasPic) {
      clearIdx.add(i + 1);
    }
  }
  // 대부/무단 표 데이터 행(헤더 다음 빈 칸들) — 이미 비어 있어도 유지
  // 관리번호/소재지 값 포함됨

  let out = '';
  let cursor = 0;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    out += xml.slice(cursor, c.fullStart);
    let inner = c.inner;
    if (clearIdx.has(i) && !c.hasPic) {
      inner = setCellText(inner, '');
    }
    out += `<hp:tc${c.attrs}>${inner}</hp:tc>`;
    cursor = c.fullEnd;
  }
  out += xml.slice(cursor);
  return { xml: out, cleared: clearIdx.size };
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error('missing ' + SRC);
  const buf = fs.readFileSync(SRC);
  const zip = await JSZip.loadAsync(buf);
  const sectionPath = 'Contents/section0.xml';
  const sectionFile = zip.file(sectionPath);
  if (!sectionFile) throw new Error('no ' + sectionPath);

  const sectionXml = await sectionFile.async('string');
  const { xml: cleared, cleared: n } = clearSectionValues(sectionXml);
  zip.file(sectionPath, cleared);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 샘플 현장사진 → 빈칸(흰색) JPEG로 교체 (2페이지 기본값)
  const BLANK_JPEG = Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z',
    'base64'
  );
  const imageSlots = ['BinData/image1.jpeg', 'BinData/image2.jpeg', 'BinData/image3.jpeg', 'BinData/image4.jpeg'];
  for (const slot of imageSlots) {
    if (zip.file(slot)) zip.file(slot, BLANK_JPEG);
  }

  const outBuf = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Ensure mimetype is STORE (uncompressed). JSZip may compress all; rebuild properly.
  const outZip = new JSZip();
  const mime = await zip.file('mimetype').async('string');
  outZip.file('mimetype', mime, { compression: 'STORE' });

  const names = Object.keys(zip.files).filter((n) => n !== 'mimetype' && !zip.files[n].dir);
  for (const name of names) {
    const data = await zip.file(name).async('nodebuffer');
    outZip.file(name, data, { compression: 'DEFLATE' });
  }

  const finalBuf = await outZip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // force mimetype first uncompressed via generate with platform options
  // jszip puts files in insertion order when using generateAsync
  fs.writeFileSync(OUT, finalBuf);
  fs.writeFileSync(OUT_LEGACY, finalBuf);
  console.log('wrote', OUT, 'and', OUT_LEGACY, 'cleared cells=', n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
