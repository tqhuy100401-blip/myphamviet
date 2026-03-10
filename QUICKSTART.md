# ⚡ KHỞI ĐỘNG NHANH MYPHAMVIET

## Bước 1: Chạy lệnh cài đặt (chỉ lần đầu)

```powershell
# Cài đặt Backend
cd backend
npm install

# Cài đặt Frontend  
cd ../frontend
npm install

# Seed dữ liệu
cd ../backend
node seedAdmin.js
node seedCategories.js
```

## Bước 2: Chạy dự án

### Cách nhanh nhất (Windows):
```powershell
# Chạy từ thư mục gốc myphamViet
.\start.ps1
```

### Hoặc chạy thủ công:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## Bước 3: Mở trình duyệt

- Frontend: http://localhost:5173
- Backend: http://localhost:5002

## Bước 4: Đăng nhập Admin

- Email: `admin@myphamviet.com`
- Password: `admin123`

---

## ✅ CHECKLIST CÁC TÍNH NĂNG

- ✅ **Sản phẩm**: `/products` - Xem, tìm kiếm, lọc sản phẩm
- ✅ **Danh mục**: `/category/:slug` - Lọc theo danh mục
- ✅ **Liên hệ**: `/contact` - Thông tin liên hệ & bản đồ
- ✅ **Dashboard Admin**: `/admin` - Thống kê, biểu đồ
- ✅ **Quản lý Sản phẩm**: `/admin/products` - CRUD sản phẩm
- ✅ **Quản lý Danh mục**: `/admin/categories` - CRUD danh mục
- ✅ **Quản lý Đơn hàng**: `/admin/orders` - Xem, cập nhật đơn hàng
- ✅ **Quản lý User**: `/admin/users` - Xem, phân quyền user

---

## 🔥 LƯU Ý

1. **MongoDB phải đang chạy** (MongoDB Compass hoặc mongod)
2. **Port 5002 & 5173 không bị chiếm** 
3. **Đã seed admin** (nếu chưa: `node backend/seedAdmin.js`)
4. **Đã tạo file .env** trong backend với MONGO_URI & JWT_SECRET

---

## 🆘 SỬA LỖI NHANH

```powershell
# Port 5002 bị chiếm
cd backend
npm run kill-port

# MongoDB không kết nối được
# → Kiểm tra MongoDB đang chạy
# → Kiểm tra MONGO_URI trong backend/.env

# Không gọi được API
# → Kiểm tra backend đang chạy (port 5002)
# → Kiểm tra frontend/src/api/axiosClient.js baseURL
```

---

**🎉 Xong! Bây giờ tất cả tính năng đã sẵn sàng!**
