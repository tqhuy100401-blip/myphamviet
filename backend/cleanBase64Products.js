const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Tìm và xóa sản phẩm có base64 image
  const result = await mongoose.connection.db.collection('products').deleteMany({
    image: { $regex: /^data:image/ }
  });
  
  console.log(`✅ Đã xóa ${result.deletedCount} sản phẩm có base64 image`);
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
