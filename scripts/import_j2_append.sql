-- J2 shapefile (10건) → public.field 추가만 (기존 행 유지)
-- 식별: grp_id = 'J2', fpop_key = pnu (이미 있으면 pnu는 스킵)

CREATE EXTENSION IF NOT EXISTS postgis;

-- 스테이징에 없는 필수 보조 컬럼 방지용 (이미 있으면면 no-op)
DO $$ BEGIN NULL; END $$;

WITH src AS (
  SELECT
    s.gid,
    NULLIF(TRIM(s.pnu), '') AS pnu,
    NULLIF(TRIM(s."지번"), '') AS jibun,
    NULLIF(TRIM(s."도로명"), '') AS road,
    NULLIF(TRIM(s."공부지목"), '') AS jimok,
    NULLIF(TRIM(s."현황지목"), '') AS hyun_jimok,
    s."실면적" AS area_raw,
    NULLIF(TRIM(s."이용상황"), '') AS iyong,
    NULLIF(TRIM(s."재산구분"), '') AS jaesan,
    NULLIF(TRIM(s."회계구분"), '') AS hoegye,
    NULLIF(TRIM(s."재산관리관"), '') AS gwanri,
    NULLIF(TRIM(s."분업관리관"), '') AS bunim,
    NULLIF(TRIM(s."위임관리관"), '') AS wimim,
    s."재산번호" AS jaesan_no,
    CASE
      WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
      WHEN ST_SRID(s.geom) NOT IN (0, 4326) THEN ST_Transform(ST_SetSRID(s.geom, ST_SRID(s.geom)), 4326)
      ELSE s.geom
    END AS g4326
  FROM public.stg_j2_parcels s
  WHERE s.geom IS NOT NULL
),
norm AS (
  SELECT
    src.*,
    ST_MakeValid(
      ST_CollectionExtract(ST_Multi(src.g4326), 3)
    ) AS gpoly
  FROM src
),
ready AS (
  SELECT
    n.*,
    (ST_Dump(n.gpoly)).geom AS poly
  FROM norm n
  WHERE n.gpoly IS NOT NULL
    AND NOT ST_IsEmpty(n.gpoly)
    AND n.pnu IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.field f WHERE f.pnu = n.pnu OR f.fpop_key = n.pnu
    )
)
INSERT INTO public.field (
  fpop_key,
  grp_id,
  pnu,
  addr,
  land_area,
  av_area,
  gis_area,
  fm_land_cd,
  col_d,
  col_ac,
  col_a,
  col_b,
  col_f,
  col_u,
  col_v,
  col_w,
  col_x,
  col_y,
  col_z,
  memo,
  geom,
  geo_center,
  reg_date,
  mod_date,
  write_data
)
SELECT
  r.pnu AS fpop_key,
  'J2' AS grp_id,
  r.pnu,
  COALESCE(r.road, r.jibun, r.pnu) AS addr,
  NULLIF(ROUND(COALESCE(r.area_raw, 0)::numeric, 0), 0)::int AS land_area,
  NULLIF(ROUND(COALESCE(r.area_raw, 0)::numeric, 0), 0)::int AS av_area,
  ROUND(ST_Area(r.poly::geography)::numeric, 0)::int AS gis_area,
  LEFT(COALESCE(r.jimok, ''), 50) AS fm_land_cd,
  r.jimok AS col_d,
  r.hyun_jimok AS col_ac,
  r.pnu AS col_a,
  r.jibun AS col_b,
  r.road AS col_f,
  r.jaesan AS col_u,
  r.hoegye AS col_v,
  r.gwanri AS col_w,
  r.bunim AS col_x,
  r.wimim AS col_y,
  NULLIF(TRIM(r.jaesan_no::text), '') AS col_z,
  'J2-import|' || COALESCE(r.iyong, '') || '|재산번호=' || COALESCE(r.jaesan_no::text, '') AS memo,
  ST_SetSRID(r.poly, 4326)::geometry(Polygon, 4326) AS geom,
  ST_PointOnSurface(ST_SetSRID(r.poly, 4326))::geometry(Point, 4326) AS geo_center,
  TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') AS reg_date,
  TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') AS mod_date,
  'N' AS write_data
FROM ready r;

-- 결과 요약
SELECT 'field_total' AS k, COUNT(*)::text AS v FROM public.field
UNION ALL
SELECT 'j2_grp', COUNT(*)::text FROM public.field WHERE grp_id = 'J2'
UNION ALL
SELECT 'stg_j2', COUNT(*)::text FROM public.stg_j2_parcels;
