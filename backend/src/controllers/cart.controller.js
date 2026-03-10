const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");
const { clearCacheByPattern } = require("../middlewares/cache.middleware");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  // Validate product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Sản phẩm không đủ số lượng trong kho', 400));
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return next(new AppError('Số lượng vượt quá tồn kho', 400));
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  
  logger.info('Product added to cart', { userId, productId, quantity });
  
  res.json({ message: "Đã thêm vào giỏ hàng", cart });
});

// Lấy giỏ hàng của user
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product", "name price image stock")
    .lean();

  if (!cart || cart.items.length === 0) {
    return res.json({ items: [], message: "Giỏ hàng trống" });
  }

  res.json(cart);
});

// Lấy số lượng sản phẩm trong giỏ
exports.getCartCount = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).lean();
  const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  res.json({ count });
});

// Cập nhật số lượng
exports.updateCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    return next(new AppError('Số lượng phải lớn hơn 0', 400));
  }

  // Check product stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Sản phẩm không tồn tại', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Không có giỏ hàng', 404));
  }

  const item = cart.items.find(
    item => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError('Không tìm thấy sản phẩm trong giỏ', 404));
  }

  item.quantity = quantity;
  await cart.save();

  logger.info('Cart updated', { userId: req.user.id, productId, quantity });

  res.json({ message: "Cập nhật thành công", cart });
});

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Không có giỏ hàng', 404));
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    return next(new AppError('Sản phẩm không có trong giỏ', 404));
  }

  await cart.save();

  logger.info('Product removed from cart', { userId: req.user.id, productId });

  res.json({ message: "Đã xóa sản phẩm khỏi giỏ", cart });
});

// Xóa toàn bộ giỏ hàng
exports.clearCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  
  logger.info('Cart cleared', { userId: req.user.id });
  
  res.json({ message: "Đã xóa giỏ hàng" });
});
