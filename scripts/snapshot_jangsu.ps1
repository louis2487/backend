# tb_jangsu_info 날짜별 스냅샷 백업 (방식 C, 같은 DB 내)
# - 원본:  192.168.50.192:60039 / jangsucropsdb / public.field
# - 대상:  같은 DB jangsucropsdb 의 snapshots.field_YYYYMMDD (별도 스키마)
# - 보관:  최근 N개(기본 14) 유지, 오래된 스냅샷 자동 삭제
# - 로그:  jangsucropsdb.snapshots.backup_log
#
# 수동 실행:
#   powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_jangsu.ps1
# 다른 보관 개수:
#   powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_jangsu.ps1 -Keep 30

param(
  [string]$DbHost    = "192.168.50.192",
  [int]$Port         = 60039,
  [string]$User      = "jangsucrops",
  [string]$Password  = "jangsucrops123",
  [string]$Db        = "jangsucropsdb",
  [string]$SrcSchema = "public",
  [string]$Table     = "field",
  [string]$SnapSchema= "snapshots",
  [int]$Keep         = 14,
  [string]$PgBin     = "C:\Program Files\PostgreSQL\15\bin"
)

$ErrorActionPreference = "Stop"
$env:PGPASSWORD = $Password
# NOTICE 억제(DROP IF EXISTS 등) — stderr 노이즈로 인한 오탐 방지
$env:PGOPTIONS  = "-c client_min_messages=warning"

$psql = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psql)) { throw "실행파일 없음: $psql" }

$stamp    = Get-Date -Format "yyyyMMdd"
$snapName = ($Table + "_" + $stamp)

function Invoke-Native {
  param([Parameter(Mandatory = $true)][scriptblock]$Cmd, [string]$What = "명령")
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $out = & $Cmd 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) {
    $joined = ($out -join [Environment]::NewLine)
    throw ($What + " 실패 (exit=" + $code + "): " + $joined)
  }
  return $out
}

function Invoke-Psql {
  param([string]$Sql)
  $out = Invoke-Native -What "psql" -Cmd { & $psql -h $DbHost -p $Port -U $User -d $Db -v ON_ERROR_STOP=1 -tAc $Sql }
  return ($out | Where-Object { $_ -is [string] })
}

function Get-LastLine {
  param($Value)
  return ("" + ($Value | Select-Object -Last 1)).Trim()
}

Write-Host ("[스냅샷 백업 시작] " + $Db + "." + $SrcSchema + "." + $Table + " -> " + $Db + "." + $SnapSchema + "." + $snapName)

# 연결 점검
if (-not (Test-NetConnection $DbHost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue)) {
  throw ("DB 서버 연결 불가: " + $DbHost + ":" + $Port)
}

# 1) 스키마/로그테이블 준비(멱등)
$initTmpl = @'
CREATE SCHEMA IF NOT EXISTS {SNAP};
CREATE TABLE IF NOT EXISTS {SNAP}.backup_log (
  id             bigserial PRIMARY KEY,
  taken_at       timestamptz NOT NULL DEFAULT now(),
  snapshot_table text        NOT NULL,
  row_count      bigint,
  status         text        NOT NULL,
  message        text
);
'@
$initSql = $initTmpl.Replace('{SNAP}', $SnapSchema)
Invoke-Psql -Sql $initSql | Out-Null

try {
  # 2) 날짜별 스냅샷 테이블 생성(같은 DB 내 CTAS, 멱등)
  $snapTmpl = @'
DROP TABLE IF EXISTS {SNAP}.{SNAPNAME} CASCADE;
CREATE TABLE {SNAP}.{SNAPNAME} AS TABLE {SRC}.{TABLE};
'@
  $snapSql = $snapTmpl.Replace('{SNAPNAME}', $snapName).Replace('{SNAP}', $SnapSchema).Replace('{SRC}', $SrcSchema).Replace('{TABLE}', $Table)
  Invoke-Psql -Sql $snapSql | Out-Null

  # 3) 행수 확인 + 로그
  $rows = Get-LastLine (Invoke-Psql -Sql ("select count(*) from " + $SnapSchema + "." + $snapName + ";"))
  Invoke-Psql -Sql ("INSERT INTO " + $SnapSchema + ".backup_log(snapshot_table,row_count,status,message) VALUES ('" + $snapName + "', " + $rows + ", 'success', 'ok');") | Out-Null

  # 4) 보관 정책: 최근 N개만 유지
  $retTmpl = @'
DO $$
DECLARE r record; cnt int := 0;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables
    WHERE schemaname='{SNAP}' AND tablename ~ '^{TABLE}_[0-9]{8}$'
    ORDER BY tablename DESC
  LOOP
    cnt := cnt + 1;
    IF cnt > {KEEP} THEN
      EXECUTE format('DROP TABLE IF EXISTS {SNAP}.%I CASCADE', r.tablename);
    END IF;
  END LOOP;
END $$;
'@
  $retentionSql = $retTmpl.Replace('{SNAP}', $SnapSchema).Replace('{TABLE}', $Table).Replace('{KEEP}', ("" + $Keep))
  Invoke-Psql -Sql $retentionSql | Out-Null

  $cntTmpl = "select count(*) from pg_tables where schemaname='{SNAP}' and tablename ~ '^{TABLE}_[0-9]{8}`$'"
  $cntSql  = $cntTmpl.Replace('{SNAP}', $SnapSchema).Replace('{TABLE}', $Table)
  $kept = Get-LastLine (Invoke-Psql -Sql $cntSql)
  Write-Host ("[스냅샷 백업 완료] " + $SnapSchema + "." + $snapName + " (" + $rows + " 행), 보관 스냅샷 수: " + $kept + " (최대 " + $Keep + ")")
}
catch {
  $msg = ($_.Exception.Message -replace "'", "''")
  try { Invoke-Psql -Sql ("INSERT INTO " + $SnapSchema + ".backup_log(snapshot_table,row_count,status,message) VALUES ('" + $snapName + "', NULL, 'fail', '" + $msg + "');") | Out-Null } catch {}
  throw
}
