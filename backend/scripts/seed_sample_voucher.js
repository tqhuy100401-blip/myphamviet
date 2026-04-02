require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../src/models/Coupon');


(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB');

  // Xóa các voucher trùng mã TEST100K
  await Coupon.deleteMany({ code: 'TEST100K' });

  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày nữa

  const voucher = await Coupon.create({
    code: 'TEST100K',
    description: 'Voucher giảm 100K cho đơn từ 200K, dùng thử chức năng',
    type: 'fixed',
    value: 100000,
    minOrderValue: 200000,
    maxDiscount: null,
    startDate: now,
    endDate: end,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    usedBy: []
  });

  console.log('Đã seed voucher mẫu:', voucher);
  await mongoose.disconnect();
})();
