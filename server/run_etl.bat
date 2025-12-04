@echo off
REM run_etl.bat - Windows batch script to run full ETL pipeline

echo ╔════════════════════════════════════════════════════════╗
echo ║   SE445AA Restaurant - Full ETL Pipeline Runner       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 🚀 Starting ETL Pipeline...
echo.

node scripts\run_full_etl.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ETL Pipeline failed!
    pause
    exit /b 1
)

echo.
echo ✅ ETL Pipeline completed successfully!
pause
