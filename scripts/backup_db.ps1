# jangsucropsdb (PostGIS) 예비 백업 스크립트
# 사용법(예):
#   powershell -ExecutionPolicy Bypass -File .\scripts\backup_db.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\backup_db.ps1 -OutDir "D:\db_backups"
#
# 주의: DB 서버(192.168.50.192:60039)로의 네트워크 연결이 가능해야 실행됩니다.

param(
  [string]$DbHost   = "192.168.50.192",
  [int]$Port        = 60039,
  [string]$User     = "jangsucrops",
  [string]$Password = "jangsucrops123",
  [string]$Db       = "jangsucropsdb",
  [string]$OutDir   = "C:\j\jangsu\backups",
  [string]$PgBin    = "C:\Program Files\PostgreSQL\15\bin"
)

$ErrorActionPreference = "Stop"

$pgDump = Join-Path $PgBin "pg_dump.exe"
if (-not (Test-Path $pgDump)) { throw "pg_dump.exe를 찾을 수 없습니다: $pgDump" }

# 연결 사전 점검
$reach = Test-NetConnection $DbHost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $reach) { throw "DB 서버 연결 불가: ${DbHost}:${Port} (방화벽/VPN/포트 확인 필요)" }

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$stamp   = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $OutDir "${Db}_${stamp}.dump"

$env:PGPASSWORD = $Password
Write-Host "[백업 시작] $Db -> $outFile"

# -Fc: custom(압축) 포맷 (pg_restore로 복원). PostGIS 확장 포함 전체 덤프.
& $pgDump -h $DbHost -p $Port -U $User -d $Db -Fc -Z 6 --no-owner --no-privileges -v -f $outFile

if ($LASTEXITCODE -ne 0) { throw "pg_dump 실패 (exit=$LASTEXITCODE)" }

$size = (Get-Item $outFile).Length
Write-Host ("[백업 완료] {0} ({1:N1} MB)" -f $outFile, ($size / 1MB))
Write-Host "복원 예시: pg_restore -h HOST -p PORT -U USER -d 대상DB --no-owner --no-privileges `"$outFile`""
