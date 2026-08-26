const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const { buildSurveySections } = require('./chungju_survey_fields');

/** 문자열의 엑셀 표시 너비 (한글·전각 ≈ 2, ASCII ≈ 1) */
function textDisplayWidth(text) {
  let w = 0;
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    if (
      (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
      (code >= 0x2e80 && code <= 0x9fff) || // CJK
      (code >= 0xac00 && code <= 0xd7a3) || // 한글 음절
      (code >= 0xff01 && code <= 0xff60) // 전각
    ) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

/** 열 너비 — 표시 너비 + 여유(값이 칸보다 좁게 보이지 않도록) */
function excelColumnWidth(text, min = 10, max = 200) {
  const dw = textDisplayWidth(text);
  const cap = dw > 100 ? Math.max(max, dw + 6) : max;
  return Math.max(min, Math.min(cap, dw + 4));
}

/** 라벨·값 중 더 넓은 쪽 기준 */
function excelColumnWidthForField(label, value) {
  return Math.max(excelColumnWidth(label), excelColumnWidth(value));
}

/** 섹션 구조를 (라벨, 값) 단일 배열로 평탄화 */
function flattenSurveyFields(row) {
  const fields = [];
  for (const section of buildSurveySections(row)) {
    for (const [label, value] of section.rows) {
      fields.push([label, value ?? '']);
    }
  }
  return fields;
}

function imageExt(filePath) {
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
  if (ext === 'png' || ext === 'gif') return ext;
  return 'png';
}

/**
 * 공유재산 실태조사표 엑셀 — 1행 필드명, 2행 필드값
 */
async function exportChungjuSurveyXlsx(row, images, outputPath) {
  const workbook = new Excel.Workbook();
  workbook.creator = 'jangsu';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('실태조사표', {
    properties: { defaultRowHeight: 18 },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  // 1행=필드명, 2행=필드값 (세로로 대응)
  const fields = flattenSurveyFields(row);
  fields.forEach(([label, value], idx) => {
    const col = idx + 1;

    const labelCell = sheet.getCell(1, col);
    labelCell.value = label;
    labelCell.font = { bold: true };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };
    labelCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    const valueCell = sheet.getCell(2, col);
    valueCell.value = value ?? '';
    valueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    const width = excelColumnWidthForField(label, value ?? '');
    sheet.getColumn(col).width = width;
  });

  // 현장사진 시트
  const imgs = Array.isArray(images) ? images : [];
  const photoSheet = workbook.addWorksheet('현장사진');
  photoSheet.getColumn(1).width = 18;
  let photoCol2Width = 40;
  photoSheet.getCell(1, 1).value = '슬롯';
  photoSheet.getCell(1, 2).value = '파일';
  photoSheet.getCell(1, 1).font = { bold: true };
  photoSheet.getCell(1, 2).font = { bold: true };

  const slotNames = ['근경', '원경', '항공', '지적도'];
  let photoRow = 2;
  // 현장사진 없어도 4슬롯 빈칸 행을 기본으로 출력
  for (let i = 0; i < 4; i++) {
    const img = imgs[i];
    photoSheet.getCell(photoRow, 1).value = slotNames[i];
    if (!img) {
      photoSheet.getCell(photoRow, 2).value = '(없음)';
      photoRow += 1;
      continue;
    }
    const filePath = path.resolve(__dirname, '../../', img.img_path || '', img.img_name || '');
    const exists = fs.existsSync(filePath);
    const fileLabel = exists ? img.img_name : `(없음) ${img.img_name || ''}`;
    photoSheet.getCell(photoRow, 2).value = fileLabel;
    photoCol2Width = Math.max(photoCol2Width, excelColumnWidth(fileLabel));

    if (exists) {
      try {
        const imageId = workbook.addImage({
          filename: filePath,
          extension: imageExt(filePath),
        });
        const top = 6 + i * 18;
        photoSheet.addImage(imageId, {
          tl: { col: 0, row: top },
          ext: { width: 320, height: 240 },
        });
      } catch (e) {
        console.warn('엑셀 이미지 삽입 실패:', filePath, e.message);
      }
    }
    photoRow += 1;
  }
  photoSheet.getColumn(2).width = photoCol2Width;

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

/**
 * 여러 필지 실태조사표를 단일 엑셀로 합본
 * — 1행 필드명, 2행부터 필지별 값 (현장사진은 파일명만 열로 포함)
 * @param {{ row: object, images?: object[] }[]} items
 */
async function exportChungjuSurveyXlsxMerged(items, outputPath) {
  const list = Array.isArray(items) ? items.filter((it) => it && it.row) : [];
  if (list.length === 0) {
    throw new Error('합본 대상 데이터가 없습니다.');
  }

  const workbook = new Excel.Workbook();
  workbook.creator = 'jangsu';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('실태조사표', {
    properties: { defaultRowHeight: 18 },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  const slotNames = ['근경', '원경', '항공', '지적도'];
  const baseFields = flattenSurveyFields(list[0].row);
  const headers = [...baseFields.map(([label]) => label), ...slotNames];

  headers.forEach((label, idx) => {
    const col = idx + 1;
    const cell = sheet.getCell(1, col);
    cell.value = label;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });

  list.forEach((item, rowIdx) => {
    const fields = flattenSurveyFields(item.row);
    const values = fields.map(([, value]) => value ?? '');
    const imgs = Array.isArray(item.images) ? item.images : [];
    for (let i = 0; i < 4; i++) {
      const img = imgs[i];
      values.push(img && img.img_name ? img.img_name : '');
    }
    const excelRow = rowIdx + 2;
    values.forEach((value, colIdx) => {
      const cell = sheet.getCell(excelRow, colIdx + 1);
      cell.value = value ?? '';
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  headers.forEach((label, idx) => {
    const col = idx + 1;
    let maxW = excelColumnWidth(label);
    for (let r = 2; r <= list.length + 1; r++) {
      const v = sheet.getCell(r, col).value;
      maxW = Math.max(maxW, excelColumnWidth(v));
    }
    // 열 너비 > 가장 긴 셀 표시 너비
    sheet.getColumn(col).width = maxW;
  });

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

module.exports = {
  exportChungjuSurveyXlsx,
  exportChungjuSurveyXlsxMerged,
  textDisplayWidth,
  excelColumnWidth,
};
