@echo off
chcp 65001 >nul
setlocal

REM 외부 SSH 기본 (내부망이면: set DEPLOY_SSH_HOST=192.168.50.192)
if not defined DEPLOY_SSH_HOST set "DEPLOY_SSH_HOST=182.213.27.207"
if not defined DEPLOY_SSH_PORT set "DEPLOY_SSH_PORT=60001"
if not defined DEPLOY_SSH_USER set "DEPLOY_SSH_USER=root"

if not defined DEPLOY_SSH_PASSWORD (
  echo SSH %DEPLOY_SSH_USER%@%DEPLOY_SSH_HOST% port %DEPLOY_SSH_PORT% ^(external^)
  set /p "DEPLOY_SSH_PASSWORD=password: "
)

cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" install --no-save ssh2
if errorlevel 1 exit /b 1

echo Deploying via %DEPLOY_SSH_USER%@%DEPLOY_SSH_HOST%:%DEPLOY_SSH_PORT% ...
"C:\Program Files\nodejs\node.exe" deploy_remote.js
if errorlevel 1 exit /b %ERRORLEVEL%

echo.
echo deploy done
exit /b 0
