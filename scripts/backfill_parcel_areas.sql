-- 기존 필지의 면적(av_area, land_area)을 geom에서 계산해 채움
-- 쉐이프파일만 이관한 뒤 면적이 비어 있을 때 실행

UPDATE jangsucrops.tb_jangsu_info
SET
  land_area = ROUND(ST_Area(geom::geography)::numeric, 1)::int,
  av_area = ROUND(ST_Area(geom::geography)::numeric, 1)::int,
  mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')
WHERE geom IS NOT NULL
  AND (av_area IS NULL OR land_area IS NULL);

UPDATE public.tb_jangsu_info
SET
  land_area = ROUND(ST_Area(geom::geography)::numeric, 1)::int,
  av_area = ROUND(ST_Area(geom::geography)::numeric, 1)::int,
  mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')
WHERE geom IS NOT NULL
  AND (av_area IS NULL OR land_area IS NULL);

SELECT COUNT(*) AS with_area
FROM jangsucrops.tb_jangsu_info
WHERE av_area IS NOT NULL;
