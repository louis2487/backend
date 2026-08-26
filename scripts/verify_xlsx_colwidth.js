const path = require('path');
const Excel = require('exceljs');
const {
  exportChungjuSurveyXlsx,
  exportChungjuSurveyXlsxMerged,
  textDisplayWidth,
} = require('../app/utils/chungju_survey_xlsx');

const longName = '4574031034101330010_20260724_145126-0.jpg';
const longAddr =
  '전라북도 장수군 산서면 보산로 1864-16 보조주소동 123-45';
const longOpinion =
  '종합의견 테스트입니다. 주변 환경 및 활용 방안을 검토한 결과 추가 조사가 필요합니다.';

const row = {
  fpop_key: '4574031034101330010',
  col_a: '4574031034101330010',
  col_e: '12345.6789',
  col_h: '계획관리지역,생산관리지역',
  col_k: '주거용,상업용 복합',
  col_r: '1234567890123',
  col_t: '9876543210987',
  col_w: '장수군청 재산관리과 담당',
  col_x: '분임관리관 홍길동',
  col_y: '위임관리관 김철수',
  col_o: '2024-01-15',
  col_ae: '자연녹지지역,개발제한구역',
  col_af: '문화재보호구역 지정',
  col_ah: '적합',
  col_ar: '3',
  addr: longAddr,
  col_bh: longOpinion,
};

const checkFields = [
  '공부면적(㎡)',
  '용도지역',
  '토지이용상황',
  '재산 기준가격',
  '표준지 공시지가',
  '재산관리관',
  '분임관리관',
  '위임관리관',
  '소유권 변동일자',
  '지역·지구(국토계획법)',
  '지역·지구(기타법령)',
  '대부-적합여부',
  '무단점유자 수',
  '위치',
  '종합의견',
  '지적도',
];

function colWidth(sheet, label) {
  const row1 = sheet.getRow(1).values;
  const idx = row1.indexOf(label);
  if (idx < 0) return null;
  return sheet.getColumn(idx).width;
}

function cellValue(sheet, label) {
  const row1 = sheet.getRow(1).values;
  const idx = row1.indexOf(label);
  if (idx < 0) return '';
  let max = '';
  for (let r = 2; r <= sheet.rowCount; r++) {
    const v = String(sheet.getCell(r, idx).value ?? '');
    if (textDisplayWidth(v) > textDisplayWidth(max)) max = v;
  }
  return max;
}

function assertCol(sheet, label, fail) {
  const w = colWidth(sheet, label);
  const val = cellValue(sheet, label);
  const need = textDisplayWidth(val);
  const ok = w != null && w > need;
  console.log(label, { width: w, valueW: need, ok: ok ? 'OK' : 'FAIL' });
  if (!ok) fail.push(label);
}

(async () => {
  const single = path.resolve(__dirname, '../uploads/assets/_verify_xlsx_cols_single.xlsx');
  const merged = path.resolve(__dirname, '../uploads/assets/_verify_xlsx_cols_merged.xlsx');

  await exportChungjuSurveyXlsx(row, [null, null, null, { img_name: longName }], single);
  await exportChungjuSurveyXlsxMerged(
    [
      { row, images: [null, null, null, { img_name: longName }] },
      { row: { ...row, col_a: '4031034' }, images: [null, null, null, { img_name: '4031034.jpg' }] },
    ],
    merged
  );

  const fail = [];
  for (const file of [single, merged]) {
    const wb = new Excel.Workbook();
    await wb.xlsx.readFile(file);
    const sheet = wb.getWorksheet('실태조사표');
    console.log('\n', path.basename(file));
    for (const label of checkFields) assertCol(sheet, label, fail);
  }

  if (fail.length) {
    console.log('\nFAILED', fail);
    process.exitCode = 1;
  } else {
    console.log('\nall OK');
  }
})();
