const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth routes (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    message: 'Quá nhiều lần đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút!'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    message: 'Quá nhiều file upload. Vui lòng thử lại sau!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};
