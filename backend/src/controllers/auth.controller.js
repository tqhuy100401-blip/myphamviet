const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const emailService = require("../services/email.service");
const otpService = require("../services/otp.service");

// ================== REGISTER ==================
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Kiểm tra email đã tồn tại trong User thật
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email đã tồn tại", 400));
  }

  // Kiểm tra email đang chờ xác thực
  const existingPending = await PendingUser.findOne({ email });
  if (existingPending) {
    // Xóa pending user cũ và tạo mới
    await PendingUser.deleteOne({ email });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Lưu vào PendingUser (chưa tạo User thật)
  const pendingUser = new PendingUser({
    name,
    email,
    password: hashedPassword,
    phone
  });

  await pendingUser.save();

  // Gửi OTP qua email
  otpService.sendOTP(pendingUser._id, pendingUser.email, pendingUser.name).catch(err => {
    console.error('Failed to send OTP:', err.message);
  });

  res.status(201).json({
    message: "Tài khoản đã được tạo! Vui lòng nhập mã OTP từ email để hoàn tất đăng ký.",
    user: {
      id: pendingUser._id,
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone
    },
    requireOTP: true,
    isPending: true
  });
});

// ================== LOGIN ==================
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Kiểm tra email (select password vì mặc định không trả về)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError("Email không tồn tại", 400));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(new AppError(
      `Tài khoản bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.`,
      423
    ));
  }

  // Check if account is inactive
  if (!user.isActive) {
    return next(new AppError("Tài khoản đã bị vô hiệu hóa", 403));
  }

  // Check if account is verified
  if (!user.isVerified) {
    return next(new AppError("Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhập mã OTP.", 403));
  }

  // So sánh password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return next(new AppError("Sai mật khẩu", 400));
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Tạo token JWT (có role)
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  res.json({
    message: "Đăng nhập thành công",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ================== GET PROFILE ==================
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return next(new AppError("Không tìm thấy user", 404));
  }

  res.json(user);
});

// ================== VERIFY OTP ==================
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return next(new AppError("Vui lòng cung cấp userId và mã OTP", 400));
  }

  const result = await otpService.verifyOTP(userId, otp);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  // Gửi email chào mừng sau khi xác thực
  const user = await User.findById(result.userId);
  if (user) {
    emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name
    }).catch(err => {
      console.error('Failed to send welcome email:', err.message);
    });
  }

  res.json({
    success: true,
    message: result.message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

// ================== RESEND OTP ==================
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError("Vui lòng cung cấp userId", 400));
  }

  const result = await otpService.resendOTP(userId);

  if (!result.success) {
    return next(new AppError(result.message, 400));
  }

  res.json({
    success: true,
    message: result.message
  });
});
