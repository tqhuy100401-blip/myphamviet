class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const logger = require('../config/logger');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field} đã tồn tại. Vui lòng sử dụng giá trị khác.`;
      error = new AppError(message, 400);
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
      error = new AppError(message, 400);
    }

    // MongoDB cast error (invalid ID)
    if (err.name === 'CastError') {
      const message = `Không tìm thấy ${err.path}: ${err.value}`;
      error = new AppError(message, 404);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);
    }

    if (err.name === 'TokenExpiredError') {
      error = new AppError('Token đã hết hạn. Vui lòng đăng nhập lại!', 401);
    }

    sendErrorProd(error, req, res);
  }
};

const sendErrorDev = (err, req, res) => {
  // API
  logger.error('💥 ERROR:', { 
    message: err.message, 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  
  // Log to console as well for easier debugging
  console.error('❌ Error Details:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.warn('Operational Error:', { 
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak error details
  logger.error('💥 CRITICAL ERROR:', { 
    error: err,
    url: req.originalUrl,
    method: req.method
  });
  
  return res.status(500).json({
    status: 'error',
    message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
  });
};

// Async error handler wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
const notFound = (req, res, next) => {
  const err = new AppError(`Không tìm thấy ${req.originalUrl}`, 404);
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};
