/**
 * 실태조사표 데이터형 출력(xlsx/docx) 공통 섹션
 */
function val(row, key) {
  const v = row?.[key];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/** PNU·관리번호처럼 보이는 값 (재산구분 등 오매핑 제외) */
function looksLikeManageNo(s) {
  const t = String(s || '').trim();
  if (!t || /[가-힣]/.test(t)) return false;
  if (/^\d{15,19}$/.test(t)) return true;
  if (/^[A-Za-z0-9]{12,}$/.test(t)) return true;
  return false;
}

/** 관리번호: col_a에 재산구분 등이 들어온 경우 fpop_key/pnu 우선 */
function resolveManageNo(d) {
  const a = val(d, 'col_a');
  const f = val(d, 'fpop_key');
  const p = val(d, 'pnu');
  if (looksLikeManageNo(a)) return a;
  if (looksLikeManageNo(f)) return f;
  if (looksLikeManageNo(p)) return p;
  return f || p || a;
}

/** 시·도/시·군·구가 포함된 전체 주소인지 */
function looksLikeFullAddress(s) {
  const t = String(s || '').trim();
  if (t.length < 8) return false;
  return /(?:특별시|광역시|특별자치시|특별자치도|[가-힣]+도)\s+[가-힣]+(?:시|군|구)/.test(
    t
  );
}

/**
 * 2페이지 소재지·위치용 전체 주소
 * addr(짧은 지번만)보다 도로명(col_f) 등 전체주소 우선
 */
function resolveSojaeji(d) {
  const addr = val(d, 'addr');
  const road = val(d, 'col_f');
  const colB = val(d, 'col_b');
  if (looksLikeFullAddress(addr)) return addr;
  if (looksLikeFullAddress(road)) return road;
  if (road) return road;
  if (addr) return addr;
  if (colB && !/(재산|회계)/.test(colB)) return colB;
  return '';
}

/** 전체주소 → `보산로 1864-16` 형태 도로명만 */
function extractRoadName(addrOrRoad) {
  const s = String(addrOrRoad || '').trim();
  if (!s) return '';
  const m = s.match(/([가-힣0-9]+(?:대로|로|길))\s*(\d+(?:-\d+)?)?/);
  if (!m) return s;
  const road = m[1] || '';
  const num = (m[2] || '').trim();
  return num ? `${road} ${num}` : road;
}

/**
 * 전체주소 → 지번만 (`장수리 362-10`)
 * 예: `전라북도 장수군 장수읍 장수리 362-10` → `장수리 362-10`
 */
function extractJibun(addrOrJibun) {
  const s = String(addrOrJibun || '').trim();
  if (!s) return '';

  // `…동/리/가 본번-부번` (끝부분)
  const m = s.match(/([가-힣0-9]+(?:동|리|가))\s*(\d+(?:-\d+)?)\s*$/);
  if (m) return `${m[1]} ${m[2]}`;

  // 끝 토큰이 번지면 직전 토큰(동/리/가 등)과 결합
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && /^\d+(?:-\d+)?$/.test(parts[parts.length - 1])) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }

  // 이미 짧은 값이면 그대로
  if (parts.length <= 2) return s;

  // 시·도/시·군·구/읍·면 접두 제거 후 남은 부분
  const stripped = s
    .replace(
      /^(?:[가-힣]+(?:특별시|광역시|특별자치시|특별자치도|도))\s+/,
      ''
    )
    .replace(/^[가-힣]+(?:시|군|구)\s+/, '')
    .replace(/^[가-힣]+(?:읍|면)\s+/, '')
    .trim();
  return stripped || s;
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 조사일자 등 — 날짜만 (시간 제외) */
function nowDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildSurveySections(row) {
  const d = row || {};
  return [
    {
      title: '1. 기본정보',
      rows: [
        ['관리번호', resolveManageNo(d)],
        ['지번', extractJibun(val(d, 'col_b') || val(d, 'addr'))],
        ['공부지목', val(d, 'col_d')],
        ['공부면적(㎡)', val(d, 'col_e') || val(d, 'land_area')],
        // 도로명 별도 값이 없으면 빈칸 (전체주소에서 도로명을 추정하지 않음)
        ['도로명', ''],
        ['현황지목', val(d, 'col_ac')],
        ['실면적(㎡)', val(d, 'col_g')],
        ['용도지역', val(d, 'col_h')],
        ['토지이용상황', val(d, 'col_k')],
        ['도로접면', val(d, 'col_l')],
        ['지형높이', val(d, 'col_m')],
        ['지형형상', val(d, 'col_n')],
      ],
    },
    {
      title: '2. 가격',
      rows: [
        ['기준년도', val(d, 'col_q')],
        ['재산 기준가격', val(d, 'col_r')],
        ['개별공시지가', val(d, 'col_s')],
        ['표준지 공시지가', val(d, 'col_t')],
      ],
    },
    {
      title: '3. 취득 및 소유',
      rows: [
        ['재산구분', val(d, 'col_u')],
        ['회계구분', val(d, 'col_v')],
        ['재산관리관', val(d, 'col_w')],
        ['분임관리관', val(d, 'col_x')],
        ['위임관리관', val(d, 'col_y')],
        ['재산번호', val(d, 'col_z')],
        ['공유지분', val(d, 'col_aa')],
        ['공유인수', val(d, 'col_ab')],
        ['소유권 변동일자', val(d, 'col_o')],
        ['소유권 변동원인', val(d, 'col_p')],
        ['취득일자', val(d, 'col_ad')],
        ['취득부서', val(d, 'col_j')],
        ['취득방법', val(d, 'col_i')],
        ['취득가액', val(d, 'col_c')],
      ],
    },
    {
      title: '4. 공법상 규제사항',
      rows: [
        ['지역·지구(국토계획법)', val(d, 'col_ae')],
        ['지역·지구(기타법령)', val(d, 'col_af')],
      ],
    },
    {
      title: '5. 사용현황 및 조사결과',
      rows: [
        ['대부여부', val(d, 'col_ag')],
        ['피대부자 수', val(d, 'col_ap')],
        ['무단점유 여부', val(d, 'col_aq')],
        ['무단점유자 수', val(d, 'col_ar')],
        ['대부-적합여부', val(d, 'col_ah')],
        ['대부-사용자명', val(d, 'col_ai')],
        ['대부-용도', val(d, 'col_ax')],
        ['대부-면적', val(d, 'col_at')],
        ['대부-사용시작일', val(d, 'col_al')],
        ['대부-사용종료일', val(d, 'col_am')],
        ['대부-대부료', val(d, 'col_an')],
        ['대부-시설물', val(d, 'col_au')],
        ['무단-점유현황', val(d, 'col_av')],
        ['무단-점유자명', val(d, 'col_aw')],
        ['무단-용도', val(d, 'col_az')],
        ['무단-면적', val(d, 'col_ba')],
        ['무단-점유시작일', val(d, 'col_ay')],
        ['무단-점유종료일', val(d, 'col_bb')],
        ['무단-변상금', val(d, 'col_bc')],
        ['무단-시설물', val(d, 'col_bd')],
      ],
    },
    {
      title: '6. 기타사항',
      rows: [
        ['위치', resolveSojaeji(d)],
        ['주변현황', val(d, 'col_be')],
        ['활용방안', val(d, 'col_bf')],
        ['특이사항', val(d, 'col_bg')],
        ['종합의견', val(d, 'col_bh')],
      ],
    },
    {
      title: '7. 결재란',
      rows: [['조사일자', nowDate()]],
    },
  ];
}

module.exports = {
  val,
  nowStamp,
  nowDate,
  extractRoadName,
  extractJibun,
  looksLikeManageNo,
  resolveManageNo,
  looksLikeFullAddress,
  resolveSojaeji,
  buildSurveySections,
};
