-- PostGIS 확장만 확인 (스테이징·이관 전 준비)
-- ※ 앱이 읽는 테이블: jangsucrops.tb_jangsu_info
-- ※ public.tb_jangsu_info 는 앱에서 사용하지 않음 (import_shapefile_all.sql 이 동기화만 함)

CREATE EXTENSION IF NOT EXISTS postgis;
