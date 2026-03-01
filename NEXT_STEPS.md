# 🚀 CÁC BƯỚC CÒN LẠI - BẠN CẦN LÀM

## ✅ ĐÃ HOÀN THÀNH TỰ ĐỘNG:
- ✅ Đã init Git repository
- ✅ Đã tạo .gitignore
- ✅ Đã commit tất cả code
- ✅ Đã đổi branch thành main
- ✅ Đã chuẩn bị file cấu hình deploy

---

## 📝 BẠN CẦN LÀM TIẾP (15-20 PHÚT):

### 1️⃣ PUSH CODE LÊN GITHUB (2 phút)

**Nếu chưa có repo GitHub:**
1. Mở https://github.com/new
2. Repository name: `myphamviet`
3. Để **Public** hoặc **Private** (tùy bạn)
4. **KHÔNG** chọn "Add README" hay "Add .gitignore"
5. Click **Create repository**
6. Copy URL repo (ví dụ: `https://github.com/username/myphamviet.git`)

**Chạy lệnh sau trong terminal:**
```powershell
cd d:\REACT+NODE\myphamViet
git remote add origin https://github.com/YOUR-USERNAME/myphamviet.git
git push -u origin main
```

---

### 2️⃣ MONGODB ATLAS (5 phút)

1. Đăng ký/đăng nhập: https://www.mongodb.com/cloud/atlas/register
2. Click **"Build a Database"**
3. Chọn **FREE** (M0 Sandbox)
4. Region: **Singapore** (gần VN nhất)
5. Cluster name: `myphamviet` → **Create**
6. Chờ 3-5 phút

**Network Access:**
1. Menu trái → **Network Access**
2. **Add IP Address** → **Allow from Anywhere** (0.0.0.0/0) → **Confirm**

**Database User:**
1. Menu trái → **Database Access**
2. **Add New Database User**
3. Username: `myphamviet_admin`
4. Password: (tự tạo mật khẩu mạnh, **LƯU LẠI!**)
5. Role: **Atlas admin** → **Add User**

**Lấy Connection String:**
1. Menu trái → **Database**
2. Click nút **Connect** của cluster
3. Chọn **"Drivers"**
4. Copy connection string:
```
mongodb+srv://myphamviet_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Thay `<password>` bằng password thật
6. Thêm `/myphamviet` sau `.net/`:
```
mongodb+srv://myphamviet_admin:PASSWORD@cluster0.xxxxx.mongodb.net/myphamviet?retryWrites=true&w=majority
```
✅ **LƯU LẠI STRING NÀY!**

---

### 3️⃣ TẠO JWT SECRET (30 giây)

Mở terminal chạy:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Hoặc dùng online: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on

✅ **LƯU LẠI CHUỖI NÀY!**

---

### 4️⃣ GMAIL APP PASSWORD (2 phút)

1. Mở https://myaccount.google.com/security
2. Bật **2-Step Verification** (nếu chưa bật)
3. Quay lại Security → **App passwords**
4. App: **Mail**, Device: **Windows Computer**
5. Click **Generate**
6. Copy 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)

✅ **LƯU LẠI APP PASSWORD NÀY!**

---

### 5️⃣ RENDER.COM - DEPLOY BACKEND (5 phút)

1. Đăng ký/đăng nhập: https://dashboard.render.com/register
2. Click **New +** → **Web Service**
3. Connect GitHub account
4. Chọn repo `myphamviet`
5. Điền thông tin:
```
Name: myphamviet-backend
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

6. Click **Advanced** → **Add Environment Variable**, thêm:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5002` |
| `MONGO_URI` | `<MongoDB connection string từ bước 2>` |
| `JWT_SECRET` | `<JWT secret từ bước 3>` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://temporary.com` (sẽ update sau) |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | `<App password từ bước 4>` |

7. Click **Create Web Service**
8. Đợi 5-10 phút
9. Khi thấy **Live** → Copy URL (ví dụ: `https://myphamviet-backend.onrender.com`)

**Test API:**
Mở: `https://your-backend.onrender.com/api/health`
Phải thấy: `{"status":"OK"}`

✅ **LƯU LẠI URL BACKEND NÀY!**

---

### 6️⃣ VERCEL - DEPLOY FRONTEND (3 phút)

1. Đăng nhập: https://vercel.com/login
2. Click **Add New...** → **Project**
3. Import repo `myphamviet`
4. Cấu hình:
```
Framework Preset: Vite (auto detect)
Root Directory: frontend
Build Command: npm run build (auto)
Output Directory: dist (auto)
```

5. **Environment Variables** → **Add**:
```
Key: VITE_API_URL
Value: https://myphamviet-backend.onrender.com/api
```
(Thay bằng URL backend thật từ bước 5)

6. Click **Deploy**
7. Đợi 2-3 phút
8. Khi thấy **Ready** → Click **Visit** → Copy URL

✅ **LƯU LẠI URL FRONTEND NÀY!**

---

### 7️⃣ CẬP NHẬT CORS (2 phút)

1. Quay lại Render Dashboard
2. Vào service `myphamviet-backend`
3. Menu trái → **Environment**
4. Tìm `FRONTEND_URL`
5. Click **Edit** → Thay bằng URL Vercel thật từ bước 6
6. Click **Save Changes**
7. Đợi 2-3 phút redeploy

---

### 8️⃣ TẠO TÀI KHOẢN ADMIN (2 phút)

**Cách 1: Seed script**
1. Render Dashboard → Service → Tab **Shell**
2. Chạy:
```bash
cd backend
node seedAdmin.js
```

**Cách 2: Trực tiếp trên MongoDB Atlas**
1. MongoDB Atlas → Collections
2. Database: `myphamviet` → Collection: `users`
3. **Insert Document** → Paste:
```json
{
  "name": "Admin",
  "email": "admin@myphamviet.com",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5zt0uBKoP5nO6",
  "role": "admin",
  "isVerified": true,
  "isActive": true,
  "createdAt": {"$date": "2026-03-01T00:00:00.000Z"}
}
```
Password là: `admin123`

---

## 🎉 HOÀN TẤT!

### Kiểm tra website:
1. Mở URL Vercel của bạn
2. Test đăng ký → Nhận OTP email
3. Verify OTP → Đăng nhập thành công
4. Test mua hàng
5. Đăng nhập admin: `admin@myphamviet.com` / `admin123`

---

## 🔗 LINKS NHANH

| Service | URL |
|---------|-----|
| GitHub | https://github.com/ |
| MongoDB Atlas | https://cloud.mongodb.com/ |
| Render | https://dashboard.render.com/ |
| Vercel | https://vercel.com/dashboard |
| Gmail App Passwords | https://myaccount.google.com/apppasswords |

---

## 📞 NẾU GẶP LỖI

Xem chi tiết: `DEPLOY_GUIDE.md` hoặc `DEPLOY_CHECKLIST.md`

Các lỗi thường gặp:
- CORS error → Chưa update `FRONTEND_URL`
- Backend không start → Sai `MONGO_URI`
- Email không gửi → Chưa dùng App Password
- Backend chậm 30s → Bình thường, free tier đang thức dậy

---

## 🎯 TỔNG QUAN

**Đã tự động:**
✅ Git init + commit
✅ Tạo file cấu hình
✅ Sẵn sàng push

**Bạn cần làm:**
1. Push GitHub (2 phút)
2. MongoDB Atlas (5 phút)
3. JWT Secret (30 giây)
4. Gmail App Password (2 phút)
5. Render Backend (5 phút)
6. Vercel Frontend (3 phút)
7. Update CORS (2 phút)
8. Tạo Admin (2 phút)

**Tổng thời gian: ~20 phút**

Chúc bạn deploy thành công! 🚀
