-- Seed data aligned with zoning-web/src/data/mockData.ts (minimal subset: t1,t2,t3 + f1,f2,f9)
-- Idempotent: ON CONFLICT DO NOTHING

INSERT INTO zb_inspection_target (id, name, sido, sigungu, theme) VALUES
  ('t1', '경상북도 안동시 / 용도지역', '경상북도', '안동시', '용도지역'),
  ('t2', '경상북도 안동시 / 용도지구', '경상북도', '안동시', '용도지구'),
  ('t3', '경상북도 예천군 / 용도지역', '경상북도', '예천군', '용도지역')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zb_feature (
  id, target_id, name, error_count, completed, notice_no, notice_date, location,
  notice_area, source, actual_area, centroid_lat, centroid_lng, polygon, errors, maintenances
) VALUES
(
  'f1', 't1', '풍산읍 일원 자연녹지지역', 3, FALSE,
  '안동시고시 제2023-45호', '2023-08-21', '경상북도 안동시 풍산읍',
  48210.5, '도시계획과', 48102.3, 36.575, 128.7,
  '[{"lat":36.545,"lng":128.68},{"lat":36.545,"lng":128.72},{"lat":36.605,"lng":128.72},{"lat":36.605,"lng":128.68}]'::jsonb,
  '[{"id":"e1","type":"주제중첩","message":"인접 필지와 경계 겹침 (12.4㎡)","location":{"lat":36.576,"lng":128.701}},{"id":"e2","type":"경계오류","message":"도형 간 공백 구간 존재","location":{"lat":36.5745,"lng":128.699}},{"id":"e3","type":"속성오류","message":"고시일자 타임스탬프 형식 오류","location":{"lat":36.575,"lng":128.7}}]'::jsonb,
  '[{"id":"m1","type":"경계정비","round":1,"confirmed":true,"opinion":"지적도와 불일치하는 경계선 수정"},{"id":"m2","type":"속성보정","round":2,"confirmed":false,"opinion":"고시번호 오기 수정 및 면적 재산정"}]'::jsonb
),
(
  'f2', 't1', '와룡면 일원 생산녹지지역', 1, FALSE,
  '안동시고시 제2023-52호', '2023-09-10', '경상북도 안동시 와룡면',
  22100.0, '도시계획과', 22100.0, 36.595, 128.75,
  '[{"lat":36.615,"lng":128.765},{"lat":36.615,"lng":128.735},{"lat":36.575,"lng":128.735},{"lat":36.575,"lng":128.765}]'::jsonb,
  '[{"id":"e4","type":"경계오류","message":"자교차 폴리곤 검출","location":{"lat":36.5955,"lng":128.7505}}]'::jsonb,
  '[{"id":"m3","type":"도형정비","round":1,"confirmed":true,"opinion":"자교차 구간 노드 정리"}]'::jsonb
),
(
  'f9', 't3', '예천읍 일원 제1종일반주거', 0, FALSE,
  '예천군고시 제2024-12호', '2024-03-15', '경상북도 예천군 예천읍',
  12540.0, '도시계획과', 12538.2, 36.655, 128.455,
  '[{"lat":36.535,"lng":128.375},{"lat":36.535,"lng":128.535},{"lat":36.775,"lng":128.535},{"lat":36.775,"lng":128.375}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- t2 shares same features as t1 for demo (link copies via separate rows if needed later)
INSERT INTO zb_feature (
  id, target_id, name, error_count, completed, notice_no, notice_date, location,
  notice_area, source, actual_area, centroid_lat, centroid_lng, polygon, errors, maintenances
)
SELECT 'f1_t2', 't2', name, error_count, completed, notice_no, notice_date, location,
       notice_area, source, actual_area, centroid_lat, centroid_lng, polygon, errors, maintenances
FROM zb_feature WHERE id = 'f1'
ON CONFLICT (id) DO NOTHING;

INSERT INTO zb_parcel (
  id, feature_id, pnu, jibun_before, jibun_after, owner_type_before, owner_type_after,
  geom_area_before, geom_area_after, inclusion_area_before, inclusion_area_after, change_type
) VALUES
  ('p1', 'f1', '4717010100100120003', '경상북도 안동시 풍산읍 산 12-3', '경상북도 안동시 풍산읍 산 12-3', '사', '사', 1240.5, 1240.5, 820.0, 820.0, 'unchanged'),
  ('p2', 'f1', '4717010100100450001', '경상북도 안동시 풍산읍 45-1', '경상북도 안동시 풍산읍 45-1', '국', '국', 2105.2, 1988.7, 2105.2, 1988.7, 'areaChanged'),
  ('p3', 'f1', '4717010100100450002', '경상북도 안동시 풍산읍 45-2', '경상북도 안동시 풍산읍 45-2', '사', '사', 980.0, 980.0, 450.0, 450.0, 'unchanged'),
  ('p4', 'f1', '4717010100100880001', NULL, '경상북도 안동시 풍산읍 88-1', NULL, '사', NULL, 312.4, NULL, 312.4, 'added'),
  ('p5', 'f1', '4717010100100990007', '경상북도 안동시 풍산읍 99-7', NULL, '도', NULL, 156.0, NULL, 156.0, NULL, 'deleted'),
  ('p6', 'f2', '4717030200100030001', '경상북도 안동시 와룡면 3-1', '경상북도 안동시 와룡면 3-1', '사', '사', 5400.0, 5400.0, 3200.0, 3200.0, 'unchanged'),
  ('p7', 'f2', '4717030200100040002', '경상북도 안동시 와룡면 4-2', '경상북도 안동시 와룡면 4-2', '국', '국', 880.5, 902.1, 880.5, 902.1, 'areaChanged'),
  ('p_f9', 'f9', '0000000000000000000', '경상북도 예천군 예천읍 1-1', '경상북도 예천군 예천읍 1-1', '사', '사', 1000, 1000, 500, 500, 'unchanged')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zb_parcel (
  id, feature_id, pnu, jibun_before, jibun_after, owner_type_before, owner_type_after,
  geom_area_before, geom_area_after, inclusion_area_before, inclusion_area_after, change_type
)
SELECT id || '_t2', 'f1_t2', pnu, jibun_before, jibun_after, owner_type_before, owner_type_after,
       geom_area_before, geom_area_after, inclusion_area_before, inclusion_area_after, change_type
FROM zb_parcel WHERE feature_id = 'f1'
ON CONFLICT (id) DO NOTHING;

INSERT INTO zb_gosi (id, feature_id, notice_no, title, gosi_date, body, is_drawing) VALUES
(
  'g_f1_d', 'f1', '안동시고시 제2023-45호', '풍산읍 일원 자연녹지지역 고시도면', '2023-08-21',
  E'[고시도면]\n고시번호: 안동시고시 제2023-45호\n대상: 풍산읍 일원 자연녹지지역\n축척 1:5,000',
  TRUE
),
(
  'g_f1_t', 'f1', '안동시고시 제2023-45호', '안동시고시 제2023-45호 고시문', '2023-08-21',
  E'안동시고시 제2023-45호\n\n「국토의 계획 및 이용에 관한 법률」에 따라 도시관리계획(용도지역)을 결정·고시합니다.\n위치: 경상북도 안동시 풍산읍\n면적: 48210.5 ㎡',
  FALSE
),
(
  'g_f2_d', 'f2', '안동시고시 제2023-52호', '와룡면 일원 생산녹지지역 고시도면', '2023-09-10',
  E'[고시도면]\n고시번호: 안동시고시 제2023-52호\n대상: 와룡면 일원 생산녹지지역',
  TRUE
),
(
  'g_f2_t', 'f2', '안동시고시 제2023-52호', '안동시고시 제2023-52호 고시문', '2023-09-10',
  E'안동시고시 제2023-52호\n\n위치: 경상북도 안동시 와룡면\n면적: 22100 ㎡',
  FALSE
),
(
  'g_f9_d', 'f9', '예천군고시 제2024-12호', '예천읍 일원 제1종일반주거 고시도면', '2024-03-15',
  E'[고시도면]\n고시번호: 예천군고시 제2024-12호',
  TRUE
),
(
  'g_f9_t', 'f9', '예천군고시 제2024-12호', '예천군고시 제2024-12호 고시문', '2024-03-15',
  E'예천군고시 제2024-12호\n\n위치: 경상북도 예천군 예천읍\n면적: 12540 ㎡',
  FALSE
)
ON CONFLICT (id) DO NOTHING;

DELETE FROM zb_layer_catalog;
INSERT INTO zb_layer_catalog (side, tree) VALUES
(
  'before',
  '[{"id":"admin","label":"행정경계","isGroup":true,"visible":true,"children":[{"id":"LSMD_ADM_SECT_EMD","label":"LSMD_ADM_SECT_EMD","visible":true,"isGroup":false,"children":[]},{"id":"LSMD_ADM_SECT_RI","label":"LSMD_ADM_SECT_RI","visible":true,"isGroup":false,"children":[]}]},{"id":"inv","label":"검수도형","isGroup":true,"visible":true,"children":[{"id":"INV_MODIFIED","label":"INV_MODIFIED","visible":true,"isGroup":false,"children":[]}]},{"id":"bf_theme","label":"정비 전 연속주제도","isGroup":true,"visible":false,"children":[{"id":"BF_THEME","label":"연속주제도(도시설계과)","visible":false,"isGroup":false,"children":[]}]},{"id":"bf_cad","label":"정비 전 연속지적도","isGroup":true,"visible":false,"children":[{"id":"BF_LSMD_CONT_LDREG","label":"연속지적도(브이월드)","visible":false,"isGroup":false,"children":[]}]},{"id":"ref","label":"KRAS_참조 레이어(전체)","isGroup":true,"visible":false,"children":[{"id":"KRAS_UQ112","label":"국토/기타용도지역지구","visible":false,"isGroup":false,"children":[],"swatch":"#ce93d8"},{"id":"KRAS_UQ111","label":"국토/용도지역","visible":false,"isGroup":false,"children":[],"swatch":"#90caf9"},{"id":"KRAS_LHBLD","label":"지역/지역균형개발및중소기업...","visible":false,"isGroup":false,"children":[],"swatch":"#b39ddb"},{"id":"KRAS_R201","label":"지역특화발전규제/특구","visible":false,"isGroup":false,"children":[],"swatch":"#a5d6a7"},{"id":"KRAS_UD610","label":"신발전지역육성/발전구역","visible":false,"isGroup":false,"children":[],"swatch":"#80cbc4"},{"id":"KRAS_UD801","label":"건축/용도지역","visible":false,"isGroup":false,"children":[],"swatch":"#ce93d8"},{"id":"KRAS_UP302","label":"주거환경개선특별/주거환경개선","visible":false,"isGroup":false,"children":[],"swatch":"#ffe082"},{"id":"KRAS_UP301","label":"도시및주거환경정비/정비구역","visible":false,"isGroup":false,"children":[],"swatch":"#fff59d"},{"id":"KRAS_LHZONE","label":"민간임대주택/용도지구","visible":false,"isGroup":false,"children":[],"swatch":"#ffcc80"},{"id":"KRAS_UD620","label":"도청이전/신도시개발예정지구","visible":false,"isGroup":false,"children":[],"swatch":"#b39ddb"}]},{"id":"basemap","label":"배경","isGroup":true,"visible":false,"children":[{"id":"SAT","label":"위성영상","visible":false,"isGroup":false,"children":[]}]}]'::jsonb
),
(
  'after',
  '[{"id":"admin","label":"행정경계","isGroup":true,"visible":true,"children":[{"id":"LSMD_ADM_SECT_EMD","label":"LSMD_ADM_SECT_EMD","visible":true,"isGroup":false,"children":[]},{"id":"LSMD_ADM_SECT_RI","label":"LSMD_ADM_SECT_RI","visible":true,"isGroup":false,"children":[]}]},{"id":"inv","label":"검수도형","isGroup":true,"visible":true,"children":[{"id":"INV_MODIFIED","label":"INV_MODIFIED","visible":true,"isGroup":false,"children":[]}]},{"id":"af_cad","label":"정비 후 연속지적도","isGroup":true,"visible":true,"children":[{"id":"AF_LSMD_CONT_LDREG","label":"연속지적도(브이월드)","visible":true,"isGroup":false,"children":[]}]},{"id":"af_theme","label":"정비 후 연속주제도","isGroup":true,"visible":false,"children":[{"id":"AF_THEME","label":"연속주제도","visible":false,"isGroup":false,"children":[]}]},{"id":"ref","label":"KRAS_참조 레이어(전체)","isGroup":true,"visible":false,"children":[{"id":"KRAS_UQ112","label":"국토/기타용도지역지구","visible":false,"isGroup":false,"children":[],"swatch":"#ce93d8"},{"id":"KRAS_UQ111","label":"국토/용도지역","visible":false,"isGroup":false,"children":[],"swatch":"#90caf9"},{"id":"KRAS_LHBLD","label":"지역/지역균형개발및중소기업...","visible":false,"isGroup":false,"children":[],"swatch":"#b39ddb"},{"id":"KRAS_R201","label":"지역특화발전규제/특구","visible":false,"isGroup":false,"children":[],"swatch":"#a5d6a7"},{"id":"KRAS_UD610","label":"신발전지역육성/발전구역","visible":false,"isGroup":false,"children":[],"swatch":"#80cbc4"},{"id":"KRAS_UD801","label":"건축/용도지역","visible":false,"isGroup":false,"children":[],"swatch":"#ce93d8"},{"id":"KRAS_UP302","label":"주거환경개선특별/주거환경개선","visible":false,"isGroup":false,"children":[],"swatch":"#ffe082"},{"id":"KRAS_UP301","label":"도시및주거환경정비/정비구역","visible":false,"isGroup":false,"children":[],"swatch":"#fff59d"},{"id":"KRAS_LHZONE","label":"민간임대주택/용도지구","visible":false,"isGroup":false,"children":[],"swatch":"#ffcc80"},{"id":"KRAS_UD620","label":"도청이전/신도시개발예정지구","visible":false,"isGroup":false,"children":[],"swatch":"#b39ddb"}]},{"id":"basemap","label":"배경","isGroup":true,"visible":true,"children":[{"id":"SAT","label":"위성영상","visible":true,"isGroup":false,"children":[]}]}]'::jsonb
);
