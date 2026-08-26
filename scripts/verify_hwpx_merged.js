/**
 * HWPX 합본 스모크 — 템플릿 2건 합쳐 section/image 매핑 검증
 */
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');
const {
  exportChungjuSurveyHwpxMerged,
} = require('../app/utils/chungju_survey_hwpx');

async function main() {
  const row = {
    fpop_key: 'TEST001',
    col_a: '테스트',
  };
  const out = path.resolve(__dirname, '../uploads/assets/_verify_hwpx_merged.hwpx');
  await exportChungjuSurveyHwpxMerged(
    [
      { row: { ...row, fpop_key: 'A' }, images: [] },
      { row: { ...row, fpop_key: 'B' }, images: [] },
    ],
    out
  );

  const z = await JSZip.loadAsync(fs.readFileSync(out));
  const names = Object.keys(z.files).filter((n) => !z.files[n].dir).sort();
  console.log('files', names.filter((n) => /section|image|content\.hpf/.test(n)));
  const hpf = await z.file('Contents/content.hpf').async('string');
  console.log('has section0', hpf.includes('section0'));
  console.log('has section1', hpf.includes('section1'));
  const hdr = await z.file('Contents/header.xml').async('string');
  const secCnt = (hdr.match(/secCnt="(\d+)"/) || [])[1];
  console.log('secCnt', secCnt, secCnt === '2' ? 'OK' : 'FAIL');
  if (secCnt !== '2') process.exitCode = 1;
  console.log('has image8', hpf.includes('image8'));
  const s1 = await z.file('Contents/section1.xml').async('string');
  console.log('section1 refs image5', s1.includes('binaryItemIDRef="image5"'));
  console.log('section1 still image1?', /binaryItemIDRef="image1"/.test(s1));
  console.log('ok', out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
