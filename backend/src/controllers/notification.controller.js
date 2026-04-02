const Notification = require("../models/Notification");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Tạo thông báo mới (internal function)
exports.createNotification = async (userId, type, title, message, link = "", icon = "🔔", data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      icon,
      data
    });
    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

// Tạo thông báo cho nhiều users
exports.createBulkNotifications = async (userIds, type, title, message, link = "", icon = "🔔", data = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      link,
      icon,
      data
    }));
    
    await Notification.insertMany(notifications);
    logger.info(`Bulk notifications created for ${userIds.length} users: ${title}`);
  } catch (error) {
    logger.error(`Error creating bulk notifications: ${error.message}`);
    throw error;
  }
};

// Lấy danh sách thông báo của user
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, read } = req.query;

  const filter = { user: userId };
  if (read !== undefined) {
    filter.read = read === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, read: false })
  ]);

  res.json({
    notifications,
    total,
    unreadCount,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
});

// Đếm số thông báo chưa đọc
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const unreadCount = await Notification.countDocuments({
    user: userId,
    read: false
  });

  res.json({ unreadCount });
});

// Đánh dấu đã đọc một thông báo
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({ _id: id, user: userId });
  
  if (!notification) {
    return next(new AppError("Không tìm thấy thông báo", 404));
  }

  notification.read = true;
  await notification.save();

  res.json({
    message: "Đã đánh dấu đã đọc",
    notification
  });
});

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );

  res.json({ message: "Đã đánh dấu tất cả đã đọc" });
});

// Xóa thông báo
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({ _id: id, user: userId });
  
  if (!notification) {
    return next(new AppError("Không tìm thấy thông báo", 404));
  }

  await notification.deleteOne();

  res.json({ message: "Đã xóa thông báo" });
});

// Xóa tất cả thông báo đã đọc
exports.deleteReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const result = await Notification.deleteMany({
    user: userId,
    read: true
  });

  res.json({
    message: `Đã xóa ${result.deletedCount} thông báo`,
    deletedCount: result.deletedCount
  });
});

// Helper functions để tạo thông báo cho các event cụ thể

// Thông báo đơn hàng
exports.notifyOrderStatus = async (userId, orderId, status, orderNumber) => {
  const statusMessages = {
    confirmed: {
      title: "Đơn hàng đã được xác nhận",
      message: `Đơn hàng #${orderNumber} của bạn đã được xác nhận và đang được chuẩn bị`,
      icon: "✅"
    },
    shipping: {
      title: "Đơn hàng đang giao",
      message: `Đơn hàng #${orderNumber} của bạn đang trên đường giao đến bạn`,
      icon: "🚚"
    },
    delivered: {
      title: "Đơn hàng đã giao thành công",
      message: `Đơn hàng #${orderNumber} đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
      icon: "📦"
    },
    cancelled: {
      title: "Đơn hàng đã bị hủy",
      message: `Đơn hàng #${orderNumber} của bạn đã bị hủy`,
      icon: "❌"
    }
  };

  const statusInfo = statusMessages[status];
  if (!statusInfo) return;

  await exports.createNotification(
    userId,
    "order",
    statusInfo.title,
    statusInfo.message,
    `/my-orders`,
    statusInfo.icon,
    { orderId, status, orderNumber }
  );
};

// Thông báo khuyến mãi
exports.notifyPromotion = async (userIds, couponCode, discountPercent, expiryDate) => {
  const title = "🎉 Mã giảm giá mới cho bạn!";
  const message = `Nhận ngay mã ${couponCode} giảm ${discountPercent}%. Có hiệu lực đến ${new Date(expiryDate).toLocaleDateString("vi-VN")}`;
  
  await exports.createBulkNotifications(
    userIds,
    "promotion",
    title,
    message,
    "/vouchers",
    "🎁",
    { couponCode, discountPercent, expiryDate }
  );
};

// Thông báo Flash Sale sắp diễn ra
exports.notifyUpcomingFlashSale = async (userIds, flashSaleInfo) => {
  const { productName, discountPercent, startTime } = flashSaleInfo;
  const title = "⚡ Flash Sale sắp bắt đầu!";
  const message = `${productName} giảm ${discountPercent}% vào ${new Date(startTime).toLocaleString("vi-VN")}. Đừng bỏ lỡ!`;
  
  await exports.createBulkNotifications(
    userIds,
    "flashsale",
    title,
    message,
    "/flash-sale",
    "⚡",
    flashSaleInfo
  );
};

// Thông báo Flash Sale đang diễn ra
exports.notifyLiveFlashSale = async (userIds, flashSaleInfo) => {
  const { productName, discountPercent } = flashSaleInfo;
  const title = "⚡ Flash Sale đang diễn ra!";
  const message = `${productName} đang giảm ${discountPercent}%! Nhanh tay đặt hàng!`;
  
  await exports.createBulkNotifications(
    userIds,
    "flashsale",
    title,
    message,
    "/flash-sale",
    "🔥",
    flashSaleInfo
  );
};

// Thông báo sản phẩm sắp hết hàng
exports.notifyLowStock = async (adminIds, productInfo) => {
  const { productName, stock } = productInfo;
  const title = "⚠️ Cảnh báo sắp hết hàng";
  const message = `Sản phẩm "${productName}" chỉ còn ${stock} sản phẩm trong kho`;
  
  await exports.createBulkNotifications(
    adminIds,
    "system",
    title,
    message,
    "/admin/products",
    "⚠️",
    productInfo
  );
};
