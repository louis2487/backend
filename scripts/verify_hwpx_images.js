/**
 * HWPX 이미지 임베딩 스모크 — 로컬 JPEG/PNG 넣어 한글 패키지 검증
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { exportChungjuSurveyHwpx } = require('../app/utils/chungju_survey_hwpx');

async function main() {
  const assets = path.resolve(__dirname, '../uploads/assets');
  if (!fs.existsSync(assets)) fs.mkdirSync(assets, { recursive: true });

  // 템플릿 내 작은 jpeg를 샘플로 복사해 업로드 폴더에 둔다
  const tpl = path.resolve(__dirname, '../app/templates/chungju_land_survey_template.hwpx');
  const z = await JSZip.loadAsync(fs.readFileSync(tpl));
  // 실제 JPEG 매직으로 교체한 최소 JPEG (BLANK와 동일하지 않게 템플릿 것 사용 — 384B)
  const sampleJpeg = await z.file('BinData/image1.jpeg').async('nodebuffer');

  const imgDir = path.resolve(__dirname, '../uploads/img/_verify');
  fs.mkdirSync(imgDir, { recursive: true });
  const jpegName = 'verify_slot0.jpg';
  const jpegPath = path.join(imgDir, jpegName);
  fs.writeFileSync(jpegPath, sampleJpeg);

  // 최소 PNG (1x1)
  const pngName = 'verify_slot1.png';
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(path.join(imgDir, pngName), pngBytes);

  const out = path.join(assets, '_verify_hwpx_imgs.hwpx');
  await exportChungjuSurveyHwpx(
    { fpop_key: 'VERIFY_IMG', col_a: 'VERIFY_IMG', addr: '테스트', col_b: '테스트' },
    [
      { img_path: 'uploads/img/_verify', img_name: jpegName },
      { img_path: 'uploads/img/_verify', img_name: pngName },
    ],
    out
  );

  const outZ = await JSZip.loadAsync(fs.readFileSync(out));
  const i1 = await outZ.file('BinData/image1.jpeg').async('nodebuffer');
  const i2 = outZ.file('BinData/image2.png') || outZ.file('BinData/image2.jpeg');
  const i2b = await i2.async('nodebuffer');
  const hpf = await outZ.file('Contents/content.hpf').async('string');

  const checks = [
    ['image1.jpeg size', i1.length === sampleJpeg.length],
    ['image2 exists', !!i2],
    ['image2 png bytes', i2b.length === pngBytes.length],
    ['hpf image2 png', /image2\.png/.test(hpf) || /image2\.jpeg/.test(hpf)],
    ['조사일자 no time', !(await outZ.file('Contents/section0.xml').async('string')).match(/\d{2}:\d{2}:\d{2}/)],
  ];
  for (const [n, ok] of checks) {
    console.log(n, ok ? 'OK' : 'FAIL');
    if (!ok) process.exitCode = 1;
  }
  console.log('out', out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
