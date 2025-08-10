Write-Host "Starting AI Coach Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Python AI Service on port 7861..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py" -WindowStyle Normal

Write-Host "Waiting for AI service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting Node.js Web Server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "AI Service: http://localhost:7861" -ForegroundColor Cyan
Write-Host "Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
