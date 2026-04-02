const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { Server } = require("socket.io");

// Load environment variables first
dotenv.config();

// Import config and middlewares
const config = require("./config/config");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const { errorHandler, notFound } = require("./middlewares/errorHandler.middleware");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimiter.middleware");
const { sanitizeInput, xssProtection } = require("./middlewares/sanitize.middleware");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://myphamviet-1.onrender.com',
      config.FRONTEND_URL
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow multiple ports and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://myphamviet-1.onrender.com',
  config.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, log rejected origins
      if (config.NODE_ENV === 'production') {
        logger.warn(`CORS rejected origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Compression middleware (gzip)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9)
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sanitization middleware
// TEMP DISABLED: express-mongo-sanitize incompatible with Express 5 req.query immutability
// app.use(sanitizeInput());
app.use(xssProtection);

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// HTTP request logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Import routes
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const productRoute = require("./routes/product.route");
const cartRoute = require("./routes/cart.route");
const wishlistRoute = require("./routes/wishlist.route");
const orderRoutes = require("./routes/order.route");
const adminRoute = require("./routes/admin.route");
const categoryRoute = require("./routes/category.route");
const reviewRoute = require("./routes/review.route");
const chatRoute = require("./routes/chat.route");
const returnRoute = require("./routes/return.route");
const couponRoute = require("./routes/coupon.route");
const flashsaleRoute = require("./routes/flashsale.route");
const paymentRoute = require("./routes/payment.route");
const notificationRoute = require("./routes/notification.route");

// Routes
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/chat", chatRoute);
app.use("/api/returns", returnRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/flashsales", flashsaleRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/notifications", notificationRoute);

// Route test
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API Website bán mỹ phẩm đang chạy...",
    version: "1.0.0",
    environment: config.NODE_ENV
  });
});

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Socket.io cho chat real-time
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

// Store online users
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  logger.info(`User connected via socket`, { userId: socket.userId });
  onlineUsers.set(socket.userId, socket.id);
  
  // Broadcast online status
  io.emit("user-online", { userId: socket.userId });

  // Join room for private chat
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
    logger.debug(`User joined conversation`, { userId: socket.userId, conversationId });
  });

  // Send message
  socket.on("send-message", async (data) => {
    try {
      const { receiverId, content, conversationId } = data;
      
      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content,
        conversationId
      });

      await message.populate("sender", "name email role");
      await message.populate("receiver", "name email role");

      // Send to conversation room
      io.to(conversationId).emit("new-message", message);
      
      // Notify receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("notification", {
          type: "new-message",
          message: `Bạn có tin nhắn mới từ ${message.sender.name}`
        });
      }
      
      logger.debug('Message sent', { 
        senderId: socket.userId, 
        receiverId, 
        conversationId 
      });
    } catch (error) {
      logger.error("Error sending message:", error);
      socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
    }
  });

  // Mark as read
  socket.on("mark-read", async (conversationId) => {
    try {
      await Message.updateMany(
        { conversationId, receiver: socket.userId, isRead: false },
        { isRead: true }
      );
      io.to(conversationId).emit("messages-read", { conversationId, userId: socket.userId });
      logger.debug('Messages marked as read', { conversationId, userId: socket.userId });
    } catch (error) {
      logger.error("Error marking messages as read:", error);
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user-typing", {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(data.conversationId).emit("user-stop-typing", {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected`, { userId: socket.userId });
    onlineUsers.delete(socket.userId);
    io.emit("user-offline", { userId: socket.userId });
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - use centralized error handler (sends safe responses in production)
app.use(errorHandler);

// Server with graceful port retry (max 3 attempts)
let portRetries = 0;
const MAX_PORT_RETRIES = 3;

function startServer(port) {
  const serverInstance = server.listen(port, () => {
    logger.info(`✅ Server đang chạy tại http://localhost:${port}`);
    logger.info(`✅ Environment: ${config.NODE_ENV}`);
  });

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      portRetries++;
      if (portRetries < MAX_PORT_RETRIES) {
        const nextPort = port + 1;
        logger.warn(`⚠️  Port ${port} đang được sử dụng. Thử port ${nextPort}... (Lần thử: ${portRetries}/${MAX_PORT_RETRIES})`);
        setTimeout(() => startServer(nextPort), 100);
      } else {
        logger.error(`❌ Không thể khởi động server sau ${MAX_PORT_RETRIES} lần thử.`);
        logger.error(`💡 Hãy chạy: npm run kill-port để giải phóng port ${config.PORT}`);
        process.exit(1);
      }
    } else {
      logger.error('❌ Lỗi server:', err);
      process.exit(1);
    }
  });
}

startServer(config.PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});
