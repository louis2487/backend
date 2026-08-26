-- 대부가능여(Y/N) → col_ah(적합여부)
\set ON_ERROR_STOP on

UPDATE jangsucrops.tb_jangsu_info t
SET col_ah = CASE UPPER(TRIM(COALESCE(s."대부가능여", '')))
  WHEN 'Y' THEN 'Y'
  ELSE 'N'
END
FROM public.stg_jangsu_parcels s
WHERE t.pnu = NULLIF(TRIM(s.pnu), '');

SELECT col_ah, COUNT(*) AS cnt
FROM jangsucrops.tb_jangsu_info
GROUP BY col_ah
ORDER BY col_ah;
