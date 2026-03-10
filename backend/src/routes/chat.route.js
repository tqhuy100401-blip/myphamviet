const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Tất cả routes đều cần đăng nhập
router.use(authMiddleware);

// Lấy danh sách conversations
router.get("/conversations", chatController.getConversations);

// Lấy tin nhắn trong conversation
router.get("/messages/:conversationId", chatController.getMessages);

// Tạo conversation mới
router.post("/conversations", chatController.createConversation);

// Đánh dấu đã đọc
router.put("/read/:conversationId", chatController.markAsRead);

// Lấy số tin nhắn chưa đọc
router.get("/unread-count", chatController.getUnreadCount);

// Lấy danh sách users (để admin/user chat)
router.get("/users", chatController.getAllUsers);

// Gửi tin nhắn kèm file
router.post("/send-file", upload.single("file"), chatController.sendFileMessage);

module.exports = router;
