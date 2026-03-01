# ⚡ DEPLOY NHANH - CHECKLIST

## ✅ TRƯỚC KHI DEPLOY

- [ ] Push code lên GitHub
- [ ] Có tài khoản MongoDB Atlas, Render, Vercel
- [ ] Có Gmail với App Password sẵn sàng

---

## 📝 THÔNG TIN CẦN LƯU

### MongoDB Atlas:
```
Connection String: mongodb+srv://user:pass@cluster.mongodb.net/myphamviet
```

### Render Backend:
```
URL: https://myphamviet-backend.onrender.com
Health Check: /api/health
```

### Vercel Frontend:
```
URL: https://myphamviet-xxx.vercel.app
```

### JWT Secret (tạo ngẫu nhiên):
```
JWT_SECRET: [tạo chuỗi random 32+ ký tự]
```

### Gmail:
```
EMAIL_USER: your-email@gmail.com
EMAIL_PASSWORD: [App Password 16 ký tự]
```

---

## 🚀 THỨ TỰ DEPLOY

### 1️⃣ MongoDB Atlas (5 phút)
1. Tạo Free cluster
2. Allow IP 0.0.0.0/0
3. Tạo user + password
4. Copy connection string
5. Thêm tên database: `/myphamviet`

### 2️⃣ Render Backend (10 phút)
1. New Web Service → Connect GitHub
2. Root: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Add Environment Variables (8 biến)
6. Deploy → Đợi Live
7. Test: `https://xxx.onrender.com/api/health`

**Environment Variables Backend:**
```env
NODE_ENV=production
PORT=5002
MONGO_URI=<từ MongoDB Atlas>
JWT_SECRET=<chuỗi random>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<sẽ update sau>
EMAIL_USER=<gmail>
EMAIL_PASSWORD=<app password>
```

### 3️⃣ Vercel Frontend (5 phút)
1. Import GitHub project
2. Root: `frontend`
3. Framework: Vite (auto detect)
4. Add Environment Variable: `VITE_API_URL`
5. Deploy → Đợi Ready
6. Copy URL Vercel

**Environment Variable Frontend:**
```env
VITE_API_URL=https://myphamviet-backend.onrender.com/api
```

### 4️⃣ Update CORS (3 phút)
1. Quay lại Render Backend
2. Environment → Sửa `FRONTEND_URL`
3. Paste URL Vercel thật
4. Save → Đợi redeploy

---

## 🧪 KIỂM TRA

- [ ] Backend health check trả về OK
- [ ] Frontend mở được trang chủ
- [ ] Đăng ký → Nhận email OTP
- [ ] Verify OTP → Tạo tài khoản thành công
- [ ] Đăng nhập được
- [ ] Xem sản phẩm
- [ ] Thêm giỏ hàng
- [ ] Đặt hàng

---

## 🔑 TẠO ADMIN

### Cách 1: Seed script (nếu có)
```bash
# Trong Render Shell
cd backend
node seedAdmin.js
```

### Cách 2: MongoDB Atlas UI
1. Vào Collections
2. Database: myphamviet
3. Collection: users
4. Insert Document:
```json
{
  "name": "Admin",
  "email": "admin@myphamviet.com",
  "password": "$2b$12$...", // hash của password
  "role": "admin",
  "isVerified": true,
  "isActive": true
}
```

---

## ⚡ QUICK LINKS

| Service | Dashboard |
|---------|-----------|
| MongoDB Atlas | https://cloud.mongodb.com/ |
| Render | https://dashboard.render.com/ |
| Vercel | https://vercel.com/dashboard |
| Gmail App Password | https://myaccount.google.com/apppasswords |
| Cron Job (keep alive) | https://cron-job.org/ |

---

## 🆘 LỖI THƯỜNG GẶP

### "Application failed to start"
→ Sai `MONGO_URI` hoặc chưa allow IP

### "CORS policy blocked"
→ `FRONTEND_URL` chưa đúng hoặc chưa save

### "Network Error" trên frontend
→ `VITE_API_URL` sai hoặc backend chưa chạy

### "Failed to send email"
→ Chưa dùng Gmail App Password

### Backend chậm 30s lần đầu
→ Render free tier "ngủ", bình thường!

---

## 📌 GHI NHỚ

- Free tier Render ngủ sau 15 phút
- File upload mất khi redeploy Render
- MongoDB free giới hạn 512MB
- Vercel unlimited bandwidth
- Redeploy tự động khi push GitHub

Xem chi tiết: `DEPLOY_GUIDE.md`
