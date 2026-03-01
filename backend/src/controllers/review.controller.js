const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");
const { clearCacheByPattern } = require("../middlewares/cache.middleware");

// Kiểm tra user đã mua sản phẩm chưa
const checkUserPurchased = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    status: "delivered", // Chỉ đơn hàng đã giao mới được review
    "items.product": productId
  });
  return !!order;
};

// Tính lại rating trung bình của sản phẩm
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số
    reviewCount: reviews.length
  });
};

// Thêm review mới
exports.addReview = catchAsync(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  // Kiểm tra đầu vào
  if (!productId || !rating || !comment) {
    return next(new AppError('Vui lòng điền đầy đủ thông tin', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('Đánh giá phải từ 1-5 sao', 400));
  }

  // Kiểm tra sản phẩm có tồn tại
  const product = await Product.findById(productId).lean();
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  // Kiểm tra đã mua sản phẩm chưa
  const hasPurchased = await checkUserPurchased(userId, productId);
  if (!hasPurchased) {
    return next(new AppError('Bạn cần mua sản phẩm này và đơn hàng đã được giao mới có thể đánh giá', 403));
  }

  // Kiểm tra đã review chưa
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    return next(new AppError('Bạn đã đánh giá sản phẩm này rồi', 400));
  }

  // Tạo review
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment: comment.trim()
  });

  // Cập nhật rating trung bình
  await updateProductRating(productId);

  // Populate user info
  await review.populate("user", "name email");

  logger.info('Review added', { userId, productId, rating });
  
  // Clear product cache
  clearCacheByPattern('products');

  res.status(201).json({
    message: "Đánh giá thành công",
    review
  });
});

// Lấy tất cả reviews của 1 sản phẩm
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    reviews,
    count: reviews.length
  });
});

// Kiểm tra user có thể review sản phẩm không
exports.canReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  // Kiểm tra đã mua chưa
  const hasPurchased = await checkUserPurchased(userId, productId);
  
  // Kiểm tra đã review chưa
  const hasReviewed = await Review.findOne({ user: userId, product: productId });

  res.json({
    canReview: hasPurchased && !hasReviewed,
    hasPurchased,
    hasReviewed: !!hasReviewed
  });
});

// Sửa review
exports.updateReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('Không tìm thấy đánh giá', 404));
  }

  // Kiểm tra quyền sở hữu
  if (review.user.toString() !== userId) {
    return next(new AppError('Bạn không có quyền sửa đánh giá này', 403));
  }

  // Cập nhật
  if (rating) review.rating = rating;
  if (comment) review.comment = comment.trim();
  await review.save();

  // Cập nhật rating trung bình
  await updateProductRating(review.product);

  await review.populate("user", "name email");

  logger.info('Review updated', { reviewId, userId });
  
  // Clear cache
  clearCacheByPattern('products');

  res.json({
    message: "Cập nhật đánh giá thành công",
    review
  });
});

// Xóa review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('Không tìm thấy đánh giá', 404));
  }

  // Chỉ cho phép chủ sở hữu hoặc admin xóa
  if (review.user.toString() !== userId && userRole !== "admin") {
    return next(new AppError('Bạn không có quyền xóa đánh giá này', 403));
  }

  const productId = review.product;
  await review.deleteOne();

  // Cập nhật rating trung bình
  await updateProductRating(productId);

  logger.info('Review deleted', { reviewId, userId });
  
  // Clear cache
  clearCacheByPattern('products');

  res.json({ message: "Xóa đánh giá thành công" });
});
