const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Lấy danh sách yêu thích
exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate("products", "name price image stock category")
    .lean();

  if (!wishlist || wishlist.products.length === 0) {
    return res.json({ products: [], message: "Chưa có sản phẩm yêu thích" });
  }

  res.json({ products: wishlist.products });
});

// Thêm sản phẩm vào danh sách yêu thích
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại', 404));
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: userId,
      products: [productId]
    });
  } else {
    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      return next(new AppError('Sản phẩm đã có trong danh sách yêu thích', 400));
    }
    wishlist.products.push(productId);
  }

  await wishlist.save();
  
  logger.info('Product added to wishlist', { userId, productId });
  
  res.json({ message: "Đã thêm vào danh sách yêu thích", wishlist });
});

// Xóa sản phẩm khỏi danh sách yêu thích
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    return next(new AppError('Danh sách yêu thích không tồn tại', 404));
  }

  wishlist.products = wishlist.products.filter(
    p => p.toString() !== productId
  );

  await wishlist.save();
  
  logger.info('Product removed from wishlist', { userId, productId });
  
  res.json({ message: "Đã xóa khỏi danh sách yêu thích", wishlist });
});

// Kiểm tra sản phẩm có trong wishlist không
exports.checkWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });

  const isInWishlist = wishlist && wishlist.products.some(
    p => p.toString() === productId
  );

  res.json({ isInWishlist });
});

// Xóa toàn bộ wishlist
exports.clearWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await Wishlist.findOneAndUpdate(
    { user: userId },
    { products: [] },
    { new: true }
  );

  logger.info('Wishlist cleared', { userId });
  
  res.json({ message: "Đã xóa toàn bộ danh sách yêu thích" });
});
