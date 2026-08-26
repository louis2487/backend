-- public.field → 앱(장수 현장조사) 연동용 스키마 확장
-- 실행: psql -h 182.213.27.207 -p 60039 -U postgres -d jangsucropsdb -f migrate_public_field_for_app.sql
--
-- 원본 field 컬럼: gid, fpopkey, grp_id, 공공1, geom(SRID 0, 좌표=EPSG:5179)
-- 앱 기대: fpop_key, geom(EPSG:4326), col_*, write_data, addr, …

BEGIN;

-- 1) 키 컬럼명 통일
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='field' AND column_name='fpopkey'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='field' AND column_name='fpop_key'
  ) THEN
    ALTER TABLE public.field RENAME COLUMN fpopkey TO fpop_key;
  END IF;
END $$;

-- 2) 좌표계: 5179 → 4326 (이미 4326이면 스킵)
DO $$
DECLARE
  srid int;
  sample_x double precision;
BEGIN
  SELECT ST_SRID(geom), ST_X(ST_Centroid(geom))
    INTO srid, sample_x
  FROM public.field
  WHERE geom IS NOT NULL
  LIMIT 1;

  IF sample_x IS NULL THEN
    RAISE NOTICE 'field has no geometry';
    RETURN;
  END IF;

  -- 경도 범위면 이미 WGS84로 간주
  IF sample_x BETWEEN 120 AND 135 THEN
    UPDATE public.field SET geom = ST_SetSRID(geom, 4326) WHERE ST_SRID(geom) <> 4326;
  ELSE
    UPDATE public.field
    SET geom = ST_Transform(ST_SetSRID(geom, 5179), 4326);
  END IF;

  ALTER TABLE public.field
    ALTER COLUMN geom TYPE geometry(Polygon, 4326)
    USING ST_SetSRID(geom, 4326);
END $$;

-- 3) 앱 필수/설문 컬럼 추가
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS csft_seq integer;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS pnu character varying(80);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS land_area integer;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS ridge_area integer;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS av_area integer;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS gis_area integer;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS fm_land_cd character varying(50);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS reg_date character varying(20);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS mod_date character varying(20);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS memo text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS cropcodes character varying(200);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS addr character varying(200);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS crop_nm character varying(200);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS geo_center geometry(Point, 4326);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS re_area numeric;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS re_area_reason character varying(200);
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS write_data character varying(1) DEFAULT 'N';

ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_a text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_b text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_c text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_d text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_e text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_f text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_g text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_h text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_i text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_j text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_k text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_l text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_m text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_n text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_o text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_p text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_q text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_r text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_s text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_t text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_u text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_v text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_w text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_x text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_y text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_z text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_aa text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ab text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ac text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ad text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ae text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_af text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ag text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ah text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ai text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_aj text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ak text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_al text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_am text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_an text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ao text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ap text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_aq text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ar text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_at text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_au text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_av text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_aw text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ax text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ay text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_az text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_ba text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bb text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bc text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bd text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_be text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bf text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bg text;
ALTER TABLE public.field ADD COLUMN IF NOT EXISTS col_bh text;

-- 4) 초기값
UPDATE public.field SET csft_seq = gid WHERE csft_seq IS NULL;
UPDATE public.field SET pnu = fpop_key WHERE pnu IS NULL OR pnu = '';
UPDATE public.field SET write_data = 'N' WHERE write_data IS NULL OR write_data = '';
UPDATE public.field
SET addr = NULLIF(TRIM("공공1"), '')
WHERE (addr IS NULL OR addr = '') AND "공공1" IS NOT NULL;
UPDATE public.field
SET geo_center = ST_PointOnSurface(geom)
WHERE geom IS NOT NULL AND geo_center IS NULL;

CREATE INDEX IF NOT EXISTS field_fpop_key_idx ON public.field (fpop_key);
CREATE INDEX IF NOT EXISTS field_geom_4326_idx ON public.field USING GIST (geom);

COMMIT;

SELECT COUNT(*) AS field_rows,
       COUNT(fpop_key) AS with_key,
       COUNT(geom) AS with_geom,
       ST_SRID(MIN(geom)) AS sample_srid
FROM public.field;
