@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: =============================================================================
:: Shapefile -> PostGIS (ogr2ogr) - 장수군 필지 앱 연동용
::
:: [중요] 앱/백엔드가 읽는 테이블: jangsucrops.tb_jangsu_info
::        public.tb_jangsu_info 에만 넣으면 마커가 안 보임
::
:: 사용법:
::   set PGPASSWORD=postgres
::   .\import_ogr2ogr.bat                    전량 이관 (기본 shp)
::   .\import_ogr2ogr.bat 5                  테스트 5건만 (TEST- 접두사, 기존 데이터 유지)
::   set SHP=C:\path\file.shp
::   .\import_ogr2ogr.bat                    다른 shp 경로 지정
:: =============================================================================

set "LIMIT=%~1"
if "%LIMIT%"=="" set "LIMIT=all"

set "PGHOST=192.168.50.192"
set "PGPORT=60039"
set "PGDATABASE=jangsucropsdb"
set "PGUSER=postgres"
set "TARGET_SCHEMA=jangsucrops"
set "TARGET_TABLE=tb_jangsu_info"

if "%PGPASSWORD%"=="" (
  set /p PGPASSWORD=PostgreSQL 비밀번호 입력:
)

if "%SHP%"=="" (
  set "SHP=%USERPROFILE%\Desktop\공유재산\장수군_공유재산.shp"
)

:: 원본 .prj 없을 때 소스 좌표계 (j.shp 등 EPSG:5186)
if "%SHP_SRS%"=="" (
  if /I "%SHP%"=="c:\jangsu\j\j.shp" set "SHP_SRS=EPSG:5186"
)

set "QGIS_ROOT=C:\Program Files\QGIS 3.44.11"
set "OGR2OGR=%QGIS_ROOT%\bin\ogr2ogr.exe"
set "PSQL=C:\Program Files\PostgreSQL\15\bin\psql.exe"
set "SCRIPT_DIR=%~dp0"

set "PATH=%QGIS_ROOT%\bin;%PATH%"
set "PROJ_LIB=%QGIS_ROOT%\share\proj"
set "GDAL_DATA=%QGIS_ROOT%\apps\gdal\share\gdal"

if not exist "%OGR2OGR%" (
  echo [오류] ogr2ogr 없음: %OGR2OGR%
  exit /b 1
)

if not exist "%SHP%" (
  echo [오류] shp 파일 없음: %SHP%
  echo        set SHP=경로 로 지정하거나 기본 경로에 파일을 두세요.
  exit /b 1
)

if /I "%LIMIT%"=="all" (
  set "SQL_FILE=%SCRIPT_DIR%import_shapefile_all.sql"
  set "IMPORT_DESC=전량이관-%TARGET_SCHEMA%.%TARGET_TABLE%"
) else (
  set "SQL_FILE=%SCRIPT_DIR%import_shapefile_test.sql"
  set "IMPORT_DESC=테스트%LIMIT%건-%TARGET_SCHEMA%.%TARGET_TABLE%"
)

echo.
echo ============================================================
echo  Shapefile -^> PostGIS import (앱 연동)
echo ============================================================
echo  쉐이프파일 : %SHP%
echo  스테이징   : public.stg_jangsu_parcels
echo  이관대상  : %TARGET_SCHEMA%.%TARGET_TABLE%
echo  이관모드   : %IMPORT_DESC%
echo  DB         : %PGHOST%:%PGPORT%/%PGDATABASE%
echo ============================================================
echo.

set "PG_CONN=PG:host=%PGHOST% port=%PGPORT% dbname=%PGDATABASE% user=%PGUSER% password=%PGPASSWORD%"

for %%F in ("%SHP%") do set "SHP_LAYER=%%~nF"

echo [1/4] ogr2ogr 스테이징 업로드...
set "OGR_EXTRA="
if not "%SHP_SRS%"=="" (
  set "OGR_EXTRA=-s_srs %SHP_SRS%"
  echo        소스 SRS: %SHP_SRS%
)

if /I "%SHP%"=="c:\jangsu\j\j.shp" (
  echo        j.shp: full import with land-use columns
  "%OGR2OGR%" -f PostgreSQL "%PG_CONN%" "%SHP%" ^
    -nln stg_jangsu_parcels ^
    -overwrite ^
    -lco GEOMETRY_NAME=geom ^
    -lco FID=gid ^
    -nlt PROMOTE_TO_MULTI ^
    %OGR_EXTRA% ^
    -t_srs EPSG:4326 ^
    -oo ENCODING=CP949
) else (
  "%OGR2OGR%" -f PostgreSQL "%PG_CONN%" "%SHP%" ^
    -nln stg_jangsu_parcels ^
    -overwrite ^
    -select pnu,jibun,col_adm_se,sgg_oid ^
    -lco GEOMETRY_NAME=geom ^
    -lco FID=gid ^
    -nlt PROMOTE_TO_MULTI ^
    %OGR_EXTRA% ^
    -t_srs EPSG:4326 ^
    -oo ENCODING=CP949
)

if errorlevel 1 (
  echo [오류] ogr2ogr 업로드 실패
  echo        - shp 인코딩: CP949 / 좌표계: WGS84 EPSG:4326 확인
  echo        - 한글 컬럼 오류 시 -select 옵션 유지 여부 확인
  exit /b 1
)

echo [2/4] ogr2ogr 스테이징 완료
echo.

if not exist "%PSQL%" (
  echo [안내] psql 없음. 아래 SQL을 순서대로 직접 실행하세요:
  echo   %SCRIPT_DIR%init_tb_jangsu_info.sql
  echo   %SQL_FILE%
  echo   %SCRIPT_DIR%verify_import.sql
  exit /b 0
)

set PGPASSWORD=%PGPASSWORD%

echo [3/4] PostGIS 준비 + %TARGET_SCHEMA% 스키마 이관...
"%PSQL%" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -v ON_ERROR_STOP=1 -f "%SCRIPT_DIR%init_tb_jangsu_info.sql"
if errorlevel 1 goto :sql_error

"%PSQL%" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -v ON_ERROR_STOP=1 -f "%SQL_FILE%"
if errorlevel 1 goto :sql_error

echo.
echo [4/4] 이관 결과 검증 (jangsucrops 스키마)...
"%PSQL%" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -v ON_ERROR_STOP=1 -f "%SCRIPT_DIR%verify_import.sql"
if errorlevel 1 goto :sql_error

echo.
echo ============================================================
echo  완료 - %IMPORT_DESC%
echo ============================================================
echo  앱 API 확인:
echo    http://182.213.27.207:60040/v1/jangsu/getBoundsList?minx=127.45^&miny=35.60^&maxx=127.58^&maxy=35.70
echo  지도 중심: 장수군청 (35.647556, 127.520889)
echo.
echo  [주의] 전량 이관(all)은 %TARGET_SCHEMA%.%TARGET_TABLE% 기존 데이터를 삭제합니다.
echo ============================================================
echo.
goto :done

:sql_error
echo.
echo [오류] SQL 실행 실패
echo        대상 스키마가 jangsucrops 인지, import_shapefile_all.sql 을 사용했는지 확인하세요.
exit /b 1

:done
endlocal
