@echo off
TITLE Credit Card Platform - Automatic Starter
echo ==========================================
echo    CREDIT CARD PLATFORM - AUTO STARTER
echo ==========================================
echo.

echo [1/3] Checking dependencies...
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..

echo.
echo [2/3] Starting Services...
echo (This will open in a new window)
start cmd /k "npm run dev"

echo.
echo [3/3] Opening Dashboard...
timeout /t 5
start http://localhost:3005

echo.
echo ==========================================
echo ✅ PROJECT IS RUNNING! 
echo Keep this window open to see logs.
echo ==========================================
pause
