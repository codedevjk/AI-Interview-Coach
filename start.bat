@echo off
echo Starting AI Coach Application...
echo.

echo Starting Python AI Service on port 7861...
start "AI Service" cmd /k "python app.py"

echo Waiting for AI service to start...
timeout /t 5 /nobreak > nul

echo Starting Node.js Web Server on port 3000...
start "Web Server" cmd /k "npm start"

echo.
echo Both services are starting...
echo AI Service: http://localhost:7861
echo Web App: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
