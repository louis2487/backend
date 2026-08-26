-- =============================================================================
-- stg_jangsu_parcels → jangsucrops.tb_jangsu_info 전량 이관
-- 앱 백엔드(propcrops 계정)는 search_path=propcrops 이므로 이 스키마에 적재
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- j.shp 외 쉐이프(4컬럼만 스테이징) 호환: 지목 컬럼 없으면 NULL 컬럼 추가
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels' AND column_name = 'shp_fm_land_cd'
    ) THEN
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN shp_fm_land_cd text;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels' AND column_name = 'shp_col_ac'
    ) THEN
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN shp_col_ac text;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels' AND column_name = 'shp_area'
    ) THEN
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN shp_area double precision;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels' AND column_name = '토지지목코'
    ) THEN
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN "토지지목코" text;
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN "실지목코드" text;
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN "면적" double precision;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stg_jangsu_parcels' AND column_name = '소재지'
    ) THEN
      ALTER TABLE public.stg_jangsu_parcels ADD COLUMN "소재지" text;
    END IF;
  END IF;
END $$;

-- 기존 조사구/필지 정리 (propcrops 스키마)
DELETE FROM jangsucrops.tb_jangus_zone
WHERE grp_id IN (SELECT DISTINCT grp_id FROM jangsucrops.tb_jangsu_info);

DELETE FROM jangsucrops.tb_jangsu_info;

INSERT INTO jangsucrops.tb_jangsu_info (
  csft_seq,
  grp_id,
  fpop_key,
  pnu,
  addr,
  geom,
  geo_center,
  land_area,
  av_area,
  fm_land_cd,
  col_d,
  col_ac,
  col_ag,
  col_ah,
  col_ap,
  reg_date,
  mod_date,
  write_data
)
SELECT
  (100000 + ROW_NUMBER() OVER (ORDER BY s.gid))::int AS csft_seq,
  COALESCE(NULLIF(TRIM(s.col_adm_se), ''), 'GRP-' || s.gid::text) AS grp_id,
  COALESCE(NULLIF(TRIM(s.pnu), ''), 'FPOP-' || s.gid::text) AS fpop_key,
  NULLIF(TRIM(s.pnu), '') AS pnu,
  COALESCE(
    NULLIF(TRIM(s."소재지"), ''),
    NULLIF(TRIM(s.jibun), '')
  ) AS addr,
  ST_Multi(
    ST_SetSRID(
      CASE
        WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
        WHEN ST_SRID(s.geom) = 5186 THEN ST_Transform(s.geom, 4326)
        ELSE s.geom
      END,
      4326
    )
  )::geometry(MultiPolygon, 4326) AS geom,
  ST_Centroid(
    ST_SetSRID(
      CASE
        WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
        WHEN ST_SRID(s.geom) = 5186 THEN ST_Transform(s.geom, 4326)
        ELSE s.geom
      END,
      4326
    )
  ) AS geo_center,
  COALESCE(
    NULLIF(ROUND(s.shp_area::numeric, 1)::int, 0),
    NULLIF(ROUND(s."면적"::numeric, 1)::int, 0),
    ROUND(
      ST_Area(
        ST_SetSRID(
          CASE
            WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
            WHEN ST_SRID(s.geom) = 5186 THEN ST_Transform(s.geom, 4326)
            ELSE s.geom
          END,
          4326
        )::geography
      )::numeric,
      1
    )::int
  ) AS land_area,
  COALESCE(
    NULLIF(ROUND(s.shp_area::numeric, 1)::int, 0),
    NULLIF(ROUND(s."면적"::numeric, 1)::int, 0),
    ROUND(
      ST_Area(
        ST_SetSRID(
          CASE
            WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
            WHEN ST_SRID(s.geom) = 5186 THEN ST_Transform(s.geom, 4326)
            ELSE s.geom
          END,
          4326
        )::geography
      )::numeric,
      1
    )::int
  ) AS av_area,
  LEFT(NULLIF(TRIM(COALESCE(s.shp_fm_land_cd, s."토지지목코")), ''), 6) AS fm_land_cd,
  NULLIF(TRIM(COALESCE(s.shp_fm_land_cd, s."토지지목코")), '') AS col_d,
  NULLIF(TRIM(COALESCE(s.shp_col_ac, s."실지목코드")), '') AS col_ac,
  CASE
    WHEN COALESCE(s."대부사용허", 0)::numeric > 0 THEN 'Y'
    ELSE 'N'
  END AS col_ag,
  CASE UPPER(TRIM(COALESCE(s."대부가능여", '')))
    WHEN 'Y' THEN 'Y'
    ELSE 'N'
  END AS col_ah,
  COALESCE(s."대부사용허", 0)::bigint::text AS col_ap,
  TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') AS reg_date,
  TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') AS mod_date,
  'N' AS write_data
FROM stg_jangsu_parcels s
WHERE s.geom IS NOT NULL
  AND ST_IsValid(
    CASE
      WHEN ST_SRID(s.geom) = 5186 THEN ST_Transform(s.geom, 4326)
      WHEN ST_SRID(s.geom) = 0 THEN ST_SetSRID(s.geom, 4326)
      ELSE s.geom
    END
  );

-- 조사구 폴리곤 (grp_id 별)
INSERT INTO jangsucrops.tb_jangus_zone (gid, grp_id, geom, end_flag)
SELECT
  (COALESCE((SELECT MAX(z.gid) FROM jangsucrops.tb_jangus_zone z), 0)
    + ROW_NUMBER() OVER (ORDER BY t.grp_id))::int AS gid,
  t.grp_id,
  ST_ConvexHull(ST_Collect(t.geom))::geometry(Polygon, 4326) AS geom,
  'N' AS end_flag
FROM jangsucrops.tb_jangsu_info t
WHERE t.geom IS NOT NULL
GROUP BY t.grp_id;

-- public 스키마에도 동기화 (postgres 직접 조회용)
DELETE FROM public.tb_jangus_zone
WHERE grp_id IN (SELECT DISTINCT grp_id FROM public.tb_jangsu_info);
DELETE FROM public.tb_jangsu_info;

INSERT INTO public.tb_jangsu_info (
  csft_seq, grp_id, fpop_key, pnu, addr, geom, geo_center,
  reg_date, mod_date, inspection_flag, write_data
)
SELECT
  csft_seq, grp_id, fpop_key, pnu, addr, geom, geo_center,
  reg_date, mod_date, 'N', write_data
FROM jangsucrops.tb_jangsu_info;

INSERT INTO public.tb_jangus_zone (grp_id, geom, end_flag)
SELECT grp_id, geom, end_flag
FROM jangsucrops.tb_jangus_zone;

-- 결과 요약 (앱이 읽는 propcrops 스키마)
SELECT COUNT(*) AS parcel_count FROM jangsucrops.tb_jangsu_info;
SELECT COUNT(*) AS zone_count FROM jangsucrops.tb_jangus_zone;

SELECT
  MIN(ROUND(ST_X(ST_Centroid(geom))::numeric, 6)) AS min_lng,
  MAX(ROUND(ST_X(ST_Centroid(geom))::numeric, 6)) AS max_lng,
  MIN(ROUND(ST_Y(ST_Centroid(geom))::numeric, 6)) AS min_lat,
  MAX(ROUND(ST_Y(ST_Centroid(geom))::numeric, 6)) AS max_lat
FROM jangsucrops.tb_jangsu_info;
