const { exportChungjuSurveyPdf } = require('../app/utils/chungju_survey_pdf');
const fs = require('fs');
const path = require('path');

const sample = {
  fpop_key: 'VERIFY_FPOP',
  col_a: '4313010200102370003',
  col_b: '성남동 237-3',
  addr: '성남동 237-3',
  col_c: '819000',
  col_d: '답',
  col_e: '3.0',
  col_f: '',
  col_g: '3.0',
  col_h: '제2종일반주거지역',
  col_i: '매입',
  col_j: '',
  col_k: '도로등',
  col_l: '중로한면',
  col_m: '평지',
  col_n: '사다리형',
  col_o: '1989-07-03',
  col_p: '소유권이전',
  col_q: '2022-01-01',
  col_r: '1344900',
  col_s: '448300',
  col_t: '',
  col_u: '일반재산',
  col_v: '일반회계',
  col_w: '안전행정국 회계과',
  col_x: '',
  col_y: '',
  col_z: '25660',
  col_aa: '1/1',
  col_ab: '0',
  col_ac: '도로',
  col_ad: '1989-07-03',
  col_ae: '제2종일반주거지역',
  col_af: '가축사육제한구역',
  col_ag: 'N',
  col_aq: 'N',
  col_be: '주택/상가혼재지대',
  col_bf: '공공용지',
  col_bg: '계단',
  col_bh: '공익용도활용',
};

(async () => {
  const out = path.resolve(__dirname, '../uploads/assets/_p2_verify.pdf');
  await exportChungjuSurveyPdf(sample, [], out);
  const st = fs.statSync(out);
  console.log('pdf_ok bytes=' + st.size);

  const src = fs.readFileSync(
    path.resolve(__dirname, '../app/utils/chungju_survey_pdf.js'),
    'utf8'
  );
  const checks = ['col_k', 'col_q', 'col_u', 'col_ae', 'col_ag', 'col_be'];
  for (const c of checks) {
    const needle = "val(d, '" + c + "')";
    if (!src.includes(needle)) throw new Error('missing map ' + c);
  }
  console.log('map_fields_ok');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
