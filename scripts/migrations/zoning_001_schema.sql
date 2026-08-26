-- zoning module schema (prefix zb_ — isolated from jangsu/shared-property)
-- Run against the same Postgres/PostGIS DB used by property-back.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS zb_inspection_target (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  sido        TEXT NOT NULL,
  sigungu     TEXT NOT NULL,
  theme       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zb_feature (
  id            TEXT PRIMARY KEY,
  target_id     TEXT NOT NULL REFERENCES zb_inspection_target(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  error_count   INT NOT NULL DEFAULT 0,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  notice_no     TEXT NOT NULL,
  notice_date   TEXT NOT NULL,
  location      TEXT NOT NULL,
  notice_area   DOUBLE PRECISION NOT NULL DEFAULT 0,
  source        TEXT NOT NULL DEFAULT '',
  actual_area   DOUBLE PRECISION NOT NULL DEFAULT 0,
  centroid_lat  DOUBLE PRECISION NOT NULL,
  centroid_lng  DOUBLE PRECISION NOT NULL,
  polygon       JSONB NOT NULL DEFAULT '[]'::jsonb,
  errors        JSONB NOT NULL DEFAULT '[]'::jsonb,
  maintenances  JSONB NOT NULL DEFAULT '[]'::jsonb,
  geom          geometry(Polygon, 4326),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS zb_feature_target_idx ON zb_feature(target_id);

CREATE TABLE IF NOT EXISTS zb_parcel (
  id                      TEXT PRIMARY KEY,
  feature_id              TEXT NOT NULL REFERENCES zb_feature(id) ON DELETE CASCADE,
  pnu                     TEXT NOT NULL,
  jibun_before            TEXT,
  jibun_after             TEXT,
  owner_type_before       TEXT,
  owner_type_after        TEXT,
  geom_area_before        DOUBLE PRECISION,
  geom_area_after         DOUBLE PRECISION,
  inclusion_area_before   DOUBLE PRECISION,
  inclusion_area_after    DOUBLE PRECISION,
  change_type             TEXT NOT NULL DEFAULT 'unchanged'
);

CREATE INDEX IF NOT EXISTS zb_parcel_feature_idx ON zb_parcel(feature_id);

CREATE TABLE IF NOT EXISTS zb_gosi (
  id          TEXT PRIMARY KEY,
  feature_id  TEXT NOT NULL REFERENCES zb_feature(id) ON DELETE CASCADE,
  notice_no   TEXT NOT NULL,
  title       TEXT NOT NULL,
  gosi_date   TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_drawing  BOOLEAN NOT NULL DEFAULT FALSE,
  file_path   TEXT
);

CREATE INDEX IF NOT EXISTS zb_gosi_feature_idx ON zb_gosi(feature_id);

CREATE TABLE IF NOT EXISTS zb_inspection_result (
  feature_id  TEXT PRIMARY KEY REFERENCES zb_feature(id) ON DELETE CASCADE,
  verdict     TEXT NOT NULL,
  opinion     TEXT NOT NULL DEFAULT '',
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  user_id     TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zb_marker (
  id          TEXT PRIMARY KEY,
  feature_id  TEXT NOT NULL REFERENCES zb_feature(id) ON DELETE CASCADE,
  tool        TEXT NOT NULL,
  points      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS zb_marker_feature_idx ON zb_marker(feature_id);

CREATE TABLE IF NOT EXISTS zb_layer_catalog (
  id          SERIAL PRIMARY KEY,
  side        TEXT NOT NULL CHECK (side IN ('before', 'after')),
  tree        JSONB NOT NULL
);
