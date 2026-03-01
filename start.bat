@echo off
echo ====================================
echo   🚀 KHỞI ĐỘNG MYPHAMVIET
echo ====================================
echo.

REM Kiểm tra MongoDB
echo ✅ Đang kiểm tra MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB đang chạy
) else (
    echo ⚠️  MongoDB chưa chạy! Vui lòng mở MongoDB Compass hoặc chạy mongod
    echo.
)

echo.
echo 📦 Khởi động Backend (port 5002)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo 🎨 Khởi động Frontend (port 5173)...
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo   ✅ HOÀN THÀNH!
echo ====================================
echo.
echo 🌐 Backend: http://localhost:5002
echo 🌐 Frontend: http://localhost:5173
echo.
echo 👤 Tài khoản Admin:
echo    Email: admin@myphamviet.com
echo    Password: admin123
echo.
echo ⚠️  Để tắt server, đóng cửa sổ terminal
echo ====================================
pause
