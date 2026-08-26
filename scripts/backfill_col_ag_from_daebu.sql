-- 대부사용허 > 0 → col_ag = Y(대부중), else N(미대부)
\set ON_ERROR_STOP on

UPDATE jangsucrops.tb_jangsu_info t
SET col_ag = CASE
  WHEN COALESCE(s."대부사용허", 0)::numeric > 0 THEN 'Y'
  ELSE 'N'
END
FROM public.stg_jangsu_parcels s
WHERE t.pnu = NULLIF(TRIM(s.pnu), '');

SELECT
  col_ag,
  COUNT(*) AS cnt
FROM jangsucrops.tb_jangsu_info
GROUP BY col_ag
ORDER BY col_ag;
