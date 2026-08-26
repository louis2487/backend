/**
 * In-memory seed for /v1/zoning when ZONING_USE_MEMORY=1
 * or when zb_* tables are not yet migrated.
 * Data mirrors zoning-web/src/data/mockData.ts (subset).
 */

const { buildOverlays } = require('./zoning.overlays');

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function makePolygon(centroid, dx, dy) {
  return [
    { lat: centroid.lat - dy, lng: centroid.lng - dx },
    { lat: centroid.lat - dy, lng: centroid.lng + dx },
    { lat: centroid.lat + dy, lng: centroid.lng + dx },
    { lat: centroid.lat + dy, lng: centroid.lng - dx },
  ];
}

const targets = [
  { id: 't1', name: '경상북도 안동시 / 용도지역', sido: '경상북도', sigungu: '안동시', theme: '용도지역' },
  { id: 't2', name: '경상북도 안동시 / 용도지구', sido: '경상북도', sigungu: '안동시', theme: '용도지구' },
  { id: 't3', name: '경상북도 예천군 / 용도지역', sido: '경상북도', sigungu: '예천군', theme: '용도지역' },
];

const features = [
  {
    id: 'f1',
    targetId: 't1',
    name: '풍산읍 일원 자연녹지지역',
    errorCount: 3,
    completed: false,
    noticeNo: '안동시고시 제2023-45호',
    noticeDate: '2023-08-21',
    location: '경상북도 안동시 풍산읍',
    noticeArea: 48210.5,
    source: '도시계획과',
    actualArea: 48102.3,
    centroid: { lat: 36.575, lng: 128.7 },
    polygon: makePolygon({ lat: 36.575, lng: 128.7 }, 0.02, 0.03),
    errors: [
      { id: 'e1', type: '주제중첩', message: '인접 필지와 경계 겹침 (12.4㎡)', location: { lat: 36.576, lng: 128.701 } },
      { id: 'e2', type: '경계오류', message: '도형 간 공백 구간 존재', location: { lat: 36.5745, lng: 128.699 } },
      { id: 'e3', type: '속성오류', message: '고시일자 타임스탬프 형식 오류', location: { lat: 36.575, lng: 128.7 } },
    ],
    maintenances: [
      { id: 'm1', type: '경계정비', round: 1, confirmed: true, opinion: '지적도와 불일치하는 경계선 수정' },
      { id: 'm2', type: '속성보정', round: 2, confirmed: false, opinion: '고시번호 오기 수정 및 면적 재산정' },
    ],
  },
  {
    id: 'f2',
    targetId: 't1',
    name: '와룡면 일원 생산녹지지역',
    errorCount: 1,
    completed: false,
    noticeNo: '안동시고시 제2023-52호',
    noticeDate: '2023-09-10',
    location: '경상북도 안동시 와룡면',
    noticeArea: 22100.0,
    source: '도시계획과',
    actualArea: 22100.0,
    centroid: { lat: 36.595, lng: 128.75 },
    polygon: makePolygon({ lat: 36.595, lng: 128.75 }, -0.015, -0.02),
    errors: [
      { id: 'e4', type: '경계오류', message: '자교차 폴리곤 검출', location: { lat: 36.5955, lng: 128.7505 } },
    ],
    maintenances: [
      { id: 'm3', type: '도형정비', round: 1, confirmed: true, opinion: '자교차 구간 노드 정리' },
    ],
  },
  {
    id: 'f3',
    targetId: 't1',
    name: '남후면 일원 제2종일반주거',
    errorCount: 2,
    completed: true,
    noticeNo: '안동시고시 제2022-88호',
    noticeDate: '2022-11-03',
    location: '경상북도 안동시 남후면',
    noticeArea: 15680.7,
    source: '건축과',
    actualArea: 15680.7,
    centroid: { lat: 36.54, lng: 128.71 },
    polygon: makePolygon({ lat: 36.54, lng: 128.71 }, 0.01, 0.04),
    errors: [
      { id: 'e5', type: '동일누락', message: '링 방향 오류 (수정 완료)', location: { lat: 36.5405, lng: 128.7105 } },
      { id: 'e6', type: '속성오류', message: '미등록 용도지역 코드 (수정 완료)', location: { lat: 36.5395, lng: 128.7095 } },
    ],
    maintenances: [
      { id: 'm4', type: '코드정비', round: 1, confirmed: true, opinion: '용도지역 코드 표준화 반영' },
    ],
  },
  {
    id: 'f4',
    targetId: 't1',
    name: '임하면 일원 계획관리지역',
    errorCount: 0,
    completed: false,
    noticeNo: '안동시고시 제2024-03호',
    noticeDate: '2024-01-18',
    location: '경상북도 안동시 임하면',
    noticeArea: 33450.2,
    source: '도시계획과',
    actualArea: 33448.9,
    centroid: { lat: 36.53, lng: 128.78 },
    polygon: makePolygon({ lat: 36.53, lng: 128.78 }, -0.03, 0.05),
    errors: [],
    maintenances: [],
  },
  {
    id: 'f5',
    targetId: 't1',
    name: '도산면 일원 농림지역',
    errorCount: 1,
    completed: false,
    noticeNo: '안동시고시 제2023-71호',
    noticeDate: '2023-12-05',
    location: '경상북도 안동시 도산면',
    noticeArea: 89200.0,
    source: '농정과',
    actualArea: 89150.4,
    centroid: { lat: 36.72, lng: 128.82 },
    polygon: makePolygon({ lat: 36.72, lng: 128.82 }, -0.04, -0.08),
    errors: [
      { id: 'e7', type: '연속지적도 경계변경', message: '행정경계와 공백 발생', location: { lat: 36.721, lng: 128.821 } },
    ],
    maintenances: [
      { id: 'm5', type: '경계정비', round: 1, confirmed: false, opinion: '리 경계 기준으로 재정렬 필요' },
    ],
  },
  {
    id: 'f9',
    targetId: 't3',
    name: '예천읍 일원 제1종일반주거',
    errorCount: 0,
    completed: false,
    noticeNo: '예천군고시 제2024-12호',
    noticeDate: '2024-03-15',
    location: '경상북도 예천군 예천읍',
    noticeArea: 12540.0,
    source: '도시계획과',
    actualArea: 12538.2,
    centroid: { lat: 36.655, lng: 128.455 },
    polygon: makePolygon({ lat: 36.655, lng: 128.455 }, 0.08, 0.12),
    errors: [],
    maintenances: [],
  },
];

// t2 uses same feature set as t1 (demo)
const featuresT2 = features
  .filter((f) => f.targetId === 't1')
  .map((f) => ({ ...clone(f), id: `${f.id}_t2`, targetId: 't2' }));

const allFeatures = [...features, ...featuresT2];

const parcelsByFeature = {
  f1: [
    { id: 'p1', pnu: '4717010100100120003', jibunBefore: '경상북도 안동시 풍산읍 산 12-3', jibunAfter: '경상북도 안동시 풍산읍 산 12-3', ownerTypeBefore: '사', ownerTypeAfter: '사', geomAreaBefore: 1240.5, geomAreaAfter: 1240.5, inclusionAreaBefore: 820.0, inclusionAreaAfter: 820.0, changeType: 'unchanged' },
    { id: 'p2', pnu: '4717010100100450001', jibunBefore: '경상북도 안동시 풍산읍 45-1', jibunAfter: '경상북도 안동시 풍산읍 45-1', ownerTypeBefore: '국', ownerTypeAfter: '국', geomAreaBefore: 2105.2, geomAreaAfter: 1988.7, inclusionAreaBefore: 2105.2, inclusionAreaAfter: 1988.7, changeType: 'areaChanged' },
    { id: 'p3', pnu: '4717010100100450002', jibunBefore: '경상북도 안동시 풍산읍 45-2', jibunAfter: '경상북도 안동시 풍산읍 45-2', ownerTypeBefore: '사', ownerTypeAfter: '사', geomAreaBefore: 980.0, geomAreaAfter: 980.0, inclusionAreaBefore: 450.0, inclusionAreaAfter: 450.0, changeType: 'unchanged' },
    { id: 'p4', pnu: '4717010100100880001', jibunBefore: null, jibunAfter: '경상북도 안동시 풍산읍 88-1', ownerTypeBefore: null, ownerTypeAfter: '사', geomAreaBefore: null, geomAreaAfter: 312.4, inclusionAreaBefore: null, inclusionAreaAfter: 312.4, changeType: 'added' },
    { id: 'p5', pnu: '4717010100100990007', jibunBefore: '경상북도 안동시 풍산읍 99-7', jibunAfter: null, ownerTypeBefore: '도', ownerTypeAfter: null, geomAreaBefore: 156.0, geomAreaAfter: null, inclusionAreaBefore: 156.0, inclusionAreaAfter: null, changeType: 'deleted' },
  ],
  f2: [
    { id: 'p6', pnu: '4717030200100030001', jibunBefore: '경상북도 안동시 와룡면 3-1', jibunAfter: '경상북도 안동시 와룡면 3-1', ownerTypeBefore: '사', ownerTypeAfter: '사', geomAreaBefore: 5400.0, geomAreaAfter: 5400.0, inclusionAreaBefore: 3200.0, inclusionAreaAfter: 3200.0, changeType: 'unchanged' },
    { id: 'p7', pnu: '4717030200100040002', jibunBefore: '경상북도 안동시 와룡면 4-2', jibunAfter: '경상북도 안동시 와룡면 4-2', ownerTypeBefore: '국', ownerTypeAfter: '국', geomAreaBefore: 880.5, geomAreaAfter: 902.1, inclusionAreaBefore: 880.5, inclusionAreaAfter: 902.1, changeType: 'areaChanged' },
  ],
};

function defaultParcel(featureId, location) {
  return [{
    id: `p_${featureId}`,
    pnu: '0000000000000000000',
    jibunBefore: `${location} 1-1`,
    jibunAfter: `${location} 1-1`,
    ownerTypeBefore: '사',
    ownerTypeAfter: '사',
    geomAreaBefore: 1000,
    geomAreaAfter: 1000,
    inclusionAreaBefore: 500,
    inclusionAreaAfter: 500,
    changeType: 'unchanged',
  }];
}

const krasChildren = () => ([
  { id: 'KRAS_UQ112', label: '국토/기타용도지역지구', visible: false, isGroup: false, children: [], swatch: '#ce93d8' },
  { id: 'KRAS_UQ111', label: '국토/용도지역', visible: true, isGroup: false, children: [], swatch: '#90caf9' },
  { id: 'KRAS_LHBLD', label: '지역/지역균형개발및중소기업...', visible: false, isGroup: false, children: [], swatch: '#b39ddb' },
  { id: 'KRAS_R201', label: '지역특화발전규제/특구', visible: false, isGroup: false, children: [], swatch: '#a5d6a7' },
  { id: 'KRAS_UD610', label: '신발전지역육성/발전구역', visible: false, isGroup: false, children: [], swatch: '#80cbc4' },
  { id: 'KRAS_UD801', label: '건축/용도지역', visible: true, isGroup: false, children: [], swatch: '#ce93d8' },
  { id: 'KRAS_UP302', label: '주거환경개선특별/주거환경개선', visible: false, isGroup: false, children: [], swatch: '#ffe082' },
  { id: 'KRAS_UP301', label: '도시및주거환경정비구역', visible: false, isGroup: false, children: [], swatch: '#fff59d' },
  { id: 'KRAS_LHZONE', label: '민간임대주택/용도지구', visible: false, isGroup: false, children: [], swatch: '#ffcc80' },
  { id: 'KRAS_UD620', label: '도청이전/신도시개발예정지구', visible: false, isGroup: false, children: [], swatch: '#b39ddb' },
]);

const layers = {
  before: [
    { id: 'admin', label: '행정경계', isGroup: true, visible: false, children: [
      { id: 'LSMD_ADM_SECT_EMD', label: 'LSMD_ADM_SECT_EMD', visible: false, isGroup: false, children: [] },
      { id: 'LSMD_ADM_SECT_RI', label: 'LSMD_ADM_SECT_RI', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'inv', label: '검수도형', isGroup: true, visible: false, children: [
      { id: 'INV_MODIFIED', label: '고시도면', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'bf_cad', label: '연속지적도', isGroup: true, visible: false, children: [
      { id: 'BF_LSMD_CONT_LDREG', label: '연속지적도', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'ref', label: 'KRAS_용도주제도(전체)', isGroup: true, visible: false, children: krasChildren().map((c) => ({ ...c, visible: false })) },
    { id: 'basemap', label: '배경', isGroup: true, visible: true, children: [
      { id: 'BASE', label: '일반지도', visible: true, isGroup: false, children: [] },
      { id: 'SAT', label: '항공영상(위성)', visible: false, isGroup: false, children: [] },
    ]},
  ],
  after: [
    { id: 'admin', label: '행정경계', isGroup: true, visible: false, children: [
      { id: 'LSMD_ADM_SECT_EMD', label: 'LSMD_ADM_SECT_EMD', visible: false, isGroup: false, children: [] },
      { id: 'LSMD_ADM_SECT_RI', label: 'LSMD_ADM_SECT_RI', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'inv', label: '검수도형', isGroup: true, visible: false, children: [
      { id: 'INV_MODIFIED', label: '고시도면', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'af_cad', label: '연속지적도', isGroup: true, visible: false, children: [
      { id: 'AF_LSMD_CONT_LDREG', label: '연속지적도', visible: false, isGroup: false, children: [] },
    ]},
    { id: 'ref', label: 'KRAS_용도주제도(전체)', isGroup: true, visible: false, children: krasChildren().map((c) => ({ ...c, visible: false })) },
    { id: 'basemap', label: '배경', isGroup: true, visible: true, children: [
      { id: 'BASE', label: '일반지도', visible: true, isGroup: false, children: [] },
      { id: 'SAT', label: '항공영상(위성)', visible: false, isGroup: false, children: [] },
    ]},
  ],
};

const users = [
  { userId: 'admin', userPw: '1', userUuid: 'zu-admin-001', displayName: '시스템관리자', role: 'admin' },
  { userId: 'inspector01', userPw: '1', userUuid: 'zu-insp-001', displayName: '1차 검수자', role: 'inspector' },
  { userId: 'reviewer01', userPw: '1', userUuid: 'zu-rev-001', displayName: '심사 담당자', role: 'reviewer' },
];

const packages = [
  { id: 'pkg1', name: '안동시 용도지역 1차 검수', sido: '경상북도', sigungu: '안동시', theme: '용도지역', targetId: 't1', status: 'in_progress', assignedRole: 'inspector', note: '풍산·와룡 등' },
  { id: 'pkg2', name: '안동시 용도지구 검수', sido: '경상북도', sigungu: '안동시', theme: '용도지구', targetId: 't2', status: 'open', assignedRole: 'inspector', note: '' },
  { id: 'pkg3', name: '예천군 용도지역 심사', sido: '경상북도', sigungu: '예천군', theme: '용도지역', targetId: 't3', status: 'open', assignedRole: 'reviewer', note: '심사 단계' },
];

function createStore() {
  const results = {};
  const markers = {};
  let markerSeq = 0;
  const packageRows = clone(packages);

  function featureBaseId(id) {
    return String(id).replace(/_t2$/, '');
  }

  function parcelsFor(featureId) {
    const base = featureBaseId(featureId);
    if (parcelsByFeature[base]) return clone(parcelsByFeature[base]);
    const f = allFeatures.find((x) => x.id === featureId);
    return defaultParcel(featureId, f ? f.location : '');
  }

  function enrichFeature(f) {
    const result = results[f.id];
    return {
      ...clone(f),
      completed: result ? !!result.completed : f.completed,
      parcels: parcelsFor(f.id),
    };
  }

  function gosiFor(featureId, isDrawing) {
    const f = allFeatures.find((x) => x.id === featureId);
    if (!f) return null;
    if (isDrawing) {
      return {
        noticeNo: f.noticeNo,
        title: `${f.name} 고시도면`,
        date: f.noticeDate,
        isDrawing: true,
        body: `[고시도면]\n고시번호: ${f.noticeNo}\n고시일자: ${f.noticeDate}\n대상: ${f.name}\n소재지: ${f.location}\n고시면적: ${f.noticeArea} ㎡`,
      };
    }
    return {
      noticeNo: f.noticeNo,
      title: `${f.noticeNo} 고시문`,
      date: f.noticeDate,
      isDrawing: false,
      body: `${f.noticeNo}\n\n위치: ${f.location}\n면적: ${f.noticeArea} ㎡\n결정 내용: ${f.name}\n소관: ${f.source}`,
    };
  }

  return {
    listTargets() {
      return clone(targets);
    },
    listFeatures(targetId) {
      return allFeatures.filter((f) => f.targetId === targetId).map(enrichFeature);
    },
    listParcels(featureId) {
      return parcelsFor(featureId);
    },
    getGosi(featureId, type) {
      return gosiFor(featureId, type === 'drawing');
    },
    getLayers() {
      return { ...clone(layers), geoms: buildOverlays() };
    },
    getResult(featureId) {
      return results[featureId] ? clone(results[featureId]) : null;
    },
    saveResult(featureId, payload) {
      const completed = payload.verdict !== 'rework' && payload.completed !== false;
      results[featureId] = {
        featureId,
        verdict: payload.verdict,
        opinion: payload.opinion || '',
        completed,
        userId: payload.userId || null,
        updatedAt: new Date().toISOString(),
      };
      const f = allFeatures.find((x) => x.id === featureId);
      if (f) f.completed = completed;
      return clone(results[featureId]);
    },
    listMarkers(featureId) {
      return clone(markers[featureId] || []);
    },
    addMarker(featureId, payload) {
      markerSeq += 1;
      const row = {
        id: payload.id || `mk${markerSeq}`,
        featureId,
        tool: payload.tool || 'sketchPoint',
        points: payload.points || [],
        createdAt: new Date().toISOString(),
      };
      if (!markers[featureId]) markers[featureId] = [];
      markers[featureId].push(row);
      return clone(row);
    },
    deleteMarker(markerId) {
      for (const fid of Object.keys(markers)) {
        const idx = markers[fid].findIndex((m) => m.id === markerId);
        if (idx >= 0) {
          markers[fid].splice(idx, 1);
          return true;
        }
      }
      return false;
    },
    login(userId, userPw) {
      const u = users.find((x) => x.userId === userId && x.userPw === userPw);
      if (!u) return null;
      return {
        userId: u.userId,
        userUuid: u.userUuid,
        displayName: u.displayName,
        role: u.role,
      };
    },
    listPackages(role) {
      const rows = clone(packageRows);
      if (!role || role === 'admin') return rows;
      return rows.filter((p) => !p.assignedRole || p.assignedRole === role || role === 'admin');
    },
    updatePackage(id, patch) {
      const row = packageRows.find((p) => p.id === id);
      if (!row) return null;
      if (patch.status) row.status = patch.status;
      if (patch.note !== undefined) row.note = patch.note;
      if (patch.assignedRole !== undefined) row.assignedRole = patch.assignedRole;
      row.updatedAt = new Date().toISOString();
      return clone(row);
    },
  };
}

module.exports = { createStore };
