-- J2 이관 컬럼 오매핑 보정
-- 잘못됨: col_a=재산구분, col_b=회계구분, col_c=재산관리관, addr=짧은지번
-- 목표: col_a=관리번호(PNU), addr/col_f=전체주소(도로명), 재산·회계·관리관은 col_u/v/w

\set ON_ERROR_STOP on

UPDATE public.field f
SET
  col_a = f.pnu,
  col_b = NULLIF(TRIM(s."지번"), ''),
  col_c = NULL,
  col_f = NULLIF(TRIM(s."도로명"), ''),
  col_u = NULLIF(TRIM(s."재산구분"), ''),
  col_v = NULLIF(TRIM(s."회계구분"), ''),
  col_w = NULLIF(TRIM(s."재산관리관"), ''),
  col_x = NULLIF(TRIM(s."분업관리관"), ''),
  col_y = NULLIF(TRIM(s."위임관리관"), ''),
  col_z = NULLIF(TRIM(s."재산번호"::text), ''),
  addr = COALESCE(
    NULLIF(TRIM(s."위치"), ''),
    NULLIF(TRIM(s."도로명"), ''),
    NULLIF(TRIM(s."지번"), ''),
    f.pnu
  ),
  mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')
FROM public.stg_j2_parcels s
WHERE f.grp_id = 'J2'
  AND f.pnu = NULLIF(TRIM(s.pnu), '');

SELECT
  fpop_key,
  col_a AS manage_no,
  left(addr, 60) AS addr,
  left(col_f, 60) AS col_f,
  col_u,
  col_v
FROM public.field
WHERE grp_id = 'J2'
ORDER BY gid;
