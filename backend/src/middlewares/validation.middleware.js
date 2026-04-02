const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên là bắt buộc')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ chứa chữ cái'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số'),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
  
  validate
];

// Product validation rules
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ min: 3, max: 200 }).withMessage('Tên sản phẩm phải từ 3-200 ký tự'),
  
  body('price')
    .notEmpty().withMessage('Giá là bắt buộc')
    .custom(value => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Giá phải là số dương');
      }
      return true;
    }),
  
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không quá 2000 ký tự'),
  
  body('category')
    .optional({ checkFalsy: true })
    .trim(),
  
  body('stock')
    .optional({ checkFalsy: true })
    .custom(value => {
      if (value === '' || value === undefined || value === null) return true;
      const num = Number(value);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        throw new Error('Số lượng tồn kho phải là số nguyên không âm');
      }
      return true;
    }),
  
  validate
];

// Order validation rules
const orderValidation = [
  body('shippingAddress')
    .notEmpty().withMessage('Địa chỉ giao hàng là bắt buộc')
    .isObject().withMessage('Địa chỉ giao hàng phải là object'),
  
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Họ tên là bắt buộc'),
  
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  
  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Địa chỉ là bắt buộc'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Thành phố là bắt buộc'),
  
  body('paymentMethod')
    .notEmpty().withMessage('Phương thức thanh toán là bắt buộc')
    .isIn(['cod', 'card', 'bank_transfer']).withMessage('Phương thức thanh toán không hợp lệ'),
  
  validate
];

// Review validation rules
const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Đánh giá là bắt buộc')
    .isInt({ min: 1, max: 5 }).withMessage('Đánh giá phải từ 1-5 sao'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Nhận xét không quá 500 ký tự'),
  
  validate
];

// ID validation
const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage('ID không hợp lệ'),
  
  validate
];

// Query validation for pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Giới hạn phải từ 1-100'),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  mongoIdValidation,
  paginationValidation
};
