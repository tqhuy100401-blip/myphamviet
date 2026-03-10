# Kill all node processes
Write-Host "Stopping all node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for processes to close
Start-Sleep -Seconds 2

# Start the backend
Write-Host "Starting backend..." -ForegroundColor Green
npm run dev
