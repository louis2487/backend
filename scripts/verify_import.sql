-- import 후 검증 (앱이 실제로 읽는 propcrops 스키마 기준)
\set ON_ERROR_STOP on

\echo '=== jangsucrops.tb_jangsu_info (앱 연동 테이블) ==='
SELECT COUNT(*) AS parcel_count FROM jangsucrops.tb_jangsu_info;

SELECT
  MIN(ROUND(ST_X(ST_Centroid(geom))::numeric, 6)) AS min_lng,
  MAX(ROUND(ST_X(ST_Centroid(geom))::numeric, 6)) AS max_lng,
  MIN(ROUND(ST_Y(ST_Centroid(geom))::numeric, 6)) AS min_lat,
  MAX(ROUND(ST_Y(ST_Centroid(geom))::numeric, 6)) AS max_lat
FROM jangsucrops.tb_jangsu_info
WHERE geom IS NOT NULL;

SELECT COUNT(*) AS jangsu_bbox_count
FROM jangsucrops.tb_jangsu_info
WHERE geom IS NOT NULL
  AND ST_Intersects(
    geom,
    ST_MakeEnvelope(127.35, 35.47, 127.62, 35.74, 4326)
  );

\echo '=== public.tb_jangsu_info (앱 미사용, 참고용) ==='
SELECT COUNT(*) AS public_mirror_count FROM public.tb_jangsu_info;

\echo '=== 샘플 3건 ==='
SELECT
  fpop_key,
  pnu,
  addr,
  ROUND(ST_X(ST_Centroid(geom))::numeric, 6) AS lng,
  ROUND(ST_Y(ST_Centroid(geom))::numeric, 6) AS lat
FROM jangsucrops.tb_jangsu_info
WHERE geom IS NOT NULL
ORDER BY fpop_key
LIMIT 3;
