/**
 * HWPX 바인딩·재압축 스모크 테스트 (DB 없이 템플릿만)
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { exportChungjuSurveyHwpx } = require('../app/utils/chungju_survey_hwpx');

async function main() {
  const out = path.resolve(__dirname, '../uploads/assets/_verify_hwpx.hwpx');
  const row = {
    fpop_key: 'VERIFY001',
    col_a: 'VERIFY001',
    col_b: '검증동 9-9',
    addr: '충주시 검증동 9-9',
    col_d: '답',
    col_e: '12.5',
    col_f: '검증로',
    col_ac: '도로',
    col_g: '12.5',
    col_h: '제1종일반주거지역',
    col_k: '주거지대',
    col_l: '소로한면',
    col_m: '평지',
    col_n: '정방형',
    col_q: '2024-01-01',
    col_r: '1,000,000',
    col_s: '500,000',
    col_t: '480,000',
    col_u: '일반재산',
    col_v: '일반회계',
    col_w: '회계과',
    col_x: '',
    col_y: '',
    col_z: '99999',
    col_aa: '1/1',
    col_ab: '0',
    col_o: '2000-01-01',
    col_p: '매입',
    col_ad: '2000-01-01',
    col_j: '회계과',
    col_i: '매입',
    col_c: '100,000',
    col_ae: '제1종일반주거지역',
    col_af: '',
    col_ag: 'N',
    col_ap: '',
    col_aq: 'N',
    col_ar: '',
    col_ah: 'Y',
    col_ai: '홍길동',
    col_ax: '주차장',
    col_at: '10',
    col_al: '2020-01-01',
    col_am: '2020-12-31',
    col_an: '1000',
    col_au: '없음',
    col_av: '무단',
    col_aw: '김철수',
    col_az: '경작',
    col_ba: '5',
    col_ay: '2023-01-01',
    col_bb: '2023-12-31',
    col_bc: '500',
    col_bd: '하우스',
    col_be: '주변혼합',
    col_bf: '활용검토',
    col_bg: '특이없음',
    col_bh: '종합의견테스트',
  };

  await exportChungjuSurveyHwpx(row, [], out);
  const z = await JSZip.loadAsync(fs.readFileSync(out));
  const names = Object.keys(z.files);
  if (names[0] !== 'mimetype' && !names.includes('mimetype')) {
    throw new Error('mimetype missing');
  }
  const mime = await z.file('mimetype').async('string');
  const xml = await z.file('Contents/section0.xml').async('string');
  const img1 = await z.file('BinData/image1.jpeg').async('nodebuffer');
  const checks = [
    ['mime', mime.includes('hwp')],
    ['관리번호', xml.includes('VERIFY001')],
    ['지번', xml.includes('검증동')],
    ['종합의견', xml.includes('종합의견테스트')],
    ['대부사용자', xml.includes('홍길동')],
    ['사용종료일', xml.includes('2020-12-31')],
    ['대부료', xml.includes('1000')],
    ['점유종료일', xml.includes('2023-12-31')],
    ['변상금', xml.includes('500')],
    ['image1', !!z.file('BinData/image1.jpeg')],
    // 사진 없으면 빈칸 JPEG(소용량) — 템플릿 샘플(~90KB+)이 아니어야 함
    ['빈칸사진', img1.length < 2048],
  ];
  for (const [name, ok] of checks) {
    console.log(name, ok ? 'OK' : 'FAIL');
    if (!ok) process.exitCode = 1;
  }
  fs.unlinkSync(out);
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
