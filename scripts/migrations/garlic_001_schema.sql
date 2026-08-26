-- garlic module schema (prefix garlic_ — isolated from jangsu/zoning)
-- Run against the same Postgres/PostGIS DB (jangsucropsdb).

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 필지 마스터 (팜맵/test-data Shapefile)
CREATE TABLE IF NOT EXISTS garlic_a (
  id            TEXT PRIMARY KEY,
  uid           TEXT,
  pnu           TEXT,
  stdg_cd       TEXT,
  stdg_addr     TEXT,
  clsf_nm       TEXT,
  clsf_cd       TEXT,
  ldcg_cd       TEXT,
  sb_pnu        TEXT,
  area          DOUBLE PRECISION,
  source_nm     TEXT,
  flight_ymd    TEXT,
  attrs         JSONB NOT NULL DEFAULT '{}'::jsonb,
  geom          geometry(MultiPolygon, 4326),
  geo_center    geometry(Point, 4326),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS garlic_a_geom_idx ON garlic_a USING GIST (geom);
CREATE INDEX IF NOT EXISTS garlic_a_pnu_idx ON garlic_a (pnu);
CREATE INDEX IF NOT EXISTS garlic_a_addr_idx ON garlic_a (stdg_addr);

-- 면접조사 (양식 5)
CREATE TABLE IF NOT EXISTS garlic_b (
  survey_uuid   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  farmer_key    TEXT,
  respondent    JSONB NOT NULL DEFAULT '{}'::jsonb,
  garlic        JSONB NOT NULL DEFAULT '{}'::jsonb,
  onion         JSONB NOT NULL DEFAULT '{}'::jsonb,
  write_data    CHAR(1) NOT NULL DEFAULT 'N',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS garlic_b_updated_idx ON garlic_b (updated_at DESC);
CREATE INDEX IF NOT EXISTS garlic_b_write_idx ON garlic_b (write_data);

-- 필지측정/실측 (양식 6)
CREATE TABLE IF NOT EXISTS garlic_c (
  survey_uuid   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parcel_id     TEXT REFERENCES garlic_a(id) ON DELETE SET NULL,
  name          TEXT,
  contact       TEXT,
  parcel_addr   TEXT,
  farmmap_id    TEXT,
  survey        JSONB NOT NULL DEFAULT '{}'::jsonb,
  write_data    CHAR(1) NOT NULL DEFAULT 'N',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS garlic_c_parcel_idx ON garlic_c (parcel_id);
CREATE INDEX IF NOT EXISTS garlic_c_updated_idx ON garlic_c (updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS garlic_c_parcel_unique
  ON garlic_c (parcel_id)
  WHERE parcel_id IS NOT NULL;

-- 필지측정 사진
CREATE TABLE IF NOT EXISTS garlic_img (
  id            BIGSERIAL PRIMARY KEY,
  survey_uuid   TEXT NOT NULL REFERENCES garlic_c(survey_uuid) ON DELETE CASCADE,
  slot          TEXT NOT NULL DEFAULT 'overview',
  img_path      TEXT NOT NULL,
  img_name      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS garlic_img_survey_idx ON garlic_img (survey_uuid);
