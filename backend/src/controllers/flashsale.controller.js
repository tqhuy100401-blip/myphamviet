const FlashSale = require("../models/FlashSale");
const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Admin: Tạo flash sale mới
exports.createFlashSale = catchAsync(async (req, res, next) => {
  const { product: productId, salePrice, startTime, endTime, name, quantity } = req.body;

  // Log request for debugging
  logger.info('Creating flash sale', { body: req.body, userId: req.user._id });

  // Validate required fields
  if (!name || name.trim().length === 0) {
    return next(new AppError("Tên chương trình là bắt buộc", 400));
  }

  if (!productId) {
    return next(new AppError("Sản phẩm là bắt buộc", 400));
  }

  if (!salePrice || salePrice <= 0) {
    return next(new AppError("Giá sale không hợp lệ", 400));
  }

  if (!quantity || quantity <= 0) {
    return next(new AppError("Số lượng không hợp lệ", 400));
  }

  if (!startTime || !endTime) {
    return next(new AppError("Thời gian bắt đầu và kết thúc là bắt buộc", 400));
  }

  // Validate time
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new AppError("Định dạng thời gian không hợp lệ", 400));
  }

  if (end <= start) {
    return next(new AppError("Thời gian kết thúc phải sau thời gian bắt đầu", 400));
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm", 404));
  }

  // Validate sale price
  if (salePrice >= product.price) {
    return next(new AppError(`Giá sale phải thấp hơn giá gốc (${product.price.toLocaleString()}đ)`, 400));
  }

  // Check if product already has active flash sale
  const existingFlashSale = await FlashSale.findOne({
    product: productId,
    isActive: true,
    endTime: { $gt: new Date() }
  });

  if (existingFlashSale) {
    return next(new AppError("Sản phẩm này đang có flash sale khác", 400));
  }

  // Create flash sale
  try {
    const flashSale = await FlashSale.create({
      name: name.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      product: productId,
      originalPrice: product.price,
      salePrice: Number(salePrice),
      quantity: Number(quantity),
      maxPerUser: Number(req.body.maxPerUser) || 5,
      startTime: start,
      endTime: end,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await flashSale.populate('product', 'name image');

    logger.info('Flash sale created successfully', { 
      flashSaleId: flashSale._id,
      productId,
      adminId: req.user._id 
    });

    res.status(201).json({
      success: true,
      message: "Tạo flash sale thành công",
      flashSale
    });
  } catch (error) {
    logger.error('Error creating flash sale', { error: error.message, stack: error.stack });
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    
    throw error;
  }
});

// Admin: Lấy tất cả flash sale
exports.getAllFlashSales = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;
  const now = new Date();

  let filter = {};
  
  if (status === 'live') {
    filter.isActive = true;
    filter.startTime = { $lte: now };
    filter.endTime = { $gte: now };
  } else if (status === 'upcoming') {
    filter.isActive = true;
    filter.startTime = { $gt: now };
  } else if (status === 'ended') {
    filter.$or = [
      { isActive: false },
      { endTime: { $lt: now } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const flashSales = await FlashSale.find(filter)
    .populate('product', 'name image category')
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await FlashSale.countDocuments(filter);

  res.json({
    success: true,
    flashSales,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
});

// Admin: Cập nhật flash sale
exports.updateFlashSale = catchAsync(async (req, res, next) => {
  const flashSale = await FlashSale.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('product', 'name image');

  if (!flashSale) {
    return next(new AppError("Không tìm thấy flash sale", 404));
  }

  logger.info('Flash sale updated', { 
    flashSaleId: flashSale._id,
    adminId: req.user._id 
  });

  res.json({
    success: true,
    message: "Cập nhật flash sale thành công",
    flashSale
  });
});

// Admin: Xóa flash sale
exports.deleteFlashSale = catchAsync(async (req, res, next) => {
  const flashSale = await FlashSale.findByIdAndDelete(req.params.id);

  if (!flashSale) {
    return next(new AppError("Không tìm thấy flash sale", 404));
  }

  logger.info('Flash sale deleted', { 
    flashSaleId: flashSale._id,
    adminId: req.user._id 
  });

  res.json({
    success: true,
    message: "Xóa flash sale thành công"
  });
});

// Public: Lấy flash sale đang diễn ra
exports.getLiveFlashSales = catchAsync(async (req, res, next) => {
  const now = new Date();

  const flashSales = await FlashSale.find({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now }
  })
  .populate('product', 'name image category description')
  .sort({ endTime: 1 })
  .lean();

  // Add computed fields
  const flashSalesWithStatus = flashSales.map(fs => ({
    ...fs,
    remaining: Math.max(0, fs.quantity - fs.sold),
    soldPercent: Math.round((fs.sold / fs.quantity) * 100)
  }));

  res.json({
    success: true,
    flashSales: flashSalesWithStatus,
    total: flashSales.length
  });
});

// Public: Lấy flash sale sắp diễn ra
exports.getUpcomingFlashSales = catchAsync(async (req, res, next) => {
  const now = new Date();

  const flashSales = await FlashSale.find({
    isActive: true,
    startTime: { $gt: now }
  })
  .populate('product', 'name image category description')
  .sort({ startTime: 1 })
  .limit(10)
  .lean();

  res.json({
    success: true,
    flashSales
  });
});

// Public: Lấy thông tin flash sale theo product
exports.getFlashSaleByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const now = new Date();

  const flashSale = await FlashSale.findOne({
    product: productId,
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now }
  })
  .populate('product', 'name image price')
  .lean();

  if (!flashSale) {
    return res.json({
      success: true,
      flashSale: null,
      message: "Sản phẩm không có flash sale"
    });
  }

  res.json({
    success: true,
    flashSale: {
      ...flashSale,
      remaining: Math.max(0, flashSale.quantity - flashSale.sold),
      soldPercent: Math.round((flashSale.sold / flashSale.quantity) * 100)
    }
  });
});

// User: Kiểm tra có thể mua flash sale không
exports.checkFlashSaleEligibility = catchAsync(async (req, res, next) => {
  const { flashSaleId, quantity = 1 } = req.body;

  const flashSale = await FlashSale.findById(flashSaleId);
  if (!flashSale) {
    return next(new AppError("Không tìm thấy flash sale", 404));
  }

  const check = flashSale.canUserBuy(req.user._id, Number(quantity));

  res.json({
    success: true,
    ...check
  });
});
