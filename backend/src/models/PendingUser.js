const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    minlength: [2, 'Họ tên tối thiểu 2 ký tự'],
    maxlength: [50, 'Họ tên tối đa 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu tối thiểu 6 ký tự']
  },
  phone: {
    type: String,
    trim: true
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Tự động xóa sau 24 giờ nếu không verify
  }
}, {
  timestamps: true
});

// Index để tự động xóa sau 24h
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
