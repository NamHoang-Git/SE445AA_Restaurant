@echo off
REM run_etl_v2.bat - ETL with incremental support

echo ========================================
echo ETL Pipeline Runner v2
echo ========================================
echo.

if "%1"=="--incremental" (
    echo Mode: INCREMENTAL
    node scripts\run_etl_incremental.js --incremental
) else (
    echo Mode: FULL
    node scripts\run_etl_incremental.js --full
)

echo.
echo ========================================
echo ETL Pipeline Complete
echo ========================================
pause
