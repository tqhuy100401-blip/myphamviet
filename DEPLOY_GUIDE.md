# 🚀 HƯỚNG DẪN DEPLOY MỸ PHẨM VIỆT (MIỄN PHÍ)

Deploy website lên môi trường production hoàn toàn miễn phí với:
- **Frontend**: Vercel
- **Backend**: Render  
- **Database**: MongoDB Atlas

---

## 📋 CHUẨN BỊ

### 1. Tạo tài khoản (nếu chưa có):
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database
- [Render](https://render.com/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting
- [GitHub](https://github.com/) - Source code repository

### 2. Push code lên GitHub:
```bash
cd d:\REACT+NODE\myphamViet
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/username/myphamviet.git
git push -u origin main
```

---

## 🗄️ BƯỚC 1: SETUP DATABASE (MongoDB Atlas)

### 1. Tạo cluster miễn phí:
1. Đăng nhập [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Build a Database"**
3. Chọn **FREE** tier (M0 Sandbox)
4. Chọn region gần bạn nhất (Singapore cho VN)
5. Click **"Create Cluster"** (chờ 3-5 phút)

### 2. Cấu hình Network Access:
1. Menu bên trái → **Network Access**
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 3. Tạo Database User:
1. Menu bên trái → **Database Access**
2. Click **"Add New Database User"**
3. Username: `myphamviet_admin`
4. Password: Tạo mật khẩu mạnh (lưu lại)
5. Database User Privileges: **"Atlas admin"**
6. Click **"Add User"**

### 4. Lấy Connection String:
1. Menu bên trái → **Database**
2. Click nút **"Connect"** của cluster
3. Chọn **"Connect your application"**
4. Copy connection string, format:
```
mongodb+srv://myphamviet_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Thay `<password>` bằng password thật
6. Thêm tên database sau `.net/`: `myphamviet`
```
mongodb+srv://myphamviet_admin:password123@cluster0.xxxxx.mongodb.net/myphamviet?retryWrites=true&w=majority
```
✅ **LƯU LẠI CONNECTION STRING NÀY!**

---

## 🔧 BƯỚC 2: DEPLOY BACKEND (Render)

### 1. Tạo Web Service:
1. Đăng nhập [Render](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository của bạn
4. Chọn repo `myphamviet`

### 2. Cấu hình service:
```
Name: myphamviet-backend
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 3. Chọn plan:
- Instance Type: **Free**

### 4. Environment Variables (rất quan trọng!):
Click **"Advanced"** → **"Add Environment Variable"**, thêm các biến sau:

```
NODE_ENV=production
PORT=5002
MONGO_URI=mongodb+srv://myphamviet_admin:password123@cluster0.xxxxx.mongodb.net/myphamviet?retryWrites=true&w=majority
JWT_SECRET=super-secret-random-string-change-this-abc123xyz
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**Lưu ý:**
- `MONGO_URI`: Connection string từ MongoDB Atlas
- `JWT_SECRET`: Tạo chuỗi ngẫu nhiên dài (dùng generator hoặc tự tạo)
- `FRONTEND_URL`: Sẽ cập nhật sau khi deploy frontend
- `EMAIL_PASSWORD`: [App Password của Gmail](https://support.google.com/accounts/answer/185833)

### 5. Deploy:
1. Click **"Create Web Service"**
2. Chờ 5-10 phút để build và deploy
3. Khi thấy **"Live"** → Backend đã online!
4. URL backend: `https://myphamviet-backend.onrender.com`

### 6. Test API:
Mở trình duyệt, truy cập:
```
https://myphamviet-backend.onrender.com/api/health
```
Phải trả về:
```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2026-03-01T..."
}
```

✅ **LƯU LẠI URL BACKEND!**

---

## 🌐 BƯỚC 3: DEPLOY FRONTEND (Vercel)

### 1. Import project:
1. Đăng nhập [Vercel](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository `myphamviet`

### 2. Cấu hình project:
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build (tự động detect)
Output Directory: dist (tự động detect)
Install Command: npm install (tự động detect)
```

### 3. Environment Variables:
Click **"Environment Variables"**, thêm:
```
VITE_API_URL=https://myphamviet-backend.onrender.com/api
```
(Thay URL backend thật từ bước 2)

### 4. Deploy:
1. Click **"Deploy"**
2. Chờ 2-3 phút
3. Khi thấy **"Ready"** → Frontend đã online!
4. URL frontend: `https://myphamviet-xxx.vercel.app`

### 5. Copy URL Vercel:
Ví dụ: `https://myphamviet-abc123.vercel.app`

---

## 🔗 BƯỚC 4: UPDATE CORS BACKEND

**Quan trọng!** Phải cập nhật URL frontend vào backend để CORS hoạt động:

### 1. Quay lại Render Dashboard:
1. Vào service `myphamviet-backend`
2. Menu bên trái → **"Environment"**
3. Tìm biến `FRONTEND_URL`
4. Sửa thành URL Vercel thật:
```
FRONTEND_URL=https://myphamviet-abc123.vercel.app
```
5. Click **"Save Changes"**
6. Service sẽ tự động redeploy (chờ 2-3 phút)

---

## ✅ BƯỚC 5: KIỂM TRA & SỬ DỤNG

### 1. Test website:
Mở URL Vercel của bạn, ví dụ:
```
https://myphamviet-abc123.vercel.app
```

### 2. Test các tính năng:
- ✅ Đăng ký tài khoản → Nhận OTP qua email
- ✅ Đăng nhập
- ✅ Xem sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Admin panel (nếu có)

### 3. Tạo tài khoản Admin đầu tiên:
Truy cập terminal của Render service:
1. Render Dashboard → Service → **"Shell"**
2. Chạy lệnh:
```bash
cd backend
node seedAdmin.js
```
Hoặc dùng MongoDB Atlas UI để tạo user với role: "admin"

---

## 🎯 URL HOÀN CHỈNH

Sau khi deploy xong, bạn sẽ có:

| Service | URL |
|---------|-----|
| **Website (Frontend)** | `https://myphamviet-xxx.vercel.app` |
| **API (Backend)** | `https://myphamviet-backend.onrender.com` |
| **Database** | MongoDB Atlas Cloud |

---

## 🔄 UPDATE CODE SAU NÀY

### Khi sửa Frontend:
```bash
git add .
git commit -m "Update frontend"
git push
```
→ Vercel tự động deploy (30-60 giây)

### Khi sửa Backend:
```bash
git add .
git commit -m "Update backend"
git push
```
→ Render tự động deploy (3-5 phút)

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Free Tier Render:
- Backend sẽ "ngủ" sau 15 phút không dùng
- Lần truy cập đầu tiên sau khi ngủ sẽ mất 30-60 giây để "thức dậy"
- Giải pháp: Dùng [cron-job.org](https://cron-job.org) ping mỗi 10 phút

### 2. Email Gmail:
- Phải bật 2-Step Verification
- Tạo [App Password](https://myaccount.google.com/apppasswords) riêng
- Không dùng password Gmail thường

### 3. MongoDB Atlas Free:
- Giới hạn 512MB storage
- Backup tự động trong 2 ngày
- Đủ cho 1000-5000 users

### 4. File Upload:
- Render Free không lưu file lâu dài
- File upload sẽ mất khi redeploy
- Giải pháp: Dùng Cloudinary (miễn phí 25GB)

---

## 🐛 TROUBLESHOOTING

### Lỗi CORS:
```
Access to fetch has been blocked by CORS policy
```
→ Kiểm tra `FRONTEND_URL` trong Render Environment Variables

### Backend không chạy:
```
Application failed to start
```
→ Kiểm tra logs trong Render Dashboard → Logs
→ Đảm bảo `MONGO_URI` đúng

### Frontend không kết nối Backend:
```
Network Error
```
→ Kiểm tra `VITE_API_URL` trong Vercel Environment Variables
→ Redeploy frontend sau khi đổi env

### Email không gửi được:
```
Failed to send OTP
```
→ Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD`
→ Dùng Gmail App Password, không phải password thường

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Xem logs trong Render Dashboard → Logs
2. Xem build logs trong Vercel → Deployment → Logs
3. Check MongoDB Atlas → Collections có data chưa

---

## 🎉 HOÀN TẤT!

Website của bạn đã online trên internet, ai cũng có thể truy cập!
Chia sẻ URL Vercel cho bạn bè để test thử! 🚀
