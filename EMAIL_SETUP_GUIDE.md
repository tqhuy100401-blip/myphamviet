# 📧 Hướng dẫn cấu hình Email Service

## 1. Cài đặt nodemailer

```bash
cd backend
npm install nodemailer
```

## 2. Cấu hình Gmail App Password

### Bước 1: Bật xác thực 2 bước
1. Truy cập: https://myaccount.google.com/security
2. Chọn "2-Step Verification" (Xác minh 2 bước)
3. Làm theo hướng dẫn để bật

### Bước 2: Tạo App Password
1. Truy cập: https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Other (Custom name)"
3. Nhập tên: "My Pham Viet"
4. Click "Generate"
5. **Lưu lại mật khẩu 16 ký tự** (chỉ hiển thị 1 lần)

## 3. Cập nhật file .env

Thêm vào file `backend/.env`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Ví dụ:**
```env
EMAIL_USER=myphamviet2026@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## 4. Email templates có sẵn

### ✅ Order Confirmation Email
- Gửi tự động khi khách hàng đặt hàng
- Bao gồm: thông tin đơn hàng, sản phẩm, tổng tiền, địa chỉ giao hàng

### 📦 Order Status Update Email
- Gửi khi admin cập nhật trạng thái đơn hàng
- Các trạng thái: pending, processing, shipped, delivered, cancelled

### 🎉 Welcome Email
- Gửi tự động khi user đăng ký tài khoản mới
- Chào mừng + giới thiệu ưu đãi

## 5. Test gửi email

### Test trong Postman:

**Đăng ký user mới:**
```
POST http://localhost:5002/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

**Đặt hàng:**
```
POST http://localhost:5002/api/orders/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customerName": "Nguyen Van A",
  "phone": "0912345678",
  "shippingAddress": "123 ABC Street, HCM",
  "note": "Giao giờ hành chính"
}
```

## 6. Troubleshooting

### Lỗi: "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Nguyên nhân**: Chưa bật 2-Step Verification hoặc dùng password thường
- **Giải pháp**: Phải dùng App Password, không dùng password Gmail thường

### Lỗi: "Error: Missing credentials for 'PLAIN'"
- **Nguyên nhân**: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASSWORD trong .env
- **Giải pháp**: Kiểm tra lại file .env

### Email không gửi được
- Kiểm tra internet connection
- Kiểm tra Gmail có bị giới hạn gửi (limit 500 emails/day cho free account)
- Thử tạo lại App Password

## 7. Sử dụng dịch vụ email khác

### Outlook/Hotmail:
```javascript
service: 'hotmail'
auth: {
  user: 'your-email@outlook.com',
  pass: 'your-password'
}
```

### Custom SMTP:
```javascript
host: 'smtp.example.com',
port: 587,
secure: false,
auth: {
  user: 'your-email@example.com',
  pass: 'your-password'
}
```

## 8. Production Best Practices

### Sử dụng SendGrid hoặc AWS SES
- **SendGrid**: Free 100 emails/day, reliable
- **AWS SES**: $0.10 per 1,000 emails
- **Mailgun**: 5,000 free emails/month

### Rate Limiting
- Thêm queue system (Bull, BullMQ) để tránh spam
- Implement retry mechanism cho failed emails

### Email Templates
- Sử dụng template engine (Handlebars, EJS) cho dynamic content
- Store templates trong database cho dễ quản lý

## 9. Tính năng mở rộng

Có thể thêm sau:
- [ ] Email xác thực tài khoản (verification)
- [ ] Email reset password
- [ ] Email thông báo khuyến mãi
- [ ] Email reminder (abandoned cart)
- [ ] Email feedback sau khi nhận hàng
- [ ] Newsletter subscription

## 10. Kiểm tra email đã gửi

Xem log trong terminal hoặc check file `backend/logs/combined.log`:
```
Email sent successfully to user@example.com: <message-id>
```
