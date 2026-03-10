const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");
const { clearCacheByPattern } = require("../middlewares/cache.middleware");
const emailService = require("../services/email.service");

// Tạo đơn hàng từ giỏ hàng
exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { customerName, phone, shippingAddress, note, selectedProductIds } = req.body;
  logger.info(
    `Creating order ${JSON.stringify({ userId, body: req.body })}`
  );

  try {
    // Tìm giỏ hàng của người dùng và populate thông tin sản phẩm
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Giỏ hàng của bạn đang trống.', 400));
    }

    // Lọc chỉ các sản phẩm được chọn
    let cartItemsToOrder = cart.items;
    if (selectedProductIds && Array.isArray(selectedProductIds) && selectedProductIds.length > 0) {
      cartItemsToOrder = cart.items.filter(item => 
        selectedProductIds.includes(item.product._id.toString())
      );
      
      if (cartItemsToOrder.length === 0) {
        return next(new AppError('Không có sản phẩm nào được chọn để đặt hàng.', 400));
      }
    }

    let totalPrice = 0;
    const orderItems = [];

    // Bắt đầu một vòng lặp để xử lý từng mặt hàng được chọn
    for (const item of cartItemsToOrder) {
      // Lấy thông tin sản phẩm đầy đủ từ DB
      const product = await Product.findById(item.product._id);
      if (!product) {
        // Nếu sản phẩm không tồn tại, trả về lỗi
        return next(
          new AppError(`Sản phẩm với ID ${item.product._id} không tồn tại.`, 404)
        );
      }

      // Kiểm tra số lượng tồn kho
      if (product.stock < item.quantity) {
        return next(
          new AppError(`Không đủ hàng cho sản phẩm: ${product.name}.`, 400)
        );
      }

      // Tính toán tổng tiền
      const price = product.price; // Cần logic phức tạp hơn cho khuyến mãi
      totalPrice += price * item.quantity;
      
      // Thêm mặt hàng vào danh sách cho đơn hàng
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price,
        name: product.name,
        image: (product.images && product.images.length > 0) ? product.images[0] : '',
      });

      // Trừ số lượng tồn kho và lưu lại
      product.stock -= item.quantity;
      await product.save();
    }

    // Tạo một đối tượng Order mới
    const order = new Order({
      user: userId,
      items: orderItems,
      totalPrice,
      customerName,
      phone,
      shippingAddress,
      note,
    });

    // Lưu đơn hàng vào cơ sở dữ liệu
    await order.save();

    // Xóa chỉ các sản phẩm đã đặt khỏi giỏ hàng
    if (selectedProductIds && selectedProductIds.length > 0) {
      // Giữ lại các sản phẩm không được chọn
      cart.items = cart.items.filter(item => 
        !selectedProductIds.includes(item.product._id.toString())
      );
      await cart.save();
    } else {
      // Nếu không có selectedProductIds, xóa toàn bộ giỏ hàng (hành vi cũ)
      await Cart.findByIdAndDelete(cart._id);
    }

    // Lấy thông tin user để gửi email
    const user = await User.findById(userId).select('name email');
    
    // Gửi email xác nhận đơn hàng (async, không chờ)
    if (user && user.email) {
      emailService.sendOrderConfirmation({
        user: { email: user.email },
        items: orderItems,
        totalPrice,
        customerName,
        phone,
        shippingAddress,
        orderNumber: order._id.toString().slice(-8).toUpperCase()
      }).catch(err => {
        logger.error(`Failed to send order confirmation email: ${err.message}`);
      });
    }

    // Trả về phản hồi thành công
    res.status(201).json({
      status: 'success',
      message: 'Đơn hàng đã được tạo thành công!',
      data: {
        order,
      },
    });
  } catch (error) {
    // Ghi lại lỗi nếu có bất kỳ vấn đề nào xảy ra
    logger.error(`Error creating order: ${JSON.stringify({ error: error.message, stack: error.stack })}`);
    // Lưu ý: Không có transaction, việc rollback sẽ phức tạp.
    // Đây là sự đánh đổi khi chạy trên môi trường không có replica set.
    return next(new AppError('Không thể tạo đơn hàng. Vui lòng thử lại.', 500));
  }
});

// Lấy đơn hàng của user
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product", "name price image")
    .sort({ createdAt: -1 })
    .lean()
    .select("-__v");

  res.json(orders);
});

// Admin xem tất cả đơn hàng
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 50 } = req.query;
  
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .select("-__v"),
    Order.countDocuments(filter)
  ]);

  res.json({
    orders,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
});

// Đếm số đơn hàng chờ xử lý (Admin)
exports.getPendingOrdersCount = catchAsync(async (req, res, next) => {
  const count = await Order.countDocuments({ status: "pending" });
  res.json({ count });
});

// Đếm số đơn hàng đang xử lý của user
exports.getMyActiveOrdersCount = catchAsync(async (req, res, next) => {
  const count = await Order.countDocuments({
    user: req.user.id,
    status: { $in: ["pending", "confirmed", "shipping"] }
  });
  res.json({ count });
});

// Cập nhật trạng thái đơn hàng (Admin)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next(new AppError("Trạng thái không hợp lệ", 400));
  }

  const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao hàng",
    delivered: "Đã giao thành công",
    cancelled: "Đã hủy đơn hàng"
  };

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
      $push: {
        statusHistory: {
          status,
          time: new Date(),
          note: statusLabels[status] || status
        }
      }
    },
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new AppError("Không tìm thấy đơn hàng", 404));
  }

  logger.info('Order status updated', { 
    orderId: order._id, 
    newStatus: status 
  });

  // Clear cache
  clearCacheByPattern('orders');

  res.json({ message: "Cập nhật trạng thái thành công", order });
});
