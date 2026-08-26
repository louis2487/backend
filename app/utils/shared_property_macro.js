'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Excel = require('exceljs');

/** 지목명 → "코드-지목" (분석완료 지목코드join) */
const JIMOK_MAP = {
  전: '01-전',
  답: '02-답',
  과수원: '03-과수원',
  목장용지: '04-목장용지',
  임야: '05-임야',
  광천지: '06-광천지',
  염전: '07-염전',
  대: '08-대',
  공장용지: '09-공장용지',
  학교용지: '10-학교용지',
  주차장: '11-주차장',
  주유소용지: '12-주유소용지',
  창고용지: '13-창고용지',
  도로: '14-도로',
  철도용지: '15-철도용지',
  제방: '16-제방',
  하천: '17-하천',
  구거: '18-구거',
  유지: '19-유지',
  양어장: '20-양어장',
  수도용지: '21-수도용지',
  공원: '22-공원',
  체육용지: '23-체육용지',
  유원지: '24-유원지',
  종교용지: '25-종교용지',
  사적지: '26-사적지',
  묘지: '27-묘지',
  잡종지: '28-잡종지',
};

const ERROR_LEGEND_LAND = [
  [1, '토지공유재산 미존재'],
  [2, '토지등기부 미존재'],
  [3, '토지대장 미존재'],
  [4, '토지공유재산만 존재'],
  [5, '토지등기부만 존재'],
  [6, '토지대장만 존재'],
];

/** 오류유형2.png ⑦~⑪ + 완전매트릭스용 건물등기부 미존재(12) */
const ERROR_LEGEND_BUILDING = [
  [7, '건물 공유재산대장 미존재'],
  [8, '건축물대장만 존재'],
  [9, '건축물대장 미존재'],
  [10, '건물 공유재산대장만 존재'],
  [11, '건물등기부만 존재'],
  [12, '건물등기부 미존재'],
];

/**
 * PNU는 19자리 숫자 문자열. JS Number/엑셀 숫자형이면 4.12901E+18 로 깨지므로
 * 절대 Number로 변환하지 않고 숫자만 남긴 문자열로 정규화.
 */
function normPnu(v) {
  if (v == null || v === '') return '';
  let s = String(v).trim().replace(/^['"]+|['"]+$/g, '');
  // 이미 과학적 표기로 깨진 경우: 가능한 한 정수 자리로 복원(끝자리 손실 가능)
  if (/[eE][+-]?\d+$/.test(s)) {
    const m = s.match(/^([+-]?)(\d+)\.?(\d*)[eE]([+-]?\d+)$/);
    if (m) {
      const sign = m[1] === '-' ? '-' : '';
      const intPart = m[2];
      const frac = m[3] || '';
      const exp = parseInt(m[4], 10);
      let digits = intPart + frac;
      const shift = exp - frac.length;
      if (shift >= 0) digits += '0'.repeat(shift);
      else digits = digits.slice(0, Math.max(0, digits.length + shift));
      s = sign + digits;
    }
  }
  s = s.replace(/[^\d]/g, '');
  return s;
}

function decodeCsvBuffer(buf) {
  let iconv;
  try {
    iconv = require('iconv-lite');
  } catch (_) {
    iconv = null;
  }
  if (iconv) {
    const cp949 = iconv.decode(buf, 'cp949');
    // 깨짐이 심하면 utf8 시도
    if (!cp949.includes('\uFFFD') && /PNU|재산|토지|순번/.test(cp949)) {
      return cp949;
    }
    const utf8 = buf.toString('utf8');
    if (/PNU|재산|토지|순번/.test(utf8)) return utf8.replace(/^\uFEFF/, '');
    return cp949;
  }
  return buf.toString('utf8').replace(/^\uFEFF/, '');
}

/** CSV를 텍스트로 파싱(PNU를 숫자로 파싱하지 않음) */
function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return [];
  const splitCsvLine = (line) => {
    const out = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.every((c) => c === '')) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] != null ? cols[idx] : null;
    });
    rows.push(row);
  }
  return rows;
}

/** 시트 셀에서 PNU 후보 추출: 문자열/표시문자(w) 우선, 숫자(v) 최후 */
function cellPnuText(cell) {
  if (!cell) return '';
  if (cell.t === 's' || cell.t === 'str') return normPnu(cell.v);
  if (cell.w != null && String(cell.w).trim() !== '') {
    const w = String(cell.w).trim();
    // 표시가 이미 과학적 표기면 v도 정밀도 손실된 상태 — w 기준으로라도 정규화
    if (/^\d+$/.test(w.replace(/[, ]/g, ''))) return normPnu(w);
    if (/[eE]/.test(w)) return normPnu(w);
    return normPnu(w);
  }
  if (typeof cell.v === 'string') return normPnu(cell.v);
  if (typeof cell.v === 'number') return normPnu(cell.w != null ? cell.w : cell.v);
  return '';
}

function sheetToRowsWithPnu(sheet) {
  if (!sheet || !sheet['!ref']) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  if (!rows.length) return rows;

  // PNU 컬럼 인덱스 찾아 셀 원문으로 덮어쓰기
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let pnuCol = -1;
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const cell = sheet[addr];
    const name = cell ? String(cell.w || cell.v || '').trim() : '';
    if (name === 'PNU' || name.toLowerCase() === 'pnu') {
      pnuCol = c;
      break;
    }
  }
  if (pnuCol < 0) return rows;

  const headerRow = range.s.r;
  for (let i = 0; i < rows.length; i++) {
    const r = headerRow + 1 + i;
    const addr = XLSX.utils.encode_cell({ r, c: pnuCol });
    const fixed = cellPnuText(sheet[addr]);
    if (fixed) {
      if (rows[i].PNU != null) rows[i].PNU = fixed;
      else if (rows[i].pnu != null) rows[i].pnu = fixed;
      else rows[i].PNU = fixed;
    }
  }
  return rows;
}

function pick(row, ...keys) {
  for (const k of keys) {
    if (row[k] != null && row[k] !== '') return row[k];
  }
  // case-insensitive / trimmed header fallback
  const map = {};
  for (const [k, v] of Object.entries(row)) {
    map[String(k).trim()] = v;
  }
  for (const k of keys) {
    if (map[k] != null && map[k] !== '') return map[k];
  }
  return null;
}

function parseArea(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v).replace(/,/g, '').replace(/㎡/g, '').replace(/m2/gi, '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normJimok(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  if (!s) return null;
  if (JIMOK_MAP[s]) return JIMOK_MAP[s];
  // already "01-전" or "01"
  const m = s.match(/^(\d{2})\s*-?\s*(.*)$/);
  if (m) {
    const code = m[1];
    const name = (m[2] || '').trim();
    if (name && JIMOK_MAP[name]) return JIMOK_MAP[name];
    for (const [nm, full] of Object.entries(JIMOK_MAP)) {
      if (full.startsWith(code + '-')) return full;
    }
    return name ? `${code}-${name}` : s;
  }
  return s;
}

function readTable(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    const rows = parseCsvText(decodeCsvBuffer(fs.readFileSync(filePath)));
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, 'sheet1');
    return wb;
  }
  return XLSX.readFile(filePath, { cellDates: true, raw: false });
}

function sheetToRows(sheet) {
  return sheetToRowsWithPnu(sheet);
}

function readRowsAny(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    return parseCsvText(decodeCsvBuffer(fs.readFileSync(filePath)));
  }
  const wb = XLSX.readFile(filePath, { cellDates: true, raw: false });
  for (const name of wb.SheetNames) {
    const probe = sheetToRowsWithPnu(wb.Sheets[name]);
    if (!probe.length) continue;
    const keys = Object.keys(probe[0]).map((k) => String(k).trim());
    if (keys.includes('PNU') || keys.includes('pnu')) return probe;
  }
  // PNU 시트 없으면 첫 시트
  return sheetToRowsWithPnu(wb.Sheets[wb.SheetNames[0]]);
}

/** 등기부: mode=land → 토지 / mode=building → 건물·집합건물 */
function loadDeunggi(filePath, mode = 'land') {
  const rows = readRowsAny(filePath);
  const map = new Map();
  for (const row of rows) {
    const kind = String(pick(row, '부동산종류') || '').trim();
    if (mode === 'building') {
      if (kind && kind !== '건물' && kind !== '집합건물') continue;
    } else if (kind && kind !== '토지') {
      continue;
    }
    const pnu = normPnu(pick(row, 'PNU', 'pnu'));
    if (!pnu) continue;
    if (map.has(pnu)) continue;
    map.set(pnu, {
      소유형태: pick(row, '소유형태'),
      명의인명: pick(row, '명의인명'),
      접수일자: pick(row, '접수일자'),
      토지지목코드: normJimok(pick(row, '지목', '토지지목코드')),
      용도: pick(row, '지목') || null,
      면적: parseArea(pick(row, '면적')),
    });
  }
  return map;
}

function loadGongyu(filePath, mode = 'land') {
  const rows = readRowsAny(filePath);
  return rows
    .map((row, idx) => {
      const pnu = normPnu(pick(row, 'PNU', 'pnu'));
      const jimokRaw = pick(row, '토지지목코드', '실지목코드');
      let jimok = null;
      if (jimokRaw != null && jimokRaw !== '') {
        const s = String(jimokRaw).trim();
        jimok = JIMOK_MAP[s] || s;
      }
      return {
        _idx: idx,
        PNU: pnu,
        새올인증여부: pick(row, '새올인증여부'),
        재산명: pick(row, '재산명'),
        소재지: pick(row, '소재지'),
        재산번호: pick(row, '재산번호'),
        입력시스템: pick(row, '입력시스템'),
        소유구분코드: pick(row, '소유구분코드'),
        재산용코드: pick(row, '재산용코드', '재산용도코드'),
        행정재산코드: pick(row, '행정재산코드'),
        재산관리관코드: pick(row, '재산관리관코드'),
        취득일자: pick(row, '취득일자'),
        토지지목코드: jimok,
        건물용도코드: pick(row, '건물용도코드'),
        주구조코드: pick(row, '주구조코드'),
        면적:
          mode === 'building'
            ? parseArea(pick(row, '연면적', '면적', '실면적', '취득면적'))
            : parseArea(pick(row, '면적', '실면적')),
      };
    })
    .filter((r) => r.PNU);
}

function loadToji(filePath) {
  const rows = readRowsAny(filePath);
  const map = new Map();
  for (const row of rows) {
    const pnu = normPnu(pick(row, 'PNU', 'pnu'));
    if (!pnu) continue;
    if (map.has(pnu)) continue;
    map.set(pnu, {
      소유구분: pick(row, '소유구분'),
      소유자명: pick(row, '소유자명', '성명'),
      소유권변경일자: pick(row, '소유권변경일자'),
      토지지목코드: normJimok(pick(row, '지목', '토지지목코드')),
      면적: parseArea(pick(row, '면적')),
    });
  }
  return map;
}

/** 건축물대장 */
function loadGeonchuk(filePath) {
  const rows = readRowsAny(filePath);
  const map = new Map();
  for (const row of rows) {
    const pnu = normPnu(pick(row, 'PNU', 'pnu'));
    if (!pnu) continue;
    if (map.has(pnu)) continue;
    map.set(pnu, {
      소유자명: pick(row, '(소유자)명', '소유자명', '성명'),
      건물명: pick(row, '건물명', '동명'),
      주용도코드명: pick(row, '주용도코드명'),
      사용승인일자: pick(row, '사용승인일자'),
      연면적: parseArea(pick(row, '연면적', '면적')),
      // compareDisplay 호환
      토지지목코드: pick(row, '주용도코드명'),
      면적: parseArea(pick(row, '연면적', '면적')),
    });
  }
  return map;
}

function classifyErrorLand(hasGong, hasLedger, hasDeung) {
  if (hasGong && hasLedger && hasDeung) return { yn: '정상', type: null };
  if (!hasGong && hasLedger && hasDeung) return { yn: '오류', type: 1 };
  if (hasGong && hasLedger && !hasDeung) return { yn: '오류', type: 2 };
  if (hasGong && !hasLedger && hasDeung) return { yn: '오류', type: 3 };
  if (hasGong && !hasLedger && !hasDeung) return { yn: '오류', type: 4 };
  if (!hasGong && !hasLedger && hasDeung) return { yn: '오류', type: 5 };
  if (!hasGong && hasLedger && !hasDeung) return { yn: '오류', type: 6 };
  return { yn: '오류', type: null };
}

/** 오류유형2: ⑦~⑪ + ⑫(공유O·건축O·등기X) */
function classifyErrorBuilding(hasGong, hasLedger, hasDeung) {
  if (hasGong && hasLedger && hasDeung) return { yn: '정상', type: null };
  if (!hasGong && hasLedger && hasDeung) return { yn: '오류', type: 7 };
  if (!hasGong && hasLedger && !hasDeung) return { yn: '오류', type: 8 };
  if (hasGong && !hasLedger && hasDeung) return { yn: '오류', type: 9 };
  if (hasGong && !hasLedger && !hasDeung) return { yn: '오류', type: 10 };
  if (!hasGong && !hasLedger && hasDeung) return { yn: '오류', type: 11 };
  if (hasGong && hasLedger && !hasDeung) return { yn: '오류', type: 12 };
  return { yn: '오류', type: null };
}

function compareDisplay(gongUse, gongArea, ledger, deung, mode = 'land') {
  const useKeys =
    mode === 'building'
      ? [gongUse, ledger?.주용도코드명 || ledger?.토지지목코드, deung?.용도 || deung?.토지지목코드]
      : [gongUse, ledger?.토지지목코드, deung?.토지지목코드];
  const uses = useKeys.filter((v) => v != null && String(v).trim() !== '');
  const areas = [gongArea, ledger?.면적 ?? ledger?.연면적, deung?.면적].filter(
    (v) => v != null && Number(v) !== 0
  );

  let useResult = null;
  if (uses.length >= 2) {
    const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase();
    const base = norm(uses[0]);
    useResult = uses.every((j) => norm(j) === base) ? '일치' : '불일치';
  }

  let areaResult = null;
  if (areas.length >= 2) {
    const base = Number(areas[0]);
    areaResult = areas.every((a) => Number(a) === base) ? '일치' : '불일치';
  }

  return { jimokResult: useResult, areaResult };
}

function buildRow({ seq, pnu, g, ledger, deung, err, jimokDisp, areaDisp, mode }) {
  const isB = mode === 'building';
  return {
    순번: seq,
    새올인증여부: g?.새올인증여부 ?? null,
    재산명: g?.재산명 ?? null,
    PNU: pnu,
    소재지: g?.소재지 ?? null,
    재산번호: g?.재산번호 ?? null,
    입력시스템: g?.입력시스템 ?? null,
    소유구분코드: g?.소유구분코드 ?? null,
    재산용코드: g?.재산용코드 ?? null,
    행정재산코드: g?.행정재산코드 ?? null,
    재산관리관코드: g?.재산관리관코드 ?? null,
    취득일자: g?.취득일자 ?? null,
    공유_토지지목코드: isB ? g?.건물용도코드 ?? null : g?.토지지목코드 ?? null,
    공유_면적: g?.면적 ?? null,
    토지_소유구분: isB ? ledger?.건물명 ?? null : ledger?.소유구분 ?? null,
    토지_소유자명: ledger?.소유자명 ?? null,
    토지_소유권변경일자: isB
      ? ledger?.사용승인일자 ?? null
      : ledger?.소유권변경일자 ?? null,
    토지_토지지목코드: isB
      ? ledger?.주용도코드명 ?? null
      : ledger?.토지지목코드 ?? null,
    토지_면적: isB ? ledger?.연면적 ?? ledger?.면적 ?? null : ledger?.면적 ?? null,
    등기_소유형태: deung?.소유형태 ?? null,
    등기_명의인명: deung?.명의인명 ?? null,
    등기_접수일자: deung?.접수일자 ?? null,
    등기_토지지목코드: deung?.토지지목코드 ?? null,
    등기_면적: deung?.면적 ?? null,
    오류여부: err.yn,
    오류유형: err.type,
    표시_지목: jimokDisp,
    표시_면적: areaDisp,
  };
}

function tally(stats, err) {
  if (err.yn === '정상') stats.정상 += 1;
  else {
    stats.오류 += 1;
    const t = String(err.type);
    stats.types[t] = (stats.types[t] || 0) + 1;
  }
}

/**
 * @param {{ deunggiPath: string, gongyuPath: string, ledgerPath: string, mode?: 'land'|'building' }} paths
 * @returns {{ rows: object[], stats: object, mode: string }}
 */
function analyze(paths) {
  const mode = paths.mode === 'building' ? 'building' : 'land';
  const deungMap = loadDeunggi(paths.deunggiPath, mode);
  const gongRows = loadGongyu(paths.gongyuPath, mode);
  const ledgerMap =
    mode === 'building'
      ? loadGeonchuk(paths.ledgerPath)
      : loadToji(paths.ledgerPath);
  const classify = mode === 'building' ? classifyErrorBuilding : classifyErrorLand;

  const out = [];
  const stats = { 정상: 0, 오류: 0, types: {} };
  const gongPnuSet = new Set();

  gongRows.forEach((g) => {
    gongPnuSet.add(g.PNU);
    const ledger = ledgerMap.get(g.PNU) || null;
    const deung = deungMap.get(g.PNU) || null;
    const err = classify(true, !!ledger, !!deung);

    let jimokDisp = null;
    let areaDisp = null;
    if (err.yn === '정상') {
      const use = mode === 'building' ? g.건물용도코드 : g.토지지목코드;
      const d = compareDisplay(use, g.면적, ledger, deung, mode);
      jimokDisp = d.jimokResult;
      areaDisp = d.areaResult;
    }

    tally(stats, err);
    out.push(
      buildRow({
        seq: out.length + 1,
        pnu: g.PNU,
        g,
        ledger,
        deung,
        err,
        jimokDisp,
        areaDisp,
        mode,
      })
    );
  });

  const extraPnus = new Set([...ledgerMap.keys(), ...deungMap.keys()]);
  for (const pnu of extraPnus) {
    if (gongPnuSet.has(pnu)) continue;
    const ledger = ledgerMap.get(pnu) || null;
    const deung = deungMap.get(pnu) || null;
    const err = classify(false, !!ledger, !!deung);
    tally(stats, err);
    out.push(
      buildRow({
        seq: out.length + 1,
        pnu,
        g: null,
        ledger,
        deung,
        err,
        jimokDisp: null,
        areaDisp: null,
        mode,
      })
    );
  }

  return { rows: out, stats, mode };
}

function hexToArgb(hex) {
  const h = String(hex).replace(/^#/, '').toUpperCase();
  return `FF${h}`;
}

/** 결과 시트 섹션 배경색 (260723.md) */
const SECTION_FILLS = [
  { from: 6, to: 14, argb: hexToArgb('#d7e5f0') }, // 공유재산대장
  { from: 15, to: 19, argb: hexToArgb('#fae5dc') }, // 토지/건축물대장
  { from: 20, to: 24, argb: hexToArgb('#d9ebd2') }, // 등기전산정보
  { from: 25, to: 28, argb: hexToArgb('#dfaedb') }, // 대장오류 + 표시사항
];

const THIN_BORDER = {
  style: 'thin',
  color: { argb: 'FF000000' },
};

const CELL_BORDER = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

function applySectionFill(sheet, rowNumber, maxCol = 28) {
  for (const sec of SECTION_FILLS) {
    for (let c = sec.from; c <= Math.min(sec.to, maxCol); c++) {
      const cell = sheet.getRow(rowNumber).getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: sec.argb },
      };
      cell.border = CELL_BORDER;
    }
  }
}

/** 주소·공통 열(1~5)에도 테두리 적용 */
function applyCommonBorder(sheet, rowNumber) {
  for (let c = 1; c <= 5; c++) {
    sheet.getRow(rowNumber).getCell(c).border = CELL_BORDER;
  }
}

/**
 * multer 등에서 깨진 한글 원본 파일명 복원 시도
 */
function fixUploadFileName(name) {
  const s = String(name || '');
  if (!s) return s;
  if (/[가-힣]/.test(s)) return s;
  try {
    const decoded = Buffer.from(s, 'latin1').toString('utf8');
    if (/[가-힣]/.test(decoded)) return decoded;
  } catch (_) {}
  return s;
}

/**
 * 파일명 → { kind, region }
 * 예: 부동산등기부_과천시.xlsx, 1.공유재산대장_토지.csv, 건축물대장_성남시.xlsx
 */
function parseMacroFileName(filename) {
  const fixed = fixUploadFileName(filename);
  const base = path
    .basename(fixed)
    .replace(/\.(csv|xlsx|xls)$/i, '')
    .trim();
  if (!base) return null;

  let kind = null;
  if (/건축물대장/.test(base)) kind = 'geonchuk';
  else if (/토지대장/.test(base)) kind = 'toji';
  else if (/공유재산/.test(base)) kind = 'gongyu';
  else if (/부동산등기부|등기부/.test(base)) kind = 'deunggi';
  else return null;

  const parts = base
    .split('_')
    .map((p) => p.trim())
    .filter(Boolean);
  const region = parts.length >= 2 ? parts[parts.length - 1] : '기본';
  return { kind, region, base };
}

/**
 * 업로드 파일 배열을 지역별 분석 세트로 묶음
 * @param {Array<{ originalname: string, path: string }>} files
 * @param {'land'|'building'} mode
 */
function groupMacroUploads(files, mode) {
  const groups = new Map();
  for (const f of files || []) {
    const parsed = parseMacroFileName(f.originalname);
    if (!parsed) continue;
    if (mode === 'land' && parsed.kind === 'geonchuk') continue;
    if (mode === 'building' && parsed.kind === 'toji') continue;

    if (!groups.has(parsed.region)) {
      groups.set(parsed.region, { region: parsed.region });
    }
    const g = groups.get(parsed.region);
    if (g[parsed.kind]) {
      throw new Error(
        `${parsed.region}: ${parsed.kind} 파일이 중복입니다 (${fixUploadFileName(
          f.originalname
        )})`
      );
    }
    g[parsed.kind] = f;
  }

  const errors = [];
  const sets = [];
  for (const [region, g] of groups) {
    const missing = [];
    if (!g.deunggi) missing.push('부동산등기부');
    if (!g.gongyu) missing.push('공유재산대장');
    const ledger = mode === 'building' ? g.geonchuk : g.toji;
    if (!ledger) missing.push(mode === 'building' ? '건축물대장' : '토지대장');
    if (missing.length) {
      errors.push(`${region}: ${missing.join(', ')} 없음`);
      continue;
    }
    sets.push({
      region,
      deunggiPath: g.deunggi.path,
      gongyuPath: g.gongyu.path,
      ledgerPath: ledger.path,
      mode,
    });
  }

  if (!sets.length) {
    throw new Error(
      errors.length
        ? errors.join('\n')
        : '인식 가능한 장부 파일이 없습니다. 파일명 예: 부동산등기부_과천시.xlsx'
    );
  }
  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  sets.sort((a, b) => a.region.localeCompare(b.region, 'ko'));
  return sets;
}

async function writeAnalysisWorkbook({ rows, mode, outputPath }) {
  const workbook = new Excel.Workbook();
  workbook.creator = '공적장부 비교대사 자동화';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('분석');

  const isB = mode === 'building';
  const r1 = sheet.getRow(1);
  r1.getCell(4).value = '주소';
  r1.getCell(6).value = isB ? '건물공유재산대장' : '토지공유재산대장';
  r1.getCell(15).value = isB ? '건축물대장' : '토지대장';
  r1.getCell(20).value = isB ? '건물등기전산정보' : '등기전산정보';
  r1.getCell(25).value = '대장오류';
  r1.getCell(27).value = '표시사항 불일치';
  r1.getCell(31).value = '오류사항표';
  applyCommonBorder(sheet, 1);
  applySectionFill(sheet, 1);

  const headers = isB
    ? [
        '순번',
        '새올인증여부',
        '재산명',
        'PNU',
        '소재지',
        '재산번호',
        '입력시스템',
        '소유구분코드',
        '재산용코드',
        '행정재산코드',
        '재산관리관코드',
        '취득일자',
        '건물용도코드',
        '연면적',
        '건물명',
        '소유자명',
        '사용승인일자',
        '주용도코드명',
        '연면적',
        '소유형태',
        '명의인명',
        '접수일자',
        '지목',
        '면적',
        '오류여부',
        '오류유형',
        '용도',
        '면적',
      ]
    : [
        '순번',
        '새올인증여부',
        '재산명',
        'PNU',
        '소재지',
        '재산번호',
        '입력시스템',
        '소유구분코드',
        '재산용코드',
        '행정재산코드',
        '재산관리관코드',
        '취득일자',
        '토지지목코드',
        '면적',
        '소유구분',
        '소유자명',
        '소유권변경일자',
        '토지지목코드',
        '면적',
        '소유형태',
        '명의인명',
        '접수일자',
        '토지지목코드',
        '면적',
        '오류여부',
        '오류유형',
        '지목',
        '면적',
      ];
  const r2 = sheet.getRow(2);
  headers.forEach((h, i) => {
    r2.getCell(i + 1).value = h;
    r2.getCell(i + 1).font = { bold: true };
  });
  applyCommonBorder(sheet, 2);
  applySectionFill(sheet, 2);

  const legend = isB ? ERROR_LEGEND_BUILDING : ERROR_LEGEND_LAND;
  legend.forEach(([num, label], i) => {
    const legendRow = sheet.getRow(2 + i);
    legendRow.getCell(31).value = num;
    legendRow.getCell(32).value = label;
    legendRow.getCell(31).border = CELL_BORDER;
    legendRow.getCell(32).border = CELL_BORDER;
  });

  rows.forEach((row, idx) => {
    const r = sheet.getRow(3 + idx);
    const vals = [
      row.순번,
      row.새올인증여부,
      row.재산명,
      row.PNU,
      row.소재지,
      row.재산번호,
      row.입력시스템,
      row.소유구분코드,
      row.재산용코드,
      row.행정재산코드,
      row.재산관리관코드,
      row.취득일자,
      row.공유_토지지목코드,
      row.공유_면적,
      row.토지_소유구분,
      row.토지_소유자명,
      row.토지_소유권변경일자,
      row.토지_토지지목코드,
      row.토지_면적,
      row.등기_소유형태,
      row.등기_명의인명,
      row.등기_접수일자,
      row.등기_토지지목코드,
      row.등기_면적,
      row.오류여부,
      row.오류유형,
      row.표시_지목,
      row.표시_면적,
    ];
    vals.forEach((v, i) => {
      const cell = r.getCell(i + 1);
      if (v == null) {
        cell.value = null;
      } else if (i === 3) {
        // PNU(4열)는 반드시 텍스트 — 숫자로 쓰면 4.12901E+18 로 깨짐
        cell.value = String(v);
        cell.numFmt = '@';
      } else {
        cell.value = v;
      }
    });
    applyCommonBorder(sheet, 3 + idx);
    applySectionFill(sheet, 3 + idx);
  });

  await workbook.xlsx.writeFile(outputPath);
}

/**
 * @param {{ deunggiPath: string, gongyuPath: string, ledgerPath?: string, tojiPath?: string, mode?: 'land'|'building' }} paths
 * @param {string} outputPath
 */
async function analyzeToXlsx(paths, outputPath) {
  const mode =
    paths.mode === 'building' || paths.ledgerKind === 'building'
      ? 'building'
      : 'land';
  const ledgerPath = paths.ledgerPath || paths.tojiPath;
  if (!ledgerPath) throw new Error('토지대장 또는 건축물대장 파일이 필요합니다.');

  const { rows, stats } = analyze({
    deunggiPath: paths.deunggiPath,
    gongyuPath: paths.gongyuPath,
    ledgerPath,
    mode,
  });

  await writeAnalysisWorkbook({ rows, mode, outputPath });
  return { outputPath, stats, rowCount: rows.length };
}

/**
 * 시군구별 결과분석_{지역}.xlsx 목록 생성
 * @param {Array<{ deunggiPath: string, gongyuPath: string, ledgerPath: string, mode?: string, region?: string }>} pathSets
 * @param {string} outputDir
 */
async function analyzeBatchToRegionFiles(pathSets, outputDir) {
  if (!Array.isArray(pathSets) || !pathSets.length) {
    throw new Error('분석할 지역 세트가 없습니다.');
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const mode = pathSets[0].mode === 'building' ? 'building' : 'land';
  const files = [];
  const statsAll = { 정상: 0, 오류: 0, types: {} };
  const regions = [];

  for (const set of pathSets) {
    const setMode = set.mode === 'building' ? 'building' : mode;
    if (setMode !== mode) {
      throw new Error('배치 분석은 토지/건물을 섞을 수 없습니다.');
    }
    const region = String(set.region || '기본').replace(/[\\/:*?"<>|]/g, '_');
    const outPath = path.join(outputDir, `결과분석_${region}.xlsx`);
    const result = await analyzeToXlsx(
      {
        deunggiPath: set.deunggiPath,
        gongyuPath: set.gongyuPath,
        ledgerPath: set.ledgerPath,
        mode,
      },
      outPath
    );
    files.push(outPath);
    regions.push(region);
    statsAll.정상 += result.stats.정상 || 0;
    statsAll.오류 += result.stats.오류 || 0;
    for (const [k, v] of Object.entries(result.stats.types || {})) {
      statsAll.types[k] = (statsAll.types[k] || 0) + v;
    }
  }

  return { files, regions, stats: statsAll };
}

/**
 * 시군구별 xlsx를 zip으로 묶어 저장 (JSZip 사용 가능 시)
 */
async function analyzeBatchToZip(pathSets, zipPath) {
  let JSZip;
  try {
    JSZip = require('jszip');
  } catch (_) {
    throw new Error('배치 zip 생성을 위해 jszip 패키지가 필요합니다.');
  }
  const tmpDir = path.join(
    path.dirname(zipPath),
    `macro_batch_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    const { files, regions, stats } = await analyzeBatchToRegionFiles(
      pathSets,
      tmpDir
    );
    const zip = new JSZip();
    for (const f of files) {
      zip.file(path.basename(f), fs.readFileSync(f));
    }
    const buf = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(zipPath, buf);
    return { outputPath: zipPath, regions, stats, fileCount: files.length };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

module.exports = {
  analyze,
  analyzeToXlsx,
  analyzeBatchToRegionFiles,
  analyzeBatchToZip,
  parseMacroFileName,
  groupMacroUploads,
  fixUploadFileName,
  normPnu,
  loadDeunggi,
  loadGongyu,
  loadToji,
  loadGeonchuk,
};
