# 🚀 Script khởi động MYPHAMVIET
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  🚀 KHỞI ĐỘNG MYPHAMVIET" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra MongoDB
Write-Host "✅ Đang kiểm tra MongoDB..." -ForegroundColor Green
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB đang chạy" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB chưa chạy! Vui lòng mở MongoDB Compass hoặc chạy mongod" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Khởi động Backend (port 5002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎨 Khởi động Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  ✅ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Tài khoản Admin:" -ForegroundColor Yellow
Write-Host "   Email:    admin@myphamviet.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Để tắt server, đóng cửa sổ terminal của Backend và Frontend" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhấn phím bất kỳ để đóng cửa sổ này..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
