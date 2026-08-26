# 쉐이프파일 → PostGIS 업로드 가이드 (장수군 공유재산)

기본 대상 파일: `%USERPROFILE%\Desktop\공유재산\장수군_공유재산.shp`

## ⚠️ 가장 중요: 앱이 읽는 테이블

| 구분 | 내용 |
|------|------|
| **앱/백엔드가 읽는 테이블** | **`public.field`** |
| 백엔드 DB 계정 | `jangsucrops` (search_path = `public,jangsucrops`) |
| import 시 postgres로 넣는 곳 | `public` 스키마 (스테이징) |
| **잘못된 경우** | 예전 `jangsucrops.tb_jangsu_info` 만 보면 앱 필지와 불일치 |

앱 연동 마이그레이션: `migrate_public_field_for_app.sql`

---

## 1. 파일 확인 (장수군_공유재산.shp)

| 항목 | 내용 |
|------|------|
| 필지 수 | **558건** |
| 좌표계 | **EPSG:4326** (WGS84, `.prj` 있음) |
| 인코딩 | **CP949** |
| 주요 컬럼 | `pnu`, `jibun`, `sgg_oid`, `col_adm_se` |
| 위치 | 장수군 일대 (경도 127.37~127.61, 위도 35.48~35.74) |

---

## 2. DB 연결 정보 (지침 8번)

```
Host: 192.168.50.192
Port: 60039 (docker `60039` → 5432)
DB:   jangsucropsdb
User: postgres  (import용)
```

앱 백엔드 연결: `jangsucrops` / `jangsucropsdb` / `192.168.50.192:60039` (`back/app/config/db.config.js`)

앱이 읽는 테이블: **`jangsucrops.tb_jangsu_info`** (필지), **`jangsucrops.tb_jangus_zone`** (조사구)

---

## 3. 방법 A — QGIS (가장 쉬움, GUI)

### 3-1. 레이어 불러오기
1. QGIS 실행 → **레이어 → 레이어 추가 → 벡터 레이어 추가**
2. `최종-조사대상필지.shp` 선택
3. CRS가 Unknown이면 **EPSG:5186** 으로 지정

### 3-2. PostgreSQL에 스테이징 테이블로 올리기
1. **데이터베이스 → DB 관리자 → 새 연결(PostgreSQL)**
2. 위 DB 정보 입력 후 연결
3. shp 레이어 우클릭 → **보내기 → Features보내기...**
   - Format: **PostgreSQL**
   - Table: `stg_jangsu_parcels`
   - CRS: **EPSG:4326** (WGS84로 변환해서 저장 권장)
   - Encoding: **EUC-KR**

### 3-3. 테스트용 5건만 본 테이블에 넣기
QGIS **DB 관리자 → SQL 창** 또는 DBeaver/pgAdmin에서 아래 실행:

```sql
-- back/scripts/import_shapefile_test.sql 참고
\i import_shapefile_test.sql
```

---

## 4. 방법 B — ogr2ogr (명령줄, PostGIS/GDAL 설치 시)

### 한 번에 실행 (Windows)

`back/scripts` 폴더에서:

```bat
cd c:\jangsu\back\scripts
set PGPASSWORD=postgres
.\import_ogr2ogr.bat          :: 전량 이관 → jangsucrops.tb_jangsu_info
.\import_ogr2ogr.bat 5        :: 테스트 5건 (TEST- 접두사, 기존 데이터 유지)
set SHP=C:\path\other.shp
.\import_ogr2ogr.bat          :: 다른 shp 경로 지정
```

- 스테이징: `public.stg_jangsu_parcels`
- 이관 대상: **`jangsucrops.tb_jangsu_info`** (`import_shapefile_all.sql`)
- 완료 후 `verify_import.sql` 로 건수·좌표범위 자동 검증

### 수동 명령 (QGIS 3.44 GDAL)

```bat
set PGPASSWORD=비밀번호

"C:\Program Files\QGIS 3.44.11\bin\ogr2ogr.exe" -f PostgreSQL ^
  "PG:host=192.168.50.192 port=60039 dbname=jangsucropsdb user=postgres password=%PGPASSWORD%" ^
  "%USERPROFILE%\Desktop\장수군_공유재산필지\최종-조사대상필지.shp" ^
  -nln stg_jangsu_parcels ^
  -overwrite ^
  -sql "SELECT * FROM \"최종-조사대상필지\" LIMIT 5" ^
  -lco GEOMETRY_NAME=geom ^
  -lco FID=gid ^
  -nlt PROMOTE_TO_MULTI ^
  -s_srs EPSG:5186 ^
  -t_srs EPSG:4326 ^
  -oo ENCODING=EUC-KR
```

이후 SQL 이관:

```bat
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -h 192.168.50.192 -p 60039 -U postgres -d jangsucropsdb -f import_shapefile_test.sql
```

전체 558건을 스테이징만 할 때는 `-sql ... LIMIT 5` 옵션을 제거하세요.

---

## 5. 방법 C — Node 스크립트 (로컬에서 SQL 파일 생성)

백엔드 폴더에서:

```bat
cd back
npm install shapefile
node scripts/import_shapefile_to_postgis.js ^
  "C:\Users\USER\Desktop\장수군_공유재산필지\최종-조사대상필지.shp" ^
  --limit 5 ^
  --output scripts/out_test_parcels.sql
```

생성된 SQL을 DB에서 실행.

---

## 6. 앱에서 마커가 보이려면 (필수 컬럼)

`getBoundsList` API가 사용하는 최소 조건:

| 컬럼 | 설명 |
|------|------|
| `fpop_key` | 필지 고유키 (UUID 등, **중복 불가**) |
| `grp_id` | 조사구 ID (같은 구역은 동일 값) |
| `pnu` | 필지번호 |
| `addr` | 지번/주소 (`jibun` 매핑) |
| `geom` | **EPSG:4326** 폴리곤, NOT NULL |
| `geo_center` | 중심점 (없으면 DB에서 `ST_Centroid(geom)` 사용 가능) |

마커 라벨용(선택): `fm_land_cd`, `crop_nm`, `inspection_flag`, `working_in_july`

---

## 7. 업로드 후 확인

```sql
-- 필지 5건 확인
SELECT fpop_key, pnu, addr,
       ST_SRID(geom),
       ST_AsText(ST_Centroid(geom))
FROM tb_jangsu_info
ORDER BY reg_date DESC NULLS LAST
LIMIT 5;
```

API 테스트 (순창군 필지 위치 근처 bbox):

```
GET http://182.213.27.207:60040/v1/jangsu/getBoundsList?minx=127.10&miny=35.30&maxx=127.25&maxy=35.45
```

앱에서는 해당 위치로 지도를 이동하거나, 장수군 데이터를 넣은 뒤 장수군청 근처에서 확인하세요.

---

## 8. 장수군만 골라 넣고 싶을 때

이 쉐이프에는 **45720(장수군) PNU가 없습니다.**  
장수군 테스트용으로는:

1. 장수군 공유재산 쉐이프를 다시 받거나  
2. PNU `LIKE '45720%'` 조건으로 필터된 파일을 사용하세요.

```sql
-- 스테이징에서 장수군만 (다른 파일 업로드 후)
SELECT COUNT(*) FROM stg_jangsu_parcels WHERE pnu LIKE '45720%';
```
