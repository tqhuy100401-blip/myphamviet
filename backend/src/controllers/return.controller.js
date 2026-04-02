const Return = require("../models/Return");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Upload return images và trả về URLs
exports.uploadReturnImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Vui lòng chọn ít nhất 1 ảnh', 400));
  }

  // Lấy URLs từ Cloudinary hoặc local paths
  const imageUrls = req.files.map(file => {
    if (file.path && file.path.includes('cloudinary')) {
      return file.path; // Cloudinary URL
    }
    return `/uploads/${file.filename}`; // Local path
  });

  res.json({
    message: 'Upload ảnh thành công',
    urls: imageUrls
  });
});

// Kiểm tra điều kiện đổi trả (trong vòng 7 ngày, đơn đã giao)
const canReturnOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  
  if (!order) {
    return { canReturn: false, message: "Không tìm thấy đơn hàng" };
  }

  if (order.status !== "delivered") {
    return { canReturn: false, message: "Đơn hàng chưa được giao" };
  }

  // Kiểm tra trong vòng 7 ngày kể từ khi giao
  const deliveredDate = order.updatedAt;
  const daysSinceDelivery = Math.floor((Date.now() - deliveredDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceDelivery > 7) {
    return { canReturn: false, message: "Đã quá thời hạn đổi trả (7 ngày)" };
  }

  return { canReturn: true, order };
};

// Tạo yêu cầu đổi trả
exports.createReturn = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  let { orderId, productId, quantity, reason, description, type, images } = req.body;

  console.log('📦 CREATE RETURN - Raw body:', JSON.stringify(req.body, null, 2));
  console.log('📦 images type:', typeof images, 'isArray:', Array.isArray(images));
  console.log('📦 images value:', images);

  // Fix: Nếu images là object dạng { '0': 'url', '1': 'url' }, chuyển thành array
  if (images && typeof images === 'object' && !Array.isArray(images)) {
    console.log('⚠️ Converting images object to array');
    images = Object.values(images);
  }

  // Validate
  if (!orderId || !productId || !quantity || !reason || !type) {
    return next(new AppError('Vui lòng điền đầy đủ thông tin', 400));
  }

  if (!description || description.trim().length < 10) {
    return next(new AppError('Vui lòng mô tả chi tiết vấn đề (ít nhất 10 ký tự)', 400));
  }

  // Kiểm tra điều kiện
  const checkResult = await canReturnOrder(orderId, userId);
  if (!checkResult.canReturn) {
    return next(new AppError(checkResult.message, 400));
  }

  const order = checkResult.order;

  // Kiểm tra sản phẩm có trong đơn hàng
  const orderItem = order.items.find(item => item.product._id.toString() === productId);
  if (!orderItem) {
    return next(new AppError('Sản phẩm không có trong đơn hàng này', 400));
  }

  if (quantity > orderItem.quantity) {
    return next(new AppError('Số lượng đổi trả vượt quá số lượng đã mua', 400));
  }

  // Kiểm tra đã yêu cầu đổi trả sản phẩm này chưa
  const existingReturn = await Return.findOne({
    order: orderId,
    product: productId,
    status: { $in: ["pending", "approved", "processing"] }
  });

  if (existingReturn) {
    return next(new AppError('Bạn đã có yêu cầu đổi trả cho sản phẩm này rồi', 400));
  }

  // Tính refundAmount từ product price
  const productPrice = orderItem.product?.price || orderItem.price || 0;

  // Tạo yêu cầu
  const returnRequest = await Return.create({
    user: userId,
    order: orderId,
    product: productId,
    quantity,
    reason,
    description,
    type,
    images: images || [],
    refundAmount: productPrice * quantity
  });

  await returnRequest.populate("product", "name price image");
  await returnRequest.populate("order", "orderNumber");

  logger.info('Return request created', { userId, orderId, productId });

  res.status(201).json({
    message: "Tạo yêu cầu đổi trả thành công",
    return: returnRequest
  });
});

// Lấy danh sách yêu cầu đổi trả của user
exports.getMyReturns = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const returns = await Return.find({ user: userId })
    .populate("product", "name price image")
    .populate("order", "orderNumber")
    .populate("processedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ returns });
});

// Admin: Lấy tất cả yêu cầu đổi trả
exports.getAllReturns = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const returns = await Return.find(filter)
    .populate("user", "name email")
    .populate("product", "name price image")
    .populate("order", "orderNumber")
    .populate("processedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ returns, total: returns.length });
});

// Admin: Xử lý yêu cầu đổi trả
exports.processReturn = catchAsync(async (req, res, next) => {
  const { returnId } = req.params;
  const { status, adminNote } = req.body;
  const adminId = req.user.id;

  const returnRequest = await Return.findById(returnId);
  if (!returnRequest) {
    return next(new AppError('Không tìm thấy yêu cầu đổi trả', 404));
  }

  if (!["approved", "rejected", "processing", "completed"].includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ', 400));
  }

  // Cập nhật trạng thái
  returnRequest.status = status;
  returnRequest.adminNote = adminNote || "";
  returnRequest.processedBy = adminId;
  returnRequest.processedAt = new Date();

  // Nếu approved và là return, hoàn lại số lượng sản phẩm
  if (status === "completed" && returnRequest.type === "return") {
    await Product.findByIdAndUpdate(
      returnRequest.product,
      { $inc: { stock: returnRequest.quantity } }
    );
  }

  await returnRequest.save();
  await returnRequest.populate("user", "name email");
  await returnRequest.populate("product", "name price image");
  await returnRequest.populate("processedBy", "name");

  logger.info('Return processed', { returnId, adminId, status });

  res.json({
    message: "Xử lý yêu cầu thành công",
    return: returnRequest
  });
});

// User: Hủy yêu cầu đổi trả (chỉ khi pending)
exports.cancelReturn = catchAsync(async (req, res, next) => {
  const { returnId } = req.params;
  const userId = req.user.id;

  const returnRequest = await Return.findOne({ _id: returnId, user: userId });
  if (!returnRequest) {
    return next(new AppError('Không tìm thấy yêu cầu đổi trả', 404));
  }

  if (returnRequest.status !== "pending") {
    return next(new AppError('Chỉ có thể hủy yêu cầu đang chờ xử lý', 400));
  }

  returnRequest.status = "cancelled";
  await returnRequest.save();

  logger.info('Return cancelled', { returnId, userId });

  res.json({ message: "Đã hủy yêu cầu đổi trả" });
});

// Kiểm tra có thể đổi trả đơn hàng không
exports.checkReturnEligibility = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const result = await canReturnOrder(orderId, userId);

  // Populate order items with product details
  if (result.canReturn && result.order) {
    await result.order.populate('items.product', 'name price image');
  }

  res.json({
    eligible: result.canReturn,
    message: result.message || (result.canReturn ? 'Đơn hàng đủ điều kiện đổi trả' : 'Đơn hàng không đủ điều kiện đổi trả'),
    order: result.order
  });
});
