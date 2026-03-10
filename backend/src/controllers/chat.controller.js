const Message = require("../models/Message");
const User = require("../models/User");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");

// Lấy danh sách conversations của user
exports.getConversations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Lấy tất cả tin nhắn liên quan đến user
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: -1 });

  // Group theo conversation và lấy tin nhắn mới nhất
  const conversationMap = new Map();
  
  for (const message of messages) {
    const otherUser = message.sender._id.toString() === userId 
      ? message.receiver 
      : message.sender;
    
    const otherUserId = otherUser._id.toString();
    
    if (!conversationMap.has(otherUserId)) {
      const unreadCount = await Message.countDocuments({
        conversationId: message.conversationId,
        receiver: userId,
        isRead: false
      });

      conversationMap.set(otherUserId, {
        conversationId: message.conversationId,
        otherUser,
        lastMessage: message,
        unreadCount
      });
    }
  }

  const conversations = Array.from(conversationMap.values());

  logger.info('Conversations retrieved', { userId, count: conversations.length });
  
  res.json({ conversations });
});

// Lấy tin nhắn trong 1 conversation
exports.getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  const messages = await Message.find({ conversationId })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: 1 })
    .lean();

  // Verify user is part of conversation
  if (messages.length > 0) {
    const firstMessage = messages[0];
    const isParticipant = 
      firstMessage.sender._id.toString() === userId ||
      firstMessage.receiver._id.toString() === userId;
    
    if (!isParticipant) {
      return next(new AppError('Bạn không có quyền xem cuộc trò chuyện này', 403));
    }
  }

  res.json({ messages });
});

// Tạo conversation mới (gửi tin nhắn đầu tiên)
exports.createConversation = catchAsync(async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !content) {
    return next(new AppError('Thiếu thông tin', 400));
  }

  // Kiểm tra receiver có tồn tại
  const receiver = await User.findById(receiverId).lean();
  if (!receiver) {
    return next(new AppError('Không tìm thấy người nhận', 404));
  }

  // Tạo conversationId (sort để đảm bảo consistency)
  const conversationId = [senderId, receiverId].sort().join("-");

  // Tạo tin nhắn
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
    conversationId
  });

  await message.populate("sender", "name email role");
  await message.populate("receiver", "name email role");

  logger.info('Conversation created', { senderId, receiverId, conversationId });

  res.status(201).json({ 
    message: "Tạo cuộc trò chuyện thành công",
    data: message 
  });
});

// Đánh dấu đã đọc
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  const result = await Message.updateMany(
    { conversationId, receiver: userId, isRead: false },
    { isRead: true }
  );

  logger.info('Messages marked as read', { userId, conversationId, count: result.modifiedCount });

  res.json({ message: "Đã đánh dấu đã đọc" });
});

// Lấy số tin nhắn chưa đọc
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const count = await Message.countDocuments({
    receiver: userId,
    isRead: false
  });

  res.json({ count });
});

// Admin: Lấy tất cả users để chat
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  
  const users = await User.find({ 
    _id: { $ne: currentUserId } 
  }).select("name email role").lean();

  res.json({ users });
});

// Gửi tin nhắn kèm file
exports.sendFileMessage = catchAsync(async (req, res, next) => {
  const { receiverId, conversationId, content } = req.body;
  const senderId = req.user.id;
  let fileUrl = null;
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  }
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    conversationId,
    content: content || "",
    fileUrl,
    isRead: false
  });

  logger.info('File message sent', { senderId, receiverId, fileUrl });
  
  res.json({ message });
});
