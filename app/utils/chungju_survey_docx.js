const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
} = require('docx');
const { buildSurveySections } = require('./chungju_survey_fields');

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const LABEL_W = 2800;
const VALUE_W = 6500;

function cell(text, opts = {}) {
  const { bold = false, shade } = opts;
  return new TableCell({
    borders: BORDERS,
    width: { size: opts.width || VALUE_W, type: WidthType.DXA },
    shading: shade ? { fill: shade } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text == null ? '' : String(text),
            bold,
            size: 18, // 9pt
            font: 'Malgun Gothic',
          }),
        ],
      }),
    ],
  });
}

function sectionTable(section) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          borders: BORDERS,
          columnSpan: 2,
          width: { size: LABEL_W + VALUE_W, type: WidthType.DXA },
          shading: { fill: 'D9E1F2' },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: section.title,
                  bold: true,
                  size: 22,
                  font: 'Malgun Gothic',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  for (const [label, value] of section.rows) {
    rows.push(
      new TableRow({
        children: [
          cell(label, { bold: true, shade: 'F2F2F2', width: LABEL_W }),
          cell(value, { width: VALUE_W }),
        ],
      })
    );
  }

  return new Table({
    width: { size: LABEL_W + VALUE_W, type: WidthType.DXA },
    columnWidths: [LABEL_W, VALUE_W],
    rows,
  });
}

/**
 * 공유재산 실태조사표 DOCX — 엑셀과 동일한 데이터형 섹션
 */
async function exportChungjuSurveyDocx(row, outputPath) {
  const sections = buildSurveySections(row);
  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: '공유재산 실태조사표',
          bold: true,
          size: 32,
          font: 'Malgun Gothic',
        }),
      ],
    }),
  ];

  for (const section of sections) {
    children.push(sectionTable(section));
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  const doc = new Document({
    creator: 'jangsu',
    title: '공유재산 실태조사표',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = { exportChungjuSurveyDocx };
