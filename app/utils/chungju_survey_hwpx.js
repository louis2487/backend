const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const {
  val,
  nowDate,
  extractJibun,
  resolveManageNo,
  resolveSojaeji,
} = require('./chungju_survey_fields');

const TEMPLATE_PATH = path.resolve(__dirname, '../templates/0724.hwpx');

function normalize(s) {
  return String(s || '')
    .replace(/\s+/g, '')
    .trim();
}

function escapeXml(s) {
  return String(s == null ? '' : s)
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

/** 정규화 전 원문 (자간용 띄어쓰기 포함) */
function cellTextRaw(inner) {
  const parts = [];
  const re = /<hp:t(?:\s[^>]*)?>([^<]*)<\/hp:t>/g;
  let m;
  while ((m = re.exec(inner))) parts.push(m[1]);
  return parts.join('');
}

/** `관 리 번 호`처럼 한 글자씩 띄어쓴 문자열 → `관리번호` */
function collapseCharSpaces(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  const parts = t.split(/\s+/);
  if (parts.length >= 2 && parts.every((p) => [...p].length === 1)) {
    return parts.join('');
  }
  return t;
}

/** 값 셀: 가로쓰기 + 한 줄 유지. lineseg 는 유지(삭제 시 한글이 행 높이를 키움) */
function applyHorizontalText(inner) {
  let result = inner.replace(
    /textDirection="[^"]*"/g,
    'textDirection="HORIZONTAL"'
  );
  // BREAK면 좁은 칸에서 한 글자씩 세로로 쌓임 → SQUEEZE로 한 줄 유지
  result = result.replace(/lineWrap="[^"]*"/g, 'lineWrap="SQUEEZE"');
  return result;
}

/**
 * 값 기록 후 lineseg 가 없으면 템플릿과 같은 단일 라인 seg 복구
 * (사용현황 등 좁은 칸에서 행 높이 팽창 방지)
 */
function ensureSingleLineSeg(inner) {
  if (/<hp:linesegarray>[\s\S]*?<\/hp:linesegarray>/.test(inner)) {
    return inner;
  }
  const width = Number((inner.match(/<hp:cellSz[^>]*width="(\d+)"/) || [])[1] || 5530);
  const height = Number((inner.match(/<hp:cellSz[^>]*height="(\d+)"/) || [])[1] || 2180);
  const vert = Math.min(1171, Math.max(800, Math.floor(height * 0.54)));
  const horz = Math.max(1000, width - 210);
  const baseline = Math.floor(vert * 0.77);
  const seg =
    `<hp:linesegarray><hp:lineseg textpos="0" vertpos="440" vertsize="${vert}" ` +
    `textheight="${vert}" baseline="${baseline}" spacing="0" horzpos="210" ` +
    `horzsize="${horz}" flags="393216"/></hp:linesegarray>`;
  // 첫 문단의 run 뒤에 삽입
  if (/<\/hp:run>\s*<\/hp:p>/.test(inner)) {
    return inner.replace(/<\/hp:run>(\s*)<\/hp:p>/, `</hp:run>$1${seg}</hp:p>`);
  }
  return inner;
}

/**
 * 기본: 좌측(paraPr 97 LEFT), 지정 항목만 가운데(paraPr 32 CENTER)
 * charPr 6=작은글씨(표 칸)
 */
const STYLE_LEFT = { charPr: '6', paraPr: '97' };
const STYLE_CENTER = { charPr: '6', paraPr: '32' };

const CENTER_VALUE_LABELS = new Set([]); // 값 칸 가운데 정렬 미사용

/** 짧은 값 — 앞에 공백 5칸 */
function withIndent5(text) {
  const t = String(text == null ? '' : text).trim();
  if (!t) return '';
  return '     ' + t;
}

function applyValueStyle(inner, align = 'left') {
  const style = align === 'center' ? STYLE_CENTER : STYLE_LEFT;
  let result = inner.replace(
    /charPrIDRef="\d+"/g,
    `charPrIDRef="${style.charPr}"`
  );
  result = result.replace(
    /paraPrIDRef="\d+"/g,
    `paraPrIDRef="${style.paraPr}"`
  );
  return result;
}

/** 값 셀 세로 가운데(상하 중앙) */
function applyVerticalCenter(inner) {
  if (/vertAlign="/.test(inner)) {
    return inner.replace(/vertAlign="[^"]*"/g, 'vertAlign="CENTER"');
  }
  return inner.replace(
    /(<hp:subList\b[^>]*)(>)/,
    '$1 vertAlign="CENTER"$2'
  );
}

/** 2페이지 관리번호·소재지 값 — 템플릿 문단·lineseg 유지하며 값 문단만 갱신 */
function setHeaderValueCellText(inner, text, kind = 'headerValue') {
  const escaped = escapeXml(text);
  const result = applyHorizontalText(inner);

  const subListRe = /(<hp:subList)([^>]*>)([\s\S]*?)(<\/hp:subList>)/;
  const subListMatch = result.match(subListRe);
  if (!subListMatch) {
    return setCellText(inner, text, 'left');
  }

  const paragraphs = [...subListMatch[3].matchAll(/<hp:p\b[^>]*>[\s\S]*?<\/hp:p>/g)];
  if (!paragraphs.length) {
    return setCellText(inner, text, 'left');
  }

  // 관리번호: 2문단(빈 + 값) / 소재지: 1문단
  let targetIdx;
  if (kind !== 'headerSojaeji' && paragraphs.length >= 2) {
    targetIdx = 1;
  } else {
    targetIdx = paragraphs.findIndex((p) => /paraPrIDRef="80"/.test(p[0]));
    if (targetIdx < 0) targetIdx = paragraphs.length - 1;
  }

  const targetPara = paragraphs[targetIdx][0];
  const charPrId =
    (targetPara.match(/charPrIDRef="(\d+)"/) || [])[1] ||
    (inner.match(/paraPrIDRef="80"[\s\S]*?charPrIDRef="(\d+)"/) || [])[1] ||
    '25';
  const linesegXml =
    (targetPara.match(/<hp:linesegarray>[\s\S]*?<\/hp:linesegarray>/) || [])[0] || '';
  const paraOpen = targetPara.match(/<hp:p\b[^>]*>/)[0];

  const newPara =
    `${paraOpen}<hp:run charPrIDRef="${charPrId}"><hp:t>${escaped}</hp:t></hp:run>` +
    `${linesegXml}</hp:p>`;

  let newBody = subListMatch[3].replace(targetPara, newPara);
  let newSubList = `${subListMatch[1]}${subListMatch[2]}${newBody}${subListMatch[4]}`;
  // 관리번호는 템플릿 2문단(빈줄+값) 구조 유지 — 세로 가운데 적용 시 한 줄 내려감
  if (kind === 'headerSojaeji') {
    newSubList = applyVerticalCenter(newSubList);
  }

  return result.replace(subListRe, newSubList);
}

function setCellText(inner, text, align = 'left') {
  if (align === 'headerValue' || align === 'headerSojaeji') {
    return setHeaderValueCellText(inner, text, align);
  }
  const escaped = escapeXml(text);
  let result = applyHorizontalText(inner);

  // 기존 텍스트 비우기
  result = result.replace(
    /<hp:t(\s[^>]*)?>[^<]*<\/hp:t>/g,
    '<hp:t$1></hp:t>'
  );

  // 첫 번째 run에만 값 기록 (2번째 빈 문단으로 높이 어긋남 방지)
  let placed = false;
  result = result.replace(/<hp:run([^>]*)\/>/, (match, attrs) => {
    if (placed) return match;
    placed = true;
    return `<hp:run${attrs}><hp:t>${escaped}</hp:t></hp:run>`;
  });
  if (!placed) {
    result = result.replace(
      /<hp:t(\s[^>]*)?><\/hp:t>/,
      (match, attrs) => {
        if (placed) return match;
        placed = true;
        return `<hp:t${attrs || ''}>${escaped}</hp:t>`;
      }
    );
  }
  if (!placed && /<hp:run([^>]*)>/.test(result)) {
    result = result.replace(
      /<hp:run([^>]*)>/,
      `<hp:run$1><hp:t>${escaped}</hp:t>`
    );
    placed = true;
  }

  // 좌측 정렬 유지 + 셀 세로 가운데
  if (align === 'left') {
    result = result.replace(/paraPrIDRef="\d+"/g, 'paraPrIDRef="97"');
  } else if (align === 'center') {
    result = result.replace(/paraPrIDRef="\d+"/g, 'paraPrIDRef="32"');
  }
  result = applyVerticalCenter(result);
  // 사용현황 등: lineseg 없으면 한글이 칸 높이를 다시 키움 → 단일 라인 seg 보장
  return ensureSingleLineSeg(result);
}

/** 라벨(정규화) → DB 값 */
function buildLabelValues(row) {
  const d = row || {};
  const map = {
    지번: extractJibun(val(d, 'col_b') || val(d, 'addr')),
    공부지목: val(d, 'col_d'),
    '공부면적(㎡)': val(d, 'col_e') || val(d, 'land_area'),
    // 도로명 별도 값이 없으면 빈칸 (전체주소에서 도로명을 추정하지 않음)
    도로명: '',
    현황지목: val(d, 'col_ac'),
    '실면적(㎡)': val(d, 'col_g'),
    용도지역: val(d, 'col_h'),
    토지이용상황: val(d, 'col_k'),
    도로접면: val(d, 'col_l'),
    지형높이: val(d, 'col_m'),
    지형형상: val(d, 'col_n'),
    기준년도: val(d, 'col_q'),
    재산기준가격: val(d, 'col_r'),
    개별공시지가: val(d, 'col_s'),
    표준지공시지가: val(d, 'col_t'),
    재산구분: val(d, 'col_u'),
    회계구분: val(d, 'col_v'),
    재산관리관: val(d, 'col_w'),
    분업관리관: val(d, 'col_x'),
    분임관리관: val(d, 'col_x'),
    위임관리관: val(d, 'col_y'),
    재산번호: val(d, 'col_z'),
    공유지분: val(d, 'col_aa'),
    공유인수: val(d, 'col_ab'),
    소유권변동일자: val(d, 'col_o'),
    소유권변동원인: val(d, 'col_p'),
    취득일자: val(d, 'col_ad'),
    취득부서: val(d, 'col_j'),
    취득방법: val(d, 'col_i'),
    취득가액: val(d, 'col_c'),
    취득사유: '',
    취득면적: '',
    국토계획법상: val(d, 'col_ae'),
    기타법령상: val(d, 'col_af'),
    토지이용규제기본법시행령제9조제4항각호: '',
    도시계획사업: '',
    개발사업: '',
    대부여부: withIndent5(val(d, 'col_ag')),
    피대부자수: withIndent5(val(d, 'col_ap')),
    무단점유여부: withIndent5(val(d, 'col_aq')),
    무단점유자수: withIndent5(val(d, 'col_ar')),
    위치: resolveSojaeji(d),
    주변현황: val(d, 'col_be'),
    활용방안: val(d, 'col_bf'),
    특기사항: val(d, 'col_bg'),
    특이사항: val(d, 'col_bg'),
    종합의견: val(d, 'col_bh'),
    조사자: '',
    조사일자: nowDate(),
    확인자: '',
    확인일자: '',
    관리번호: resolveManageNo(d),
    소재지: resolveSojaeji(d),
  };
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    out[normalize(k)] = v == null ? '' : String(v);
  }
  return out;
}

/** 대부현황 첫 데이터 행 (헤더 8칸 다음) — qu/앱 슬롯과 동일 */
function daebuRowValues(row) {
  const d = row || {};
  return [
    withIndent5(val(d, 'col_ah')), // 적합여부
    val(d, 'col_ai'), // 사용자명
    val(d, 'col_ax'), // 용도
    val(d, 'col_at'), // 면적
    val(d, 'col_al'), // 사용시작일
    val(d, 'col_am'), // 사용종료일
    val(d, 'col_an'), // 대부료
    val(d, 'col_au'), // 시설물
  ];
}

/** 무단점유 첫 데이터 행 — qu/앱 슬롯과 동일 */
function mudanRowValues(row) {
  const d = row || {};
  return [
    withIndent5(val(d, 'col_av')), // 점유현황
    val(d, 'col_aw'), // 점유자명
    val(d, 'col_az'), // 용도
    val(d, 'col_ba'), // 면적
    val(d, 'col_ay'), // 점유시작일
    val(d, 'col_bb'), // 점유종료일
    val(d, 'col_bc'), // 변상금
    val(d, 'col_bd'), // 시설물
  ];
}

/**
 * 1페이지 하단 조사자 표 — 본표와 좌측·전체폭 일치 + 셀폭 합 보정.
 * (표 sz만 맞추고 셀 합이 다르면 모바일 한컴에서 행이 살짝 밀림)
 */
function alignInvestigatorTable(xml) {
  const mainOff =
    (xml.match(/기본정보[\s\S]{0,800}?horzOffset="(\d+)"/) || [])[1] || '2410';
  const mainW = Number(
    (xml.match(/<hp:sz width="(\d+)" widthRelTo="ABSOLUTE" height="61275"/) ||
      [])[1] || 50425
  );

  return xml.replace(/<hp:tbl\b[^>]*>[\s\S]*?<\/hp:tbl>/g, (tbl) => {
    if (!/\bcolCnt="8"/.test(tbl)) return tbl;
    const plain = tbl.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    if (!plain.includes('조사자') && !plain.includes('조사일자')) return tbl;

    let out = tbl.replace(/\bnoAdjust="0"/, 'noAdjust="1"');
    out = out.replace(
      /(<hp:sz width=")(\d+)(" widthRelTo="ABSOLUTE" height="2190")/,
      `$1${mainW}$3`
    );
    out = out.replace(/(horzOffset=")(\d+)(")/, `$1${mainOff}$3`);

    const widths = [...out.matchAll(/<hp:cellSz width="(\d+)"/g)].map((m) =>
      Number(m[1])
    );
    if (!widths.length) return out;
    const sum = widths.reduce((a, b) => a + b, 0);
    if (sum === mainW) return out;

    const scaled = widths.map((w) => Math.max(1, Math.round((w * mainW) / sum)));
    const scaledSum = scaled.reduce((a, b) => a + b, 0);
    scaled[scaled.length - 1] += mainW - scaledSum;

    let i = 0;
    return out.replace(/<hp:cellSz width="\d+"/g, () => {
      const w = scaled[i++];
      return `<hp:cellSz width="${w}"`;
    });
  });
}

/** 조사자 표와 관리번호 표 사이 빈 줄(템플릿 여백용) — pageBreak 적용 시 제거 */
function removeManageTableSpacerParagraphs(xml) {
  return xml.replace(
    /<hp:p id="0" paraPrIDRef="77" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="8"\/><hp:linesegarray><hp:lineseg[^/]*\/><\/hp:linesegarray><\/hp:p>/g,
    ''
  );
}

/** 관리번호·소재지 표 앞 강제 쪽나눔 — 데스크탑 1페이지 침범 방지 */
function ensurePageBreakBeforeManageTable(xml) {
  const marker =
    /관<\/hp:t>[\s\S]{0,240}?리<\/hp:t>[\s\S]{0,240}?번<\/hp:t>[\s\S]{0,240}?호<\/hp:t>/;
  const mi = xml.search(marker);
  if (mi < 0) return xml;

  const before = xml.slice(0, mi);
  const tblIdx = before.lastIndexOf('<hp:tbl');
  if (tblIdx < 0) return xml;
  const pIdx = before.lastIndexOf('<hp:p ', tblIdx);
  if (pIdx < 0) return xml;

  const pOpenEnd = xml.indexOf('>', pIdx);
  if (pOpenEnd < 0) return xml;
  const pOpen = xml.slice(pIdx, pOpenEnd + 1);
  if (/\bpageBreak="1"/.test(pOpen)) return xml;

  return (
    xml.slice(0, pIdx) +
    pOpen.replace(/\bpageBreak="0"/, 'pageBreak="1"') +
    xml.slice(pOpenEnd + 1)
  );
}

function bindSectionXml(xml, row) {
  xml = alignInvestigatorTable(xml);
  xml = removeManageTableSpacerParagraphs(xml);
  xml = ensurePageBreakBeforeManageTable(xml);
  const labelValues = buildLabelValues(row);
  const re = /<hp:tc(\b[^>]*)>([\s\S]*?)<\/hp:tc>/g;
  const cells = [];
  let m;
  while ((m = re.exec(xml))) {
    const raw = cellTextRaw(m[2]);
    cells.push({
      fullStart: m.index,
      fullEnd: m.index + m[0].length,
      attrs: m[1],
      inner: m[2],
      text: normalize(raw),
      raw,
      hasPic: m[2].includes('<hp:pic'),
    });
  }

  const setIdx = new Map(); // cellIndex -> { text, align }
  const HEADER_VALUE_KIND = {
    [normalize('관리번호')]: 'headerValue',
    [normalize('소재지')]: 'headerSojaeji',
  };

  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (c.hasPic) continue;

    // 관리번호/소재지 라벨은 템플릿 원문 유지 (강제 재작성 시 글자 깨짐·겹침 발생)

    if (Object.prototype.hasOwnProperty.call(labelValues, c.text) && i + 1 < cells.length) {
      const next = cells[i + 1];
      if (!next.hasPic) {
        setIdx.set(i + 1, {
          text: labelValues[c.text],
          align: HEADER_VALUE_KIND[c.text] || 'left',
        });
      }
    }
  }

  // 대부현황조사결과 헤더 블록 다음 8칸
  const daebuHeader = normalize('대부현황조사결과');
  const mudanHeader = normalize('무단점유조사결과');
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].text === daebuHeader) {
      // 헤더 8칸: i+1 .. i+8, 데이터: i+9 .. i+16
      const vals = daebuRowValues(row);
      for (let k = 0; k < 8; k++) {
        const idx = i + 9 + k;
        if (idx < cells.length && !cells[idx].hasPic) {
          setIdx.set(idx, {
            text: vals[k] || '',
            align: 'left',
          });
        }
      }
    }
    if (cells[i].text === mudanHeader) {
      const vals = mudanRowValues(row);
      for (let k = 0; k < 8; k++) {
        const idx = i + 9 + k;
        if (idx < cells.length && !cells[idx].hasPic) {
          setIdx.set(idx, {
            text: vals[k] || '',
            align: 'left',
          });
        }
      }
    }
  }

  let out = '';
  let cursor = 0;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    out += xml.slice(cursor, c.fullStart);
    let inner = c.inner;
    if (setIdx.has(i) && !c.hasPic) {
      const entry = setIdx.get(i);
      inner = setCellText(inner, entry.text, entry.align);
    }
    out += `<hp:tc${c.attrs}>${inner}</hp:tc>`;
    cursor = c.fullEnd;
  }
  out += xml.slice(cursor);
  return out;
}


const BACK_ROOT = path.resolve(__dirname, '../..');

// ── uploads/img 파일명 인덱스 (매 export마다 전수 스캔하던 것을 캐시로 대체) ──
const IMG_INDEX_TTL_MS = 60 * 1000; // 60초간 캐시 재사용
const IMG_INDEX_MAX_DEPTH = 3;
let _imgIndex = null; // Map<소문자 파일명, 최초 매칭 fullpath>
let _imgIndexAt = 0;

function walkImageIndex(dir, depth, index) {
  if (depth < 0) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isFile()) {
      const key = ent.name.toLowerCase();
      if (!index.has(key)) index.set(key, full); // 먼저 발견된 경로 유지
    } else if (ent.isDirectory()) {
      walkImageIndex(full, depth - 1, index);
    }
  }
}

/** uploads/img 하위 파일명 → 경로 인덱스 (TTL 캐시) */
function getImageIndex() {
  const now = Date.now();
  if (_imgIndex && now - _imgIndexAt < IMG_INDEX_TTL_MS) return _imgIndex;
  const index = new Map();
  const root = path.resolve(BACK_ROOT, 'uploads', 'img');
  try {
    if (fs.existsSync(root)) walkImageIndex(root, IMG_INDEX_MAX_DEPTH, index);
  } catch (_) {}
  _imgIndex = index;
  _imgIndexAt = now;
  return index;
}

/** 파일명만으로 실제 경로 조회 (전수 스캔 없이 캐시 인덱스 사용) */
function lookupImageByName(name) {
  if (!name) return null;
  return getImageIndex().get(String(name).toLowerCase()) || null;
}

function detectImageKind(buf) {
  if (!buf || buf.length < 12) return 'unknown';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  // RIFF....WEBP
  if (
    buf.slice(0, 4).toString('ascii') === 'RIFF' &&
    buf.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return 'unknown';
}

/** 한글 BinData는 JPEG만 안정 — WebP/PNG 등을 JPEG로 변환 */
async function ensureJpegBytes(bytes, filePath) {
  const kind = detectImageKind(bytes);
  if (kind === 'jpeg') return bytes;
  try {
    const sharp = require('sharp');
    const out = await sharp(bytes).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    console.log(
      '[hwpx] converted',
      kind,
      '-> jpeg',
      filePath || '',
      bytes.length + 'B -> ' + out.length + 'B'
    );
    return out;
  } catch (e) {
    console.warn('[hwpx] jpeg convert failed:', filePath, kind, e.message);
    return null;
  }
}

/** DB img_path + img_name → 실제 파일 (여러 경로 후보) */
function resolveImageFile(img) {
  if (!img) return null;
  const rawPath = String(img.img_path || img.IMG_PATH || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
  const name = String(img.img_name || img.IMG_NAME || '').trim();
  if (!name) return null;

  const uploadsIdx = rawPath.toLowerCase().indexOf('/uploads/');
  const uploadsIdx2 = rawPath.toLowerCase().indexOf('uploads/');
  const relFromUploads =
    uploadsIdx >= 0
      ? rawPath.slice(uploadsIdx + 1)
      : uploadsIdx2 === 0
        ? rawPath
        : null;

  const candidates = [];
  const push = (p) => {
    if (p && !candidates.includes(p)) candidates.push(p);
  };

  // 절대경로
  if (path.isAbsolute(rawPath) || /^[A-Za-z]:\//.test(rawPath)) {
    push(path.join(rawPath, name));
    if (rawPath.endsWith(name)) push(rawPath);
    // Windows 절대경로 → 서버에서는 uploads 상대만 유효한 경우
    if (relFromUploads) {
      push(path.resolve(BACK_ROOT, relFromUploads, name));
    }
  }

  push(path.resolve(BACK_ROOT, rawPath, name));
  push(path.resolve(BACK_ROOT, rawPath.replace(/^\.\//, ''), name));
  push(path.resolve(process.cwd(), rawPath, name));
  push(path.resolve(process.cwd(), 'back', rawPath, name));
  if (relFromUploads) {
    push(path.resolve(BACK_ROOT, relFromUploads, name));
    push(path.resolve(process.cwd(), relFromUploads, name));
  }
  // img_path 없이 uploads/img/파일명
  push(path.resolve(BACK_ROOT, 'uploads', 'img', name));
  if (rawPath && !rawPath.toLowerCase().includes('uploads')) {
    push(path.resolve(BACK_ROOT, 'uploads', rawPath, name));
  }
  if (rawPath.endsWith(name)) {
    push(path.resolve(BACK_ROOT, rawPath));
    push(path.resolve(process.cwd(), rawPath));
  }

  const readIfFile = (filePath) => {
    try {
      if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const bytes = fs.readFileSync(filePath);
        if (bytes && bytes.length > 0) return { bytes, filePath };
      }
    } catch (_) {}
    return null;
  };

  // 1) 직접 경로 후보 우선 (여기서 맞으면 인덱스 조회/스캔 자체를 생략)
  for (const filePath of candidates) {
    const hit = readIfFile(filePath);
    if (hit) return hit;
  }

  // 2) fallback: 파일명 인덱스(캐시)로 조회 — 매 호출 전수 스캔 방지
  try {
    const found = lookupImageByName(name);
    const hit = found ? readIfFile(found) : null;
    if (hit) return hit;
  } catch (_) {}

  console.warn(
    '[hwpx] image not found:',
    name,
    'img_path=',
    rawPath,
    'tried=',
    candidates.length,
    'BACK_ROOT=',
    BACK_ROOT
  );
  return null;
}

/** @deprecated 호환용 */
function resolveImageBytes(img) {
  const r = resolveImageFile(img);
  return r ? r.bytes : null;
}

/** 현장사진 없을 때 슬롯용 흰색 JPEG (640×480, 유효 JPEG) */
const BLANK_JPEG = Buffer.from(
  '/9j/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAHgAoADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=',
  'base64'
);

/** zip 내 텍스트 파일에서 imageN 확장자·media-type 일괄 교체 */
function retargetImageRefs(text, slot, ext) {
  if (!text || typeof text !== 'string') return text;
  const n = String(slot);
  let out = text
    .split('image' + n + '.jpeg')
    .join('image' + n + '.' + ext)
    .split('image' + n + '.jpg')
    .join('image' + n + '.' + ext)
    .split('image' + n + '.png')
    .join('image' + n + '.' + ext);
  const media = ext === 'png' ? 'image/png' : 'image/jpeg';
  out = out.replace(
    new RegExp('(id="image' + n + '"[^>]*media-type=")image/(?:jpeg|png|jpg)(")', 'gi'),
    '$1' + media + '$2'
  );
  return out;
}

/** 슬롯 1~4 현장사진 → JPEG 바이트 (없으면 빈칸) */
async function prepareSlotImages(images) {
  const imgs = (Array.isArray(images) ? images : []).slice(0, 4);
  const slotFiles = [];
  for (let i = 0; i < 4; i++) {
    const resolved = imgs[i] ? resolveImageFile(imgs[i]) : null;
    if (!resolved) {
      slotFiles.push({ slot: i + 1, ext: 'jpeg', bytes: BLANK_JPEG });
      console.warn('[hwpx] slot ' + (i + 1) + ' empty (blank jpeg)');
      continue;
    }
    const jpegBytes = await ensureJpegBytes(resolved.bytes, resolved.filePath);
    if (!jpegBytes) {
      slotFiles.push({ slot: i + 1, ext: 'jpeg', bytes: BLANK_JPEG });
      console.warn('[hwpx] slot ' + (i + 1) + ' convert failed, blank');
      continue;
    }
    slotFiles.push({ slot: i + 1, ext: 'jpeg', bytes: jpegBytes });
    console.log(
      '[hwpx] slot ' + (i + 1) + ' JPEG <- ' + resolved.filePath + ' (' + jpegBytes.length + 'B)'
    );
  }
  return slotFiles;
}

/** 합본용: image1~4 → image(offset+1)~(offset+4) */
function remapImageIds(text, offset) {
  if (!text || !offset) return text;
  return String(text)
    .replace(/binaryItemIDRef="image([1-4])"/g, (_, n) => {
      return 'binaryItemIDRef="image' + (offset + Number(n)) + '"';
    })
    .replace(/\bimage([1-4])\.(jpeg|jpg|png)\b/gi, (_, n, ext) => {
      return 'image' + (offset + Number(n)) + '.' + ext;
    })
    .replace(/\bid="image([1-4])"/g, (_, n) => {
      return 'id="image' + (offset + Number(n)) + '"';
    });
}

/**
 * 하단 가운데 쪽번호(-1-, -2- …) 자동 삽입
 * - hp:pageNum (쪽 번호 위치) + footer 영역 여유
 * @param {string} sectionXml
 * @param {{ startPage?: number }} [opts] startPage=1 이면 이 구역부터 1로 시작, 0이면 이어쓰기
 */
function ensureBottomPageNumber(sectionXml, opts = {}) {
  let xml = String(sectionXml || '');
  if (!xml) return xml;

  const startPage = opts.startPage == null ? 1 : Number(opts.startPage);

  // 시작 쪽번호 (0=이어쓰기)
  if (/<hp:startNum\b/.test(xml)) {
    xml = xml.replace(
      /(<hp:startNum\b[^>]*\bpage=")[^"]*(")/,
      '$1' + (Number.isFinite(startPage) ? startPage : 1) + '$2'
    );
  }

  // 바닥글 영역: 쪽번호 하단 위치
  const FOOTER_HWPUNIT = 400;
  xml = xml.replace(
    /(<hp:margin\b[^>]*\bfooter=")[^"]*(")/,
    (_, a, b) => a + FOOTER_HWPUNIT + b
  );

  // 쪽번호 글자 크기: charPr 6 ≈ 9pt (0 ≈ 20pt)
  xml = xml.replace(
    /(<hp:run\b[^>]*\bcharPrIDRef=")[^"]*("[^>]*>\s*<hp:ctrl>\s*<hp:pageNum\b)/g,
    '$16$2'
  );

  if (/<hp:pageNum\b/.test(xml)) return xml;

  // 쪽 번호 위치 컨트롤: 하단 가운데, 꾸밈문자 "-" → -1-, -2-
  const pageNumRun =
    '<hp:run charPrIDRef="6">' +
    '<hp:ctrl>' +
    '<hp:pageNum format="DIGIT" pos="BOTTOM_CENTER" sideChar="-"/>' +
    '</hp:ctrl>' +
    '</hp:run>';

  if (/<\/hp:secPr>[\s\S]*?<\/hp:run>/.test(xml)) {
    xml = xml.replace(/(<\/hp:secPr>[\s\S]*?<\/hp:run>)/, '$1' + pageNumRun);
  } else if (/<hs:sec\b[^>]*>/.test(xml)) {
    // fallback: 구역 맨 앞 문단 앞에 쪽번호 전용 문단 삽입
    const para =
      '<hp:p id="' +
      String(Date.now()).slice(-9) +
      '" paraPrIDRef="32" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">' +
      pageNumRun +
      '</hp:p>';
    xml = xml.replace(/(<hs:sec\b[^>]*>)/, '$1' + para);
  }

  return xml;
}

/** 합본 content.hpf: 이미지·섹션 목록 재구성 */
function buildMergedContentHpf(baseHpf, sectionCount, imageCount) {
  let hpf = baseHpf || '';
  // 기존 image1~4 / section0 항목 제거 후 재삽입
  hpf = hpf.replace(/<opf:item\b[^>]*\bid="image\d+"[^>]*\/>/g, '');
  hpf = hpf.replace(/<opf:item\b[^>]*\bid="section\d+"[^>]*\/>/g, '');
  hpf = hpf.replace(/<opf:itemref\b[^>]*\bidref="section\d+"[^>]*\/>/g, '');

  const imageItems = [];
  for (let i = 1; i <= imageCount; i++) {
    imageItems.push(
      '<opf:item id="image' +
        i +
        '" href="BinData/image' +
        i +
        '.jpeg" media-type="image/jpeg" isEmbeded="1"/>'
    );
  }
  const sectionItems = [];
  const sectionRefs = [];
  for (let i = 0; i < sectionCount; i++) {
    sectionItems.push(
      '<opf:item id="section' +
        i +
        '" href="Contents/section' +
        i +
        '.xml" media-type="application/xml"/>'
    );
    sectionRefs.push('<opf:itemref idref="section' + i + '" linear="yes"/>');
  }

  // header 항목 뒤에 이미지·섹션 삽입
  if (/<opf:item\b[^>]*\bid="header"[^>]*\/>/.test(hpf)) {
    hpf = hpf.replace(
      /(<opf:item\b[^>]*\bid="header"[^>]*\/>)/,
      '$1' + imageItems.join('') + sectionItems.join('')
    );
  } else if (/<opf:manifest>/.test(hpf)) {
    hpf = hpf.replace(
      /<opf:manifest>/,
      '<opf:manifest>' + imageItems.join('') + sectionItems.join('')
    );
  }

  // spine: header 다음 섹션들
  if (/<opf:itemref\b[^>]*\bidref="header"[^>]*\/>/.test(hpf)) {
    hpf = hpf.replace(
      /(<opf:itemref\b[^>]*\bidref="header"[^>]*\/>)/,
      '$1' + sectionRefs.join('')
    );
  } else if (/<opf:spine>/.test(hpf)) {
    hpf = hpf.replace(/<opf:spine>/, '<opf:spine>' + sectionRefs.join(''));
  }

  return hpf;
}

/**
 * 공유재산 실태조사표 HWPX — qu 템플릿에 라벨 인접 셀·이미지 바인딩
 * 현장사진이 없으면 템플릿 샘플 사진 대신 빈칸(흰색) JPEG를 넣는다.
 */
async function exportChungjuSurveyHwpx(row, images, outputPath) {
  return exportChungjuSurveyHwpxMerged([{ row, images }], outputPath);
}

/**
 * 여러 필지 실태조사표를 하나의 HWPX 합본으로 저장
 * (필지마다 sectionN.xml + image 슬롯 4개씩 재매핑)
 * @param {{ row: object, images?: object[] }[]} items
 */
async function exportChungjuSurveyHwpxMerged(items, outputPath) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error('HWPX 템플릿이 없습니다: ' + TEMPLATE_PATH);
  }
  const list = (Array.isArray(items) ? items : []).filter((it) => it && it.row);
  if (list.length === 0) throw new Error('합본할 실태조사 데이터가 없습니다');

  const templateBuf = fs.readFileSync(TEMPLATE_PATH);
  const srcZip = await JSZip.loadAsync(templateBuf);

  const sectionPath = 'Contents/section0.xml';
  const hpfPath = 'Contents/content.hpf';
  const sectionFile = srcZip.file(sectionPath);
  if (!sectionFile) throw new Error('템플릿에 section0.xml이 없습니다');

  const templateSection = await sectionFile.async('string');
  const baseHpf = srcZip.file(hpfPath)
    ? await srcZip.file(hpfPath).async('string')
    : '';

  const sections = [];
  const allSlots = [];

  for (let i = 0; i < list.length; i++) {
    const offset = i * 4;
    let sectionXml = bindSectionXml(templateSection, list[i].row);
    sectionXml = remapImageIds(sectionXml, offset);
    // 2번째 섹션부터 첫 문단에 페이지 나눔
    if (i > 0) {
      sectionXml = sectionXml.replace(
        /(<hp:p\b[^>]*\bpageBreak=")0(")/,
        '$11$2'
      );
    }
    // 쪽번호: 첫 구역만 1부터, 이후 이어쓰기 → 합본 전체 -1-, -2- …
    sectionXml = ensureBottomPageNumber(sectionXml, {
      startPage: i === 0 ? 1 : 0,
    });
    sections.push(sectionXml);

    const slots = await prepareSlotImages(list[i].images);
    for (const s of slots) {
      allSlots.push({
        slot: offset + s.slot,
        ext: s.ext,
        bytes: s.bytes,
      });
    }
    console.log('[hwpx] merge section', i, 'images', offset + 1, '-', offset + 4);
  }

  const hpfXml = buildMergedContentHpf(baseHpf, sections.length, allSlots.length);

  const outZip = new JSZip();
  const mimeFile = srcZip.file('mimetype');
  const mime = mimeFile ? await mimeFile.async('string') : 'application/hwp+zip';
  outZip.file('mimetype', mime, { compression: 'STORE' });

  const names = Object.keys(srcZip.files)
    .filter((n) => n !== 'mimetype' && !srcZip.files[n].dir)
    .sort();

  const skipBin = new Set(
    [1, 2, 3, 4].flatMap((n) => [
      'BinData/image' + n + '.jpeg',
      'BinData/image' + n + '.jpg',
      'BinData/image' + n + '.png',
    ])
  );

  for (const name of names) {
    if (name === sectionPath) continue;
    if (/^Contents\/section\d+\.xml$/.test(name)) continue;
    if (name === hpfPath) {
      outZip.file(name, hpfXml || '', { compression: 'DEFLATE' });
      continue;
    }
    if (skipBin.has(name)) continue;

    const srcEntry = srcZip.file(name);
    if (!srcEntry) continue;
    const data = await srcEntry.async('nodebuffer');
    if (name === 'Contents/header.xml' && sections.length > 0) {
      let hdr = data.toString('utf8');
      hdr = hdr.replace(/secCnt="\d+"/, `secCnt="${sections.length}"`);
      outZip.file(name, Buffer.from(hdr, 'utf8'), { compression: 'DEFLATE' });
      continue;
    }
    outZip.file(name, data, { compression: 'DEFLATE' });
  }

  for (let i = 0; i < sections.length; i++) {
    outZip.file('Contents/section' + i + '.xml', sections[i], {
      compression: 'DEFLATE',
    });
  }

  for (const s of allSlots) {
    outZip.file('BinData/image' + s.slot + '.' + s.ext, s.bytes, {
      compression: 'STORE',
    });
  }

  const outBuf = await outZip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, outBuf);

  const embedded = allSlots.filter((s) => s.bytes !== BLANK_JPEG).length;
  console.log(
    '[hwpx] merged written',
    outputPath,
    'sections',
    sections.length,
    'photos',
    embedded + '/' + allSlots.length
  );
}

module.exports = {
  exportChungjuSurveyHwpx,
  exportChungjuSurveyHwpxMerged,
  TEMPLATE_PATH,
  bindSectionXml,
  ensureBottomPageNumber,
  resolveImageBytes,
  resolveImageFile,
  ensureJpegBytes,
  detectImageKind,
};
