# Hướng dẫn cấu hình Cloudinary để upload ảnh

## 1. Tạo tài khoản Cloudinary miễn phí

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (10GB storage, 25 credits/tháng)
3. Xác nhận email

## 2. Lấy thông tin API

1. Đăng nhập vào Cloudinary Dashboard: https://cloudinary.com/console
2. Tại trang Dashboard, bạn sẽ thấy:
   - **Cloud Name**: tên cloud của bạn
   - **API Key**: key API
   - **API Secret**: secret key (nhấn "Show" để xem)

## 3. Cấu hình Backend

### Local Development:

Mở file `backend/.env` và điền thông tin:

```env
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban
```

### Production (Render):

1. Vào Render Dashboard → Service `myphamviet` (backend)
2. Vào tab **Environment**
3. Thêm 3 biến môi trường:
   - `CLOUDINARY_CLOUD_NAME` = [Cloud Name của bạn]
   - `CLOUDINARY_API_KEY` = [API Key của bạn]
   - `CLOUDINARY_API_SECRET` = [API Secret của bạn]
4. Nhấn **Save Changes**

## 4. Cách hoạt động

- **Có Cloudinary config**: Ảnh sẽ upload lên Cloudinary → Lưu URL vào database
- **Không có Cloudinary config**: Ảnh lưu local (chỉ dùng cho development)

## 5. Kiểm tra

Sau khi cấu hình xong, restart backend và thử upload ảnh:
- Upload sẽ lên Cloudinary
- Database lưu URL đầy đủ (https://res.cloudinary.com/...)
- Ảnh hiển thị bình thường trên frontend

## Lưu ý

- Cloudinary FREE: 25 credits/tháng, 10GB storage
- Ảnh tự động resize về 800x800px để tiết kiệm dung lượng
- URL ảnh có dạng: `https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/myphamviet/[filename]`
