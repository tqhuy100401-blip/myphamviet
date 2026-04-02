const Order = require('../models/Order');
const { catchAsync, AppError } = require('../middlewares/errorHandler.middleware');
const logger = require('../config/logger');

// Chuyển khoản ngân hàng - Tạo thông tin
exports.createBankTransfer = catchAsync(async (req, res, next) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return next(new AppError('Thiếu thông tin đơn hàng', 400));
  }

  // Kiểm tra đơn hàng tồn tại
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng', 404));
  }

  // Thông tin tài khoản ngân hàng
  const bankInfo = {
    bankName: process.env.BANK_NAME || 'Ngân hàng Vietcombank',
    bankCode: process.env.BANK_CODE || 'VCB',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
    accountName: process.env.BANK_ACCOUNT_NAME || 'NGUYEN VAN A',
    branch: process.env.BANK_BRANCH || 'Chi nhánh Hà Nội',
    amount: amount,
    content: `THANHTOAN ${orderId}`
  };

  // Tạo QR code link (VietQR)
  const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(bankInfo.content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  res.json({
    success: true,
    bankInfo,
    qrCodeUrl,
    message: 'Vui lòng chuyển khoản theo thông tin và xác nhận sau khi hoàn tất'
  });
});

// Xác nhận đã chuyển khoản
exports.confirmBankTransfer = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    return next(new AppError('Thiếu mã đơn hàng', 400));
  }

  // Cập nhật trạng thái đơn hàng thành "đang xác minh"
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: 'verifying',
      paymentMethod: 'bank_transfer',
      paymentDetails: {
        confirmedAt: new Date(),
        message: 'Đang chờ admin xác minh'
      }
    },
    { new: true }
  );

  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng', 404));
  }

  logger.info('Bank transfer confirmation received', { orderId });

  res.json({
    success: true,
    message: 'Đã nhận xác nhận. Admin sẽ kiểm tra và xác minh thanh toán của bạn',
    order
  });
});
