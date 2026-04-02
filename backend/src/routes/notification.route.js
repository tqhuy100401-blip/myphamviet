const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Lấy danh sách thông báo
router.get("/", authMiddleware, notificationController.getNotifications);

// Đếm số thông báo chưa đọc
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

// Đánh dấu đã đọc một thông báo
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.put("/mark-all-read", authMiddleware, notificationController.markAllAsRead);

// Xóa thông báo
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

// Xóa tất cả thông báo đã đọc
router.delete("/read/all", authMiddleware, notificationController.deleteReadNotifications);

module.exports = router;
