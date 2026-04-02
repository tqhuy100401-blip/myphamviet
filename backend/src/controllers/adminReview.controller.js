const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");

// Lấy tất cả đánh giá, có phân trang, lọc theo sản phẩm/user/số sao
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, product, user, rating } = req.query;
  const filter = {};
  if (product) filter.product = product;
  if (user) filter.user = user;
  if (rating) filter.rating = Number(rating);

  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Review.countDocuments(filter);
  res.json({ reviews, total });
});

// Admin xóa review bất kỳ
exports.adminDeleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) return next(new AppError("Không tìm thấy đánh giá", 404));
  const productId = review.product;
  await review.deleteOne();
  // Cập nhật lại rating trung bình
  const reviews = await Review.find({ product: productId });
  let averageRating = 0;
  if (reviews.length > 0) {
    averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length
  });
  res.json({ message: "Đã xóa đánh giá" });
});
