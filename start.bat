@echo off
echo ========================================
echo   JaagrukVoter - Starting Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 4000)...
start "JaagrukVoter Backend" cmd /k "cd backend/node-server && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 3000)...
start "JaagrukVoter Frontend" cmd /k "node serve.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Open your browser and go to:
echo   http://localhost:3000/login.html
echo.
echo Press any key to exit this window...
echo (The servers will continue running in separate windows)
pause >nul





