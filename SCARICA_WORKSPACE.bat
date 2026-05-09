@echo off
setlocal
set "WS=%~dp0"
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set d=%%d%%b%%c
for /f "tokens=1-3 delims=:., " %%a in ("%time%") do set t=%%a%%b%%c
set "OUT=%USERPROFILE%\Downloads\ScrivaniaDelPotere_workspace_%d%_%t%.zip"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%WS%*' -DestinationPath '%OUT%' -CompressionLevel Optimal"
echo.
echo ZIP creato: %OUT%
pause
endlocal
