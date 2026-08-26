@echo off
chcp 65001 >nul
setlocal

REM 1) zoning-web production build → back/zoning-web
REM 2) SSH upload + container restart

if not defined DEPLOY_SSH_HOST set "DEPLOY_SSH_HOST=182.213.27.207"
if not defined DEPLOY_SSH_PORT set "DEPLOY_SSH_PORT=60001"
if not defined DEPLOY_SSH_USER set "DEPLOY_SSH_USER=root"

if not defined DEPLOY_SSH_PASSWORD (
  echo SSH %DEPLOY_SSH_USER%@%DEPLOY_SSH_HOST% port %DEPLOY_SSH_PORT%
  set /p "DEPLOY_SSH_PASSWORD=password: "
)

set "ZONING_WEB=C:\sejong\zoning-web"
set "DEST=%~dp0..\zoning-web"

echo [1/3] Build zoning-web ...
cd /d "%ZONING_WEB%"
call "C:\Program Files\nodejs\npm.cmd" run build
if errorlevel 1 exit /b 1

echo [2/3] Copy dist → back\zoning-web ...
if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%"
xcopy /E /I /Y "%ZONING_WEB%\dist\*" "%DEST%\" >nul
if not exist "%DEST%\index.html" (
  echo ERROR: index.html missing after copy
  exit /b 1
)

echo [3/3] Deploy via SSH ...
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" install --no-save ssh2
if errorlevel 1 exit /b 1

"C:\Program Files\nodejs\node.exe" deploy_zoning_remote.js
if errorlevel 1 exit /b %ERRORLEVEL%

echo.
echo Open: http://182.213.27.207:60040/zoning-web/
exit /b 0
