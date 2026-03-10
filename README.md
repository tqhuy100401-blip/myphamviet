# 💄 MYPHAMVIET - Website Bán Mỹ Phẩm Online

> Hệ thống quản lý và bán hàng mỹ phẩm trực tuyến với đầy đủ tính năng hiện đại

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)

---

## 🌟 Tính Năng Chính

### 👥 Dành cho Khách Hàng
- ✅ **Xem sản phẩm**: Danh sách, chi tiết, tìm kiếm, lọc, sắp xếp
- ✅ **Danh mục sản phẩm**: Lọc theo danh mục, xem sản phẩm theo danh mục
- ✅ **Giỏ hàng**: Thêm, xóa, cập nhật số lượng
- ✅ **Đặt hàng**: Điền thông tin giao hàng, thanh toán
- ✅ **Quản lý đơn hàng**: Xem lịch sử đơn hàng, trạng thái
- ✅ **Liên hệ**: Thông tin cửa hàng, hotline, bản đồ
- ✅ **Chat real-time**: Tư vấn trực tiếp với admin
- ✅ **Đánh giá sản phẩm**: Xem và viết đánh giá

### 👨‍💼 Dành cho Admin
- ✅ **Dashboard**: Thống kê tổng quan, biểu đồ doanh thu
- ✅ **Quản lý sản phẩm**: CRUD sản phẩm, upload ảnh
- ✅ **Quản lý danh mục**: CRUD danh mục, icon tùy chỉnh
- ✅ **Quản lý đơn hàng**: Xem, cập nhật trạng thái đơn hàng
- ✅ **Quản lý người dùng**: Xem, phân quyền user/admin
- ✅ **Quản lý đổi trả**: Xử lý yêu cầu đổi trả hàng
- ✅ **Chat với khách**: Trả lời tin nhắn real-time

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 19.2** - UI Library
- **React Router v7** - Routing
- **React Query** - Data fetching & caching
- **React Hook Form + Yup** - Form validation
- **Bootstrap 5** - CSS Framework
- **React Toastify** - Notifications
- **Recharts** - Biểu đồ thống kê
- **Socket.io Client** - Real-time chat
- **Swiper** - Image slider
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

---

## 📂 Cấu Trúc Dự Án

```
myphamViet/
├── 📁 backend/                 # Server Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Logic xử lý
│   │   ├── 📁 models/          # Mongoose schemas
│   │   ├── 📁 routes/          # API endpoints
│   │   ├── 📁 middlewares/     # Auth, upload, etc.
│   │   ├── 📁 config/          # Database config
│   │   └── 📄 app.js           # Main server
│   ├── 📁 uploads/             # Uploaded images
│   ├── 📄 seedAdmin.js         # Seed admin user
│   ├── 📄 seedCategories.js    # Seed categories
│   └── 📄 package.json
│
├── 📁 frontend/                # React app
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 api/             # API client
│   │   ├── 📁 context/         # React context
│   │   ├── 📁 utils/           # Helper functions
│   │   ├── 📄 App.jsx          # Main app
│   │   └── 📄 main.jsx         # Entry point
│   ├── 📁 public/              # Static assets
│   └── 📄 package.json
│
├── 📄 start.bat                # Windows start script
├── 📄 start.ps1                # PowerShell start script
├── 📄 HUONG_DAN_CHAY.md        # Hướng dẫn chi tiết
├── 📄 CHECKLIST.md             # Checklist kiểm tra
└── 📄 README.md                # File này
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 18+ 
- MongoDB 6+
- npm hoặc yarn

### Bước 1: Clone Project
```bash
git clone <repository-url>
cd myphamViet
```

### Bước 2: Cài Đặt Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Bước 3: Cấu Hình Environment

Tạo file `.env` trong thư mục `backend`:
```env
MONGO_URI=mongodb://localhost:27017/myphamviet
JWT_SECRET=your-super-secret-key-here-change-in-production
PORT=5002
```

### Bước 4: Seed Dữ Liệu

```bash
cd backend
node seedAdmin.js
node seedCategories.js
```

**Tài khoản Admin mặc định:**
- Email: `admin@myphamviet.com`
- Password: `admin123`

### Bước 5: Khởi Động Server

#### Cách 1: Sử dụng script tự động (Windows)
```bash
# Chạy file start.bat hoặc start.ps1
.\start.ps1
```

#### Cách 2: Chạy thủ công

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Bước 6: Truy Cập Ứng Dụng

- 🌐 **Frontend**: http://localhost:5173
- 🌐 **Backend API**: http://localhost:5002

---

## 📖 Tài Liệu Chi Tiết

- 📘 [Hướng dẫn chạy chi tiết](./HUONG_DAN_CHAY.md)
- ✅ [Checklist kiểm tra chức năng](./CHECKLIST.md)

---

## 🎯 Các Trang Chính

### Khách Hàng
| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products/:id` | Chi tiết sản phẩm |
| `/category/:slug` | Sản phẩm theo danh mục |
| `/cart` | Giỏ hàng |
| `/order` | Đặt hàng |
| `/my-orders` | Đơn hàng của tôi |
| `/contact` | Liên hệ |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |

### Admin
| Đường dẫn | Mô tả |
|-----------|-------|
| `/admin` | Dashboard tổng quan |
| `/admin/products` | Quản lý sản phẩm |
| `/admin/categories` | Quản lý danh mục |
| `/admin/orders` | Quản lý đơn hàng |
| `/admin/users` | Quản lý người dùng |
| `/admin/returns` | Quản lý đổi trả |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # Đăng ký
POST   /api/auth/login        # Đăng nhập
GET    /api/auth/profile      # Lấy thông tin user
```

### Products
```
GET    /api/products          # Lấy danh sách sản phẩm
GET    /api/products/:id      # Lấy chi tiết sản phẩm
POST   /api/products          # Tạo sản phẩm (Admin)
PUT    /api/products/:id      # Cập nhật sản phẩm (Admin)
DELETE /api/products/:id      # Xóa sản phẩm (Admin)
```

### Categories
```
GET    /api/categories        # Lấy danh sách danh mục
POST   /api/categories        # Tạo danh mục (Admin)
PUT    /api/categories/:id    # Cập nhật danh mục (Admin)
DELETE /api/categories/:id    # Xóa danh mục (Admin)
```

### Cart
```
GET    /api/cart              # Lấy giỏ hàng
POST   /api/cart/add          # Thêm vào giỏ hàng
PUT    /api/cart/:id          # Cập nhật số lượng
DELETE /api/cart/:id          # Xóa khỏi giỏ hàng
```

### Orders
```
GET    /api/orders            # Lấy đơn hàng của user
POST   /api/orders            # Tạo đơn hàng
GET    /api/orders/:id        # Chi tiết đơn hàng
PUT    /api/orders/:id/status # Cập nhật trạng thái (Admin)
```

### Admin
```
GET    /api/admin/stats       # Thống kê dashboard
GET    /api/admin/users       # Danh sách users
PUT    /api/admin/users/:id   # Cập nhật role user
```

---

## 🔐 Xác Thực & Phân Quyền

### Luồng Authentication
1. User đăng ký/đăng nhập
2. Server trả về JWT token
3. Frontend lưu token vào localStorage
4. Mọi request sau đó gửi kèm token trong header

### Phân Quyền
- **Public**: Xem sản phẩm, danh mục, liên hệ
- **User**: Giỏ hàng, đặt hàng, xem đơn hàng
- **Admin**: Tất cả tính năng quản lý

---

## 🎨 Screenshots

### Trang chủ
![Home Page](./screenshots/home.png)

### Danh sách sản phẩm
![Products](./screenshots/products.png)

### Dashboard Admin
![Admin Dashboard](./screenshots/admin-dashboard.png)

---

## 🐛 Xử Lý Lỗi

### Port đang được sử dụng
```bash
cd backend
npm run kill-port
```

### Không kết nối được MongoDB
- Kiểm tra MongoDB đang chạy
- Kiểm tra `MONGO_URI` trong `.env`

### Lỗi CORS
- Kiểm tra `baseURL` trong `frontend/src/api/axiosClient.js`
- Đảm bảo backend CORS config đúng

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📦 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload folder dist/
```

### Backend (Railway/Render)
```bash
cd backend
# Set environment variables
# Deploy to platform
```

---

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork project
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Liên Hệ

- 📧 Email: support@myphamviet.com
- 📱 Hotline: 0123 456 789
- 🌐 Website: https://myphamviet.com

---

## 🙏 Credits

- Design inspiration: Hasaki.vn
- Icons: React Icons
- Charts: Recharts
- UI Framework: Bootstrap 5

---

## 📈 Roadmap

- [ ] Tích hợp thanh toán online (VNPay, MoMo)
- [ ] Tích hợp giao hàng (GHN, GHTK)
- [ ] Email notifications
- [ ] SMS OTP verification
- [ ] Wishlist (Danh sách yêu thích)
- [ ] So sánh sản phẩm
- [ ] Khuyến mãi & Voucher
- [ ] Đánh giá có hình ảnh
- [ ] Tích điểm thành viên
- [ ] Mobile app (React Native)

---

<div align="center">
  <p>Made with ❤️ by MyphamViet Team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
