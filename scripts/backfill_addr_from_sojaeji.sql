-- j.shp 소재지 → jangsucrops.tb_jangsu_info.addr 백필
-- (기존 이관은 jibun만 addr에 넣어 지번만 표시됨)
\set ON_ERROR_STOP on

UPDATE jangsucrops.tb_jangsu_info t
SET addr = NULLIF(TRIM(s."소재지"), '')
FROM public.stg_jangsu_parcels s
WHERE t.pnu = NULLIF(TRIM(s.pnu), '')
  AND s."소재지" IS NOT NULL
  AND TRIM(s."소재지") <> '';

UPDATE public.tb_jangsu_info t
SET addr = p.addr
FROM jangsucrops.tb_jangsu_info p
WHERE t.fpop_key = p.fpop_key;

SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE addr LIKE '전라%') AS full_addr_count,
  COUNT(*) FILTER (WHERE addr NOT LIKE '전라%' AND addr IS NOT NULL) AS jibun_only_count
FROM jangsucrops.tb_jangsu_info;

SELECT fpop_key, pnu, addr
FROM jangsucrops.tb_jangsu_info
WHERE pnu = '4574025033105640001';
