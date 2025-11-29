@echo off
echo ========================================
echo    CEVECO - INICIO DEL PROYECTO
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si PostgreSQL está instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] psql no está en el PATH
    echo Si tienes PostgreSQL instalado, agrega su carpeta bin al PATH
    echo O usa pgAdmin para ejecutar bd.sql
    echo.
)

echo [1/3] Verificando dependencias del backend...
cd backend
if not exist node_modules (
    echo Instalando dependencias del backend...
    call npm install
) else (
    echo Dependencias ya instaladas
)

echo.
echo [2/3] Verificando configuración...
if not exist .env (
    echo [ADVERTENCIA] Archivo .env no encontrado
    echo Por favor configura las variables de entorno en backend/.env
    echo.
)

echo.
echo [3/3] Iniciando servidor backend...
echo.
echo ========================================
echo   Backend corriendo en http://localhost:3000
echo   Frontend: Abre frontend/pages/index.html
echo            con Live Server o un servidor HTTP
echo ========================================
echo.
echo Presiona CTRL+C para detener el servidor
echo.

call npm run dev

pause
