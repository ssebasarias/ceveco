@echo off
echo ========================================
echo BACKUP RAPIDO DE BASE DE DATOS CEVECO
echo ========================================
echo.

cd /d "%~dp0"

echo Ejecutando backup...
echo.

powershell -ExecutionPolicy Bypass -File "backup-database.ps1"

echo.
echo Presiona cualquier tecla para salir...
pause >nul
