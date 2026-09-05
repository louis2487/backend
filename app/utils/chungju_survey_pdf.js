const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { resolveImageFile, ensureJpegBytes } = require('./chungju_survey_hwpx');
const { extractJibun, resolveManageNo, resolveSojaeji } = require('./chungju_survey_fields');

const TEMPLATE_PATH = path.resolve(__dirname, '../../uploads/assets/chungju_land_survey_template.pdf');
const FONT_PATH = path.resolve(__dirname, '../../uploads/assets/malgun.ttf');

async function loadFont(pdfDoc) {
  if (fs.existsSync(FONT_PATH)) {
    const fontBytes = fs.readFileSync(FONT_PATH);
    return pdfDoc.embedFont(fontBytes, { subset: true });
  }
  return pdfDoc.embedFont(StandardFonts.Helvetica);
}

function val(row, key) {
  const v = row?.[key];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function indent5(text) {
  const t = String(text == null ? '' : text).trim();
  if (!t) return '';
  return '     ' + t;
}

function coverAndDraw(page, font, text, x, y, width = 90, height = 12, size = 8, align = 'left') {
  let drawText = String(text == null ? '' : text).trim();
  if (!drawText) drawText = '-';
  if (drawText.length > 60) drawText = drawText.slice(0, 60);

  page.drawRectangle({
    x,
    y: y - 2,
    width,
    height,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  // 칸 너비에 맞게 글자 크기를 줄여 한 줄(가로)로 유지
  let fontSize = size;
  try {
    while (fontSize > 5) {
      const textWidth = font.widthOfTextAtSize(drawText, fontSize);
      if (textWidth <= width - 2) break;
      fontSize -= 0.5;
    }
    // 그래도 넘치면 잘라서 가로 한 줄 유지
    while (
      drawText.length > 1 &&
      font.widthOfTextAtSize(drawText, fontSize) > width - 2
    ) {
      drawText = drawText.slice(0, -1);
    }
    const textWidth = font.widthOfTextAtSize(drawText, fontSize);
    let drawX = x + 1;
    if (align === 'center') {
      drawX = x + Math.max(0, (width - textWidth) / 2);
    }
    page.drawText(drawText, {
      x: drawX,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  } catch (e) {
    console.error('PDF drawText failed:', drawText, e.message);
  }
}

async function embedImage(pdfDoc, filePath) {
  const bytes = fs.readFileSync(filePath);
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png') || detectPng(bytes)) return pdfDoc.embedPng(bytes);
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || detectJpeg(bytes)) {
    return pdfDoc.embedJpg(bytes);
  }
  return pdfDoc.embedPng(bytes);
}

function detectPng(buf) {
  return buf && buf[0] === 0x89 && buf[1] === 0x50;
}
function detectJpeg(buf) {
  return buf && buf[0] === 0xff && buf[1] === 0xd8;
}

/**
 * 충주/장수 공유재산 실태조사표 PDF — P2개발.md 기재 항목 매핑
 * 좌표: A4 (595×842), 기존 사용현황·기타 좌표를 기준으로 상단 섹션 보간
 */
async function exportChungjuSurveyPdf(row, images, outputPath) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error('실태조사표 PDF 양식 파일이 없습니다.');
  }

  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const templateDoc = await PDFDocument.load(templateBytes);
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await loadFont(pdfDoc);

  const pageIndexes = templateDoc.getPageCount() >= 2 ? [0, 1] : [0];
  const copiedPages = await pdfDoc.copyPages(templateDoc, pageIndexes);
  copiedPages.forEach((p) => pdfDoc.addPage(p));

  const page1 = pdfDoc.getPage(0);
  const d = row || {};

  // —— 1. 기본정보 ——
  // row y=760: 지번 / 공부지목 / 공부면적
  coverAndDraw(page1, font, extractJibun(val(d, 'col_b') || val(d, 'addr')), 190, 760, 140);
  coverAndDraw(page1, font, val(d, 'col_d'), 360, 760, 70);
  coverAndDraw(page1, font, val(d, 'col_e') || val(d, 'land_area'), 480, 760, 70);
  // row y=736: 도로명 / 현황지목 / 실면적 (도로명은 빈칸)
  coverAndDraw(page1, font, '', 190, 736, 140);
  coverAndDraw(page1, font, val(d, 'col_ac'), 360, 736, 70);
  coverAndDraw(page1, font, val(d, 'col_g'), 480, 736, 70);
  // row y=715: 용도지역 / 토지이용상황 / 도로접면
  coverAndDraw(page1, font, val(d, 'col_h'), 190, 715, 140);
  coverAndDraw(page1, font, val(d, 'col_k'), 360, 715, 70);
  coverAndDraw(page1, font, val(d, 'col_l'), 480, 715, 70);
  // row y=694: 지형높이 / 지형형상
  coverAndDraw(page1, font, val(d, 'col_m'), 194, 694, 100);
  coverAndDraw(page1, font, val(d, 'col_n'), 378, 694, 80);

  // —— 2. 가격 ——
  coverAndDraw(page1, font, val(d, 'col_q'), 194, 655, 100);
  coverAndDraw(page1, font, val(d, 'col_r'), 400, 655, 100);
  coverAndDraw(page1, font, val(d, 'col_s'), 194, 635, 100);
  coverAndDraw(page1, font, val(d, 'col_t'), 400, 635, 100);

  // —— 3. 취득 및 소유 ——
  coverAndDraw(page1, font, val(d, 'col_u'), 194, 600, 100);
  coverAndDraw(page1, font, val(d, 'col_v'), 400, 600, 100);
  coverAndDraw(page1, font, val(d, 'col_w'), 194, 580, 120, 12, 7);
  coverAndDraw(page1, font, val(d, 'col_x'), 400, 580, 100);
  coverAndDraw(page1, font, val(d, 'col_y'), 194, 560, 100);
  coverAndDraw(page1, font, val(d, 'col_z'), 400, 560, 100);
  coverAndDraw(page1, font, val(d, 'col_aa'), 194, 540, 80);
  coverAndDraw(page1, font, val(d, 'col_ab'), 400, 540, 80);
  coverAndDraw(page1, font, val(d, 'col_o'), 194, 520, 100);
  coverAndDraw(page1, font, val(d, 'col_p'), 400, 520, 100);
  coverAndDraw(page1, font, val(d, 'col_ad'), 194, 500, 100);
  coverAndDraw(page1, font, val(d, 'col_j'), 400, 500, 100);
  coverAndDraw(page1, font, val(d, 'col_i'), 194, 480, 100);
  coverAndDraw(page1, font, val(d, 'col_c'), 400, 480, 100);

  // —— 4. 공법상 규제사항 ——
  coverAndDraw(page1, font, val(d, 'col_ae'), 220, 440, 280, 12, 7);
  coverAndDraw(page1, font, val(d, 'col_af'), 220, 420, 280, 12, 7);

  // —— 5. 사용현황 (좌측 + 공백 5칸) ——
  coverAndDraw(page1, font, indent5(val(d, 'col_ag')), 151, 370, 56);
  coverAndDraw(page1, font, indent5(val(d, 'col_ap')), 265, 370, 56);
  coverAndDraw(page1, font, indent5(val(d, 'col_aq')), 381, 370, 56);
  coverAndDraw(page1, font, indent5(val(d, 'col_ar')), 496, 370, 57);

  // 대부현황
  coverAndDraw(page1, font, indent5(val(d, 'col_ah')), 93, 340, 56);
  coverAndDraw(page1, font, val(d, 'col_ai'), 150, 340, 57);
  coverAndDraw(page1, font, val(d, 'col_ax'), 208, 340, 57);
  coverAndDraw(page1, font, val(d, 'col_at'), 265, 340, 56, 12, 8, 'center');
  coverAndDraw(page1, font, val(d, 'col_al'), 323, 340, 56);
  coverAndDraw(page1, font, val(d, 'col_am'), 381, 340, 56);
  coverAndDraw(page1, font, val(d, 'col_an'), 438, 340, 57);
  coverAndDraw(page1, font, val(d, 'col_au'), 496, 340, 57);

  // 무단점유
  coverAndDraw(page1, font, indent5(val(d, 'col_av')), 93, 265, 56);
  coverAndDraw(page1, font, val(d, 'col_aw'), 150, 265, 57);
  coverAndDraw(page1, font, val(d, 'col_az'), 208, 265, 57);
  coverAndDraw(page1, font, val(d, 'col_ba'), 265, 265, 56);
  coverAndDraw(page1, font, val(d, 'col_ay'), 323, 265, 56);
  coverAndDraw(page1, font, val(d, 'col_bb'), 381, 265, 56);
  coverAndDraw(page1, font, val(d, 'col_bc'), 438, 265, 57);
  coverAndDraw(page1, font, val(d, 'col_bd'), 496, 265, 57);

  // —— 6. 기타사항 ——
  coverAndDraw(page1, font, resolveSojaeji(d), 163, 182, 300);
  coverAndDraw(page1, font, val(d, 'col_be'), 163, 161, 200);
  coverAndDraw(page1, font, val(d, 'col_bf'), 163, 140, 200);
  coverAndDraw(page1, font, val(d, 'col_bg'), 163, 118, 300);
  coverAndDraw(page1, font, val(d, 'col_bh'), 163, 97, 200);

  // —— 7. 결재란 (1페이지 하단 — 위 행과 좌측 정렬)
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // A4 595pt 기준, J1 오버레이 비율(0.140/0.305/0.540/0.740)에 맞춤
  coverAndDraw(page1, font, '', 83, 67, 62); // 조사자
  coverAndDraw(page1, font, dateStr, 182, 67, 98); // 조사일자
  coverAndDraw(page1, font, '', 321, 67, 80); // 확인자
  coverAndDraw(page1, font, '', 440, 67, 101); // 확인일자

  // —— 8. 2페이지: 관리번호·소재지·현장사진 4슬롯 ——
  if (pdfDoc.getPageCount() >= 2) {
    const page2 = pdfDoc.getPage(1);
    // 칸 전체 가림 후 좌측 정렬 (라벨과 동일 행 높이, 횡 중앙 없음)
    const page2H = 842;
    const hdrTop = 0.0813;
    const hdrH = 0.0458;
    const hdrY = page2H * (1 - hdrTop - hdrH); // 셀 하단
    const hdrHt = page2H * hdrH;
    const hdrFontSize = 10;
    const textY = hdrY + (hdrHt - hdrFontSize) / 2 + 2;
    page2.drawRectangle({
      x: 101,
      y: hdrY,
      width: 196,
      height: hdrHt,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
    page2.drawRectangle({
      x: 370,
      y: hdrY,
      width: 197,
      height: hdrHt,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
    coverAndDraw(
      page2,
      font,
      resolveManageNo(d),
      105,
      textY,
      188,
      hdrFontSize + 4,
      hdrFontSize
    );
    coverAndDraw(
      page2,
      font,
      resolveSojaeji(d),
      374,
      textY,
      189,
      hdrFontSize + 4,
      hdrFontSize
    );

    const slots = [
      { x: 40, y: 400, w: 250, h: 220 }, // 근경
      { x: 310, y: 400, w: 250, h: 220 }, // 원경
      { x: 40, y: 120, w: 250, h: 220 }, // 항공
      { x: 310, y: 120, w: 250, h: 220 }, // 지적도
    ];

    // 현장사진 없으면 빈칸(흰색)을 기본값으로 깔고, 있는 슬롯만 덮어씀
    const imgs = Array.isArray(images) ? images : [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      page2.drawRectangle({
        x: slot.x,
        y: slot.y,
        width: slot.w,
        height: slot.h,
        color: rgb(1, 1, 1),
      });

      const img = imgs[i];
      if (!img) continue;
      const resolved = resolveImageFile(img);
      if (!resolved) continue;
      try {
        const jpegBytes = await ensureJpegBytes(resolved.bytes, resolved.filePath);
        if (!jpegBytes) continue;
        const embedded = await pdfDoc.embedJpg(jpegBytes);
        page2.drawImage(embedded, {
          x: slot.x + 4,
          y: slot.y + 4,
          width: slot.w - 8,
          height: slot.h - 8,
        });
      } catch (e) {
        console.error('PDF image embed failed:', resolved.filePath, e.message);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

module.exports = { exportChungjuSurveyPdf, TEMPLATE_PATH };
