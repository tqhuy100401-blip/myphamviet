# ✅ CHECKLIST KIỂM TRA CHỨC NĂNG MYPHAMVIET

## 📋 TRƯỚC KHI BẮT ĐẦU

- [ ] MongoDB đang chạy
- [ ] Đã cài đặt dependencies (npm install trong cả backend và frontend)
- [ ] Đã tạo file .env trong backend
- [ ] Đã seed admin: `node backend/seedAdmin.js`
- [ ] Đã seed categories: `node backend/seedCategories.js`

---

## 🚀 KHỞI ĐỘNG

- [ ] Backend đang chạy tại http://localhost:5002
- [ ] Frontend đang chạy tại http://localhost:5173
- [ ] Không có lỗi trong terminal

---

## 1️⃣ TRANG CHỦ (/)

- [ ] Trang chủ hiển thị đúng
- [ ] Header hiển thị
- [ ] MegaMenu hiển thị
- [ ] Footer hiển thị
- [ ] Banner/Slider hoạt động (nếu có)

---

## 2️⃣ SẢN PHẨM

### Danh sách sản phẩm (/products)
- [ ] Hiển thị danh sách sản phẩm
- [ ] Phân trang hoạt động
- [ ] Tìm kiếm sản phẩm hoạt động
- [ ] Lọc theo danh mục hoạt động
- [ ] Lọc theo giá hoạt động
- [ ] Sắp xếp hoạt động (giá, tên, mới nhất)
- [ ] Hiển thị "Chỉ còn hàng" hoạt động

### Chi tiết sản phẩm (/products/:id)
- [ ] Hiển thị thông tin sản phẩm đầy đủ
- [ ] Hiển thị giá, tồn kho
- [ ] Nút "Thêm vào giỏ hàng" hoạt động
- [ ] Hiển thị đánh giá (nếu có)
- [ ] Hiển thị sản phẩm liên quan (nếu có)

### Sản phẩm theo danh mục (/category/:slug)
- [ ] Hiển thị sản phẩm đúng danh mục
- [ ] Breadcrumb hiển thị đúng
- [ ] Số lượng sản phẩm đúng

---

## 3️⃣ DANH MỤC

### Hiển thị danh mục
- [ ] MegaMenu hiển thị các danh mục
- [ ] Click vào danh mục chuyển đến trang đúng
- [ ] Icon danh mục hiển thị

---

## 4️⃣ GIỎ HÀNG (/cart)

- [ ] Hiển thị sản phẩm trong giỏ hàng
- [ ] Tăng/giảm số lượng hoạt động
- [ ] Xóa sản phẩm khỏi giỏ hàng hoạt động
- [ ] Tính tổng tiền đúng
- [ ] Nút "Đặt hàng" hoạt động

---

## 5️⃣ LIÊN HỆ (/contact)

- [ ] Hiển thị địa chỉ cửa hàng
- [ ] Hiển thị hotline
- [ ] Hiển thị email
- [ ] Hiển thị bản đồ Google Maps
- [ ] Bản đồ hoạt động (zoom, drag)

---

## 6️⃣ XÁC THỰC

### Đăng ký (/register)
- [ ] Form đăng ký hiển thị
- [ ] Validation hoạt động
- [ ] Đăng ký thành công
- [ ] Chuyển hướng sau khi đăng ký

### Đăng nhập (/login)
- [ ] Form đăng nhập hiển thị
- [ ] Validation hoạt động
- [ ] Đăng nhập thành công với user thường
- [ ] Đăng nhập thành công với admin
- [ ] Lưu token vào localStorage
- [ ] Hiển thị tên user sau khi đăng nhập
- [ ] Nút "Đăng xuất" hoạt động

---

## 7️⃣ DASHBOARD ADMIN (/admin)

### Kiểm tra truy cập
- [ ] Không đăng nhập → chuyển đến /login
- [ ] Đăng nhập user thường → hiển thị "Truy cập bị từ chối"
- [ ] Đăng nhập admin → hiển thị dashboard

### Dashboard
- [ ] Hiển thị tổng số người dùng
- [ ] Hiển thị tổng số sản phẩm
- [ ] Hiển thị tổng số đơn hàng
- [ ] Hiển thị tổng doanh thu
- [ ] Biểu đồ doanh thu 7 ngày hiển thị
- [ ] Biểu đồ đơn hàng theo trạng thái hiển thị
- [ ] Top 5 sản phẩm bán chạy hiển thị

---

## 8️⃣ QUẢN LÝ SẢN PHẨM (/admin/products)

- [ ] Hiển thị danh sách sản phẩm
- [ ] Tìm kiếm sản phẩm hoạt động
- [ ] Nút "Thêm sản phẩm" hoạt động
- [ ] Modal thêm sản phẩm hiển thị
- [ ] Thêm sản phẩm thành công
- [ ] Upload ảnh sản phẩm hoạt động
- [ ] Nút "Sửa" sản phẩm hoạt động
- [ ] Modal sửa sản phẩm hiển thị đúng dữ liệu
- [ ] Cập nhật sản phẩm thành công
- [ ] Nút "Xóa" sản phẩm hoạt động
- [ ] Xác nhận xóa hiển thị
- [ ] Xóa sản phẩm thành công

---

## 9️⃣ QUẢN LÝ DANH MỤC (/admin/categories)

- [ ] Hiển thị danh sách danh mục
- [ ] Hiển thị số lượng sản phẩm trong danh mục
- [ ] Nút "Thêm danh mục" hoạt động
- [ ] Modal thêm danh mục hiển thị
- [ ] Chọn icon cho danh mục
- [ ] Thêm danh mục thành công
- [ ] Nút "Sửa" danh mục hoạt động
- [ ] Modal sửa danh mục hiển thị đúng dữ liệu
- [ ] Cập nhật danh mục thành công
- [ ] Nút "Xóa" danh mục hoạt động
- [ ] Xác nhận xóa hiển thị
- [ ] Xóa danh mục thành công

---

## 🔟 QUẢN LÝ ĐỚN HÀNG (/admin/orders)

- [ ] Hiển thị danh sách đơn hàng
- [ ] Hiển thị trạng thái đơn hàng
- [ ] Lọc theo trạng thái hoạt động
- [ ] Tìm kiếm đơn hàng hoạt động
- [ ] Xem chi tiết đơn hàng
- [ ] Cập nhật trạng thái đơn hàng
- [ ] Xác nhận đơn hàng
- [ ] Hủy đơn hàng

---

## 1️⃣1️⃣ QUẢN LÝ NGƯỜI DÙNG (/admin/users)

- [ ] Hiển thị danh sách người dùng
- [ ] Hiển thị role (admin/user)
- [ ] Tìm kiếm người dùng hoạt động
- [ ] Thay đổi role người dùng
- [ ] Xóa người dùng (nếu có)

---

## 1️⃣2️⃣ ĐẶT HÀNG

### Đặt hàng (/order)
- [ ] Chỉ truy cập được khi đã đăng nhập
- [ ] Hiển thị form địa chỉ giao hàng
- [ ] Validation form hoạt động
- [ ] Hiển thị sản phẩm trong giỏ hàng
- [ ] Hiển thị tổng tiền
- [ ] Nút "Đặt hàng" hoạt động
- [ ] Đặt hàng thành công
- [ ] Xóa giỏ hàng sau khi đặt hàng

### Đơn hàng của tôi (/my-orders)
- [ ] Hiển thị danh sách đơn hàng của user
- [ ] Hiển thị trạng thái đơn hàng
- [ ] Xem chi tiết đơn hàng
- [ ] Hủy đơn hàng (nếu cho phép)

---

## 📱 RESPONSIVE

- [ ] Desktop (1920px) hiển thị đẹp
- [ ] Laptop (1366px) hiển thị đẹp
- [ ] Tablet (768px) hiển thị đẹp
- [ ] Mobile (375px) hiển thị đẹp

---

## 🔐 BẢO MẬT

- [ ] Không truy cập được admin khi chưa đăng nhập
- [ ] Không truy cập được admin với user thường
- [ ] Token được lưu an toàn
- [ ] Logout xóa token

---

## 🚀 HIỆU SUẤT

- [ ] Trang tải nhanh (<3s)
- [ ] Không có lỗi console
- [ ] Không có warning quan trọng
- [ ] React Query caching hoạt động
- [ ] API không gọi lại không cần thiết

---

## ✅ KẾT QUẢ

**Tổng số chức năng kiểm tra:** _____ / _____

**Ghi chú vấn đề:**
_______________________________________
_______________________________________
_______________________________________

---

## 🎉 HOÀN THÀNH!

Nếu tất cả đều ✅, dự án của bạn đã sẵn sàng! 🚀💄✨
