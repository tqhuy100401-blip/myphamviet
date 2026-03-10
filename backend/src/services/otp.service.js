const crypto = require('crypto');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const emailService = require('./email.service');
const logger = require('../config/logger');

// Tạo mã OTP 6 số
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Gửi OTP qua email
exports.sendOTP = async (pendingUserId, email, name) => {
  try {
    // Tạo OTP
    const otp = generateOTP();
    
    // Lưu OTP vào PendingUser (hết hạn sau 10 phút)
    await PendingUser.findByIdAndUpdate(pendingUserId, {
      verificationCode: otp,
      verificationExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 phút
    });

    // Gửi email
    await emailService.sendOTPEmail({
      email,
      name,
      otp
    });

    logger.info(`OTP sent to ${email}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send OTP: ${error.message}`);
    throw error;
  }
};

// Xác thực OTP
exports.verifyOTP = async (pendingUserId, otp) => {
  try {
    // Tìm PendingUser
    const pendingUser = await PendingUser.findById(pendingUserId)
      .select('+verificationCode +verificationExpires');

    if (!pendingUser) {
      return { success: false, message: 'Thông tin đăng ký không tồn tại hoặc đã hết hạn' };
    }

    if (!pendingUser.verificationCode || !pendingUser.verificationExpires) {
      return { success: false, message: 'Không tìm thấy mã xác thực' };
    }

    // Kiểm tra hết hạn
    if (new Date() > pendingUser.verificationExpires) {
      return { success: false, message: 'Mã OTP đã hết hạn' };
    }

    // Kiểm tra mã OTP
    if (pendingUser.verificationCode !== otp) {
      return { success: false, message: 'Mã OTP không đúng' };
    }

    // Xác thực thành công - TẠO USER THẬT
    const newUser = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // đã hash rồi
      phone: pendingUser.phone,
      role: 'user',
      isVerified: true, // đã verify OTP rồi
      isActive: true
    });

    await newUser.save();

    // Xóa PendingUser sau khi tạo User thành công
    await PendingUser.findByIdAndDelete(pendingUserId);

    logger.info(`User ${newUser._id} created and verified successfully from pending user ${pendingUserId}`);
    return { success: true, message: 'Xác thực thành công! Tài khoản đã được tạo.', userId: newUser._id };
  } catch (error) {
    logger.error(`OTP verification failed: ${error.message}`);
    throw error;
  }
};

// Gửi lại OTP
exports.resendOTP = async (pendingUserId) => {
  try {
    const pendingUser = await PendingUser.findById(pendingUserId);
    
    if (!pendingUser) {
      return { success: false, message: 'Thông tin đăng ký không tồn tại hoặc đã hết hạn' };
    }

    await this.sendOTP(pendingUserId, pendingUser.email, pendingUser.name);
    return { success: true, message: 'Đã gửi lại mã OTP' };
  } catch (error) {
    logger.error(`Failed to resend OTP: ${error.message}`);
    throw error;
  }
};
