# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN MYPHAMVIET

## ✅ Các chức năng đã có:

### 1. **Sản phẩm (Products)** ✅
   - Xem danh sách sản phẩm: `/products`
   - Xem chi tiết sản phẩm: `/products/:id`
   - Lọc theo danh mục, giá, tìm kiếm
   - Sắp xếp theo giá, tên, ngày tạo
   - Phân trang

### 2. **Danh mục (Categories)** ✅
   - Xem danh sách danh mục
   - Lọc sản phẩm theo danh mục: `/category/:slug`
   - Admin quản lý danh mục: `/admin/categories`
   - Thêm, sửa, xóa danh mục

### 3. **Liên hệ (Contact)** ✅
   - Trang liên hệ: `/contact`
   - Hiển thị địa chỉ, hotline, email
   - Bản đồ Google Maps

### 4. **Dashboard Admin** ✅
   - Trang tổng quan: `/admin`
   - Thống kê doanh thu, đơn hàng
   - Biểu đồ phân tích
   - Quản lý sản phẩm: `/admin/products`
   - Quản lý danh mục: `/admin/categories`
   - Quản lý đơn hàng: `/admin/orders`
   - Quản lý người dùng: `/admin/users`
   - Quản lý đổi trả: `/admin/returns`

### 5. **Các chức năng khác** ✅
   - Giỏ hàng: `/cart`
   - Đặt hàng: `/order`
   - Xem đơn hàng của tôi: `/my-orders`
   - Đăng nhập: `/login`
   - Đăng ký: `/register`
   - Chat real-time với admin

---

## 📦 BƯỚC 1: CÀI ĐẶT

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

---

## 🗄️ BƯỚC 2: THIẾT LẬP DATABASE

### 1. Tạo file `.env` trong thư mục `backend`:
```env
MONGO_URI=mongodb://localhost:27017/myphamviet
JWT_SECRET=your-secret-key-here-make-it-strong
PORT=5002
```

### 2. Chạy MongoDB (nếu dùng local):
```powershell
# Mở MongoDB Compass hoặc chạy mongod
mongod
```

### 3. Seed dữ liệu mẫu:
```powershell
cd backend
node seedAdmin.js
node seedCategories.js
```

**Tài khoản Admin mặc định:**
- Email: `admin@myphamviet.com`
- Password: `admin123`

---

## 🚀 BƯỚC 3: CHẠY DỰ ÁN

### Terminal 1 - Chạy Backend:
```powershell
cd backend
npm run dev
```
Server sẽ chạy tại: `http://localhost:5002`

### Terminal 2 - Chạy Frontend:
```powershell
cd frontend
npm run dev
```
Web sẽ chạy tại: `http://localhost:5173`

---

## 🧪 BƯỚC 4: KIỂM TRA CHỨC NĂNG

### 1. Trang chủ
- Mở: `http://localhost:5173`
- Xem các sản phẩm nổi bật, banner, slider

### 2. Danh sách sản phẩm
- Mở: `http://localhost:5173/products`
- Thử tìm kiếm, lọc theo danh mục, sắp xếp

### 3. Chi tiết sản phẩm
- Click vào 1 sản phẩm
- Xem thông tin, thêm vào giỏ hàng

### 4. Giỏ hàng
- Mở: `http://localhost:5173/cart`
- Thử thêm/xóa sản phẩm

### 5. Liên hệ
- Mở: `http://localhost:5173/contact`
- Xem thông tin liên hệ và bản đồ

### 6. Đăng nhập Admin
- Mở: `http://localhost:5173/login`
- Đăng nhập với tài khoản admin
- Email: `admin@myphamviet.com`
- Password: `admin123`

### 7. Dashboard Admin
- Sau khi đăng nhập: `http://localhost:5173/admin`
- Xem thống kê, biểu đồ

### 8. Quản lý Danh mục
- Mở: `http://localhost:5173/admin/categories`
- Thử thêm, sửa, xóa danh mục

### 9. Quản lý Sản phẩm
- Mở: `http://localhost:5173/admin/products`
- Thử thêm, sửa, xóa sản phẩm

---

## 🔥 CÁC TÍNH NĂNG CHÍNH

### ✅ FRONTEND
- ✅ Responsive design (Bootstrap 5)
- ✅ React Router v7 (multi-page)
- ✅ React Query (caching, refetch)
- ✅ React Hook Form + Yup (validation)
- ✅ React Toastify (notifications)
- ✅ React Icons
- ✅ Recharts (biểu đồ admin)
- ✅ Socket.io Client (chat real-time)
- ✅ Swiper (slider)
- ✅ Protected Routes (authentication)
- ✅ Admin Routes (authorization)

### ✅ BACKEND
- ✅ Express.js
- ✅ MongoDB + Mongoose
- ✅ JWT Authentication
- ✅ Bcrypt (hash password)
- ✅ Multer (upload ảnh)
- ✅ Socket.io (chat real-time)
- ✅ CORS
- ✅ RESTful API
- ✅ Role-based Access Control (Admin/User)

---

## 📁 CẤU TRÚC DỰ ÁN

```
myphamViet/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Logic xử lý
│   │   ├── models/           # Schema MongoDB
│   │   ├── routes/           # API endpoints
│   │   ├── middlewares/      # Auth, upload, etc.
│   │   ├── config/           # Database config
│   │   └── app.js            # Main server
│   ├── uploads/              # Ảnh sản phẩm
│   ├── seedAdmin.js          # Tạo admin
│   └── seedCategories.js     # Tạo danh mục
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Footer, etc.
│   │   ├── pages/            # Các trang
│   │   ├── api/              # Axios client
│   │   ├── context/          # Socket context
│   │   └── utils/            # Helper functions
│   └── public/               # Static files
│
└── HUONG_DAN_CHAY.md         # File này
```

---

## 🛠️ SỬA LỖI THƯỜNG GẶP

### Lỗi: "Port 5002 already in use"
```powershell
cd backend
npm run kill-port
npm run dev
```

### Lỗi: "Cannot connect to MongoDB"
- Kiểm tra MongoDB đang chạy
- Kiểm tra MONGO_URI trong `.env`
- Thử: `mongodb://localhost:27017/myphamviet`

### Lỗi: "404 Not Found" khi gọi API
- Kiểm tra backend đang chạy
- Kiểm tra URL trong `frontend/src/api/axiosClient.js`
- Default: `http://localhost:5002/api`

### Lỗi: "Unauthorized" khi vào Admin
- Đăng nhập với tài khoản admin
- Kiểm tra role trong localStorage

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. ✅ MongoDB đang chạy
2. ✅ Backend đang chạy (port 5002)
3. ✅ Frontend đang chạy (port 5173)
4. ✅ Đã seed admin và categories
5. ✅ Đã cài đặt tất cả dependencies

---

## 🎉 HOÀN THÀNH!

Dự án myphamViet đã có đầy đủ:
- ✅ Sản phẩm
- ✅ Danh mục
- ✅ Liên hệ
- ✅ Dashboard Admin

**Chúc bạn thành công!** 🚀💄✨
