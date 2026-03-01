const Coupon = require("../models/Coupon");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Admin: Tạo mã khuyến mãi mới
exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  
  logger.info('Coupon created', { couponCode: coupon.code, adminId: req.user._id });

  res.status(201).json({
    success: true,
    message: "Tạo mã khuyến mãi thành công",
    coupon
  });
});

// Admin: Lấy tất cả mã khuyến mãi
exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const { isActive, search, page = 1, limit = 20 } = req.query;

  let filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Coupon.countDocuments(filter);

  res.json({
    success: true,
    coupons,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
});

// Admin: Cập nhật mã khuyến mãi
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!coupon) {
    return next(new AppError("Không tìm thấy mã khuyến mãi", 404));
  }

  logger.info('Coupon updated', { couponCode: coupon.code, adminId: req.user._id });

  res.json({
    success: true,
    message: "Cập nhật mã khuyến mãi thành công",
    coupon
  });
});

// Admin: Xóa mã khuyến mãi
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError("Không tìm thấy mã khuyến mãi", 404));
  }

  logger.info('Coupon deleted', { couponCode: coupon.code, adminId: req.user._id });

  res.json({
    success: true,
    message: "Xóa mã khuyến mãi thành công"
  });
});

// User: Kiểm tra mã khuyến mãi
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });

  if (!coupon) {
    return next(new AppError("Mã khuyến mãi không tồn tại", 404));
  }

  // Check if coupon is valid (time-wise)
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return next(new AppError("Mã khuyến mãi đã hết hạn hoặc chưa có hiệu lực", 400));
  }

  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError("Mã khuyến mãi đã hết lượt sử dụng", 400));
  }

  // Check if user already used this coupon
  if (!coupon.canBeUsedBy(req.user._id)) {
    return next(new AppError("Bạn đã sử dụng mã khuyến mãi này rồi", 400));
  }

  // Check minimum order value
  if (orderTotal < coupon.minOrderValue) {
    return next(new AppError(
      `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ để sử dụng mã này`,
      400
    ));
  }

  // Calculate discount
  try {
    const discount = coupon.applyCoupon(orderTotal);
    const finalTotal = orderTotal - discount;

    res.json({
      success: true,
      message: "Mã khuyến mãi hợp lệ",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalTotal,
        minOrderValue: coupon.minOrderValue
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// User: Lấy danh sách mã khuyến mãi có thể dùng
exports.getAvailableCoupons = catchAsync(async (req, res, next) => {
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
    ]
  })
  .select('-usedBy')
  .sort({ createdAt: -1 })
  .lean();

  // Filter coupons that user hasn't used
  const availableCoupons = coupons.filter(coupon => {
    const alreadyUsed = coupon.usedBy?.some(usage => 
      usage.user.toString() === req.user._id.toString()
    );
    return !alreadyUsed;
  });

  res.json({
    success: true,
    coupons: availableCoupons
  });
});

// System: Apply coupon to order (called from order controller)
exports.applyCouponToOrder = async (couponCode, userId, orderTotal) => {
  const coupon = await Coupon.findOne({ 
    code: couponCode.toUpperCase(),
    isActive: true 
  });

  if (!coupon || !coupon.isValid) {
    throw new Error("Mã khuyến mãi không hợp lệ");
  }

  if (!coupon.canBeUsedBy(userId)) {
    throw new Error("Bạn đã sử dụng mã khuyến mãi này rồi");
  }

  const discount = coupon.applyCoupon(orderTotal);

  // Update coupon usage
  coupon.usedCount += 1;
  coupon.usedBy.push({ user: userId });
  await coupon.save();

  logger.info('Coupon applied to order', { 
    couponCode: coupon.code, 
    userId,
    discount 
  });

  return {
    couponCode: coupon.code,
    discount,
    finalTotal: orderTotal - discount
  };
};
