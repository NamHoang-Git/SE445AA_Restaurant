@echo off
echo ============================================
echo   CHAY TOAN BO ETL PIPELINE (NHA HANG + KHO)
echo ============================================
echo.

echo [0/5] Reset STAGING...
node scripts/reset_staging.js

REM 1. Day du lieu tu CSV (nha hang) len RabbitMQ
echo [1/5] Producer CSV - Nha hang (user/product/order)...
node producer_user.js
node producer_product.js
node producer_order.js

echo.
REM 2. Day du lieu tu MongoDB Warehouse (kho) len RabbitMQ
echo [2/5] Producer Mongo - Kho (import/export)...
node producer_wh_import.js
node producer_wh_export.js

echo.
REM 3. Transform + Load Nha hang
echo [3/5] Transform + Load NHA HANG vao DW...
node scripts/transform_load.js

echo.
REM 4. Transform + Load Kho
echo [4/5] Transform + Load KHO vao DW...
node scripts/transform_load_warehouse.js

echo.
REM 5. Analytics / Bao cao
echo [5/5] Chay Analytics Reports tu DW...
node scripts/analytics_reports.js

echo.
echo ===============================
echo   HOAN TAT ETL + BAO CAO DW!
echo ===============================
pause
