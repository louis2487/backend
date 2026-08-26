-- 대부사용허 건수 → col_ap(피대부자 수)
\set ON_ERROR_STOP on

UPDATE jangsucrops.tb_jangsu_info t
SET col_ap = COALESCE(s."대부사용허", 0)::bigint::text
FROM public.stg_jangsu_parcels s
WHERE t.pnu = NULLIF(TRIM(s.pnu), '');

SELECT col_ap, COUNT(*) AS cnt
FROM jangsucrops.tb_jangsu_info
GROUP BY col_ap
ORDER BY col_ap;
