// Script xóa sản phẩm hết hàng
const mongoose = require('mongoose');

const config = require('./src/config/config');
const Product = require('./src/models/Product');

async function deleteOutOfStockProducts() {
  try {
    await mongoose.connect(config.MONGO_URI);
    const result = await Product.deleteMany({ stock: { $lte: 0 } });
    console.log(`Đã xóa ${result.deletedCount} sản phẩm hết hàng.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi xóa sản phẩm hết hàng:', err);
    process.exit(1);
  }
}

deleteOutOfStockProducts();
