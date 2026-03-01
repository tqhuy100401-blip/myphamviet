require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const sampleProducts = [
  {
    name: "Son Dior Rouge 999",
    price: 850000,
    category: "Trang điểm",
    brand: "Dior",
    description: "Son môi Dior Rouge 999 màu đỏ truyền thống, lâu trôi, dưỡng môi",
    image: "1771386903965.jpg",
    stock: 50
  },
  {
    name: "Kem chống nắng La Roche-Posay SPF50",
    price: 450000,
    category: "Chăm sóc da",
    brand: "La Roche-Posay",
    description: "Kem chống nắng cho da nhạy cảm, không gây nhờn, SPF50+ PA++++",
    image: "1770212691288.webp",
    stock: 100
  },
  {
    name: "Serum Vitamin C The Ordinary",
    price: 320000,
    category: "Chăm sóc da",
    brand: "The Ordinary",
    description: "Serum Vitamin C giúp làm sáng da, mờ thâm nám hiệu quả",
    image: "1770470008414.webp",
    stock: 80
  },
  {
    name: "Nước hoa Chanel No.5",
    price: 2500000,
    category: "Nước hoa",
    brand: "Chanel",
    description: "Nước hoa Chanel No.5 hương thơm sang trọng, quyến rũ",
    image: "1770470010019.webp",
    stock: 30
  },
  {
    name: "Phấn phủ Innisfree No Sebum",
    price: 180000,
    category: "Trang điểm",
    brand: "Innisfree",
    description: "Phấn phủ kiềm dầu hiệu quả, giúp da mịn màng cả ngày",
    image: "1770470010258.webp",
    stock: 120
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa sản phẩm cũ (tùy chọn)
    // await Product.deleteMany({});
    // console.log('🗑️  Đã xóa sản phẩm cũ');

    // Thêm sản phẩm mới
    const result = await Product.insertMany(sampleProducts);
    console.log(`✅ Đã thêm ${result.length} sản phẩm mẫu`);

    mongoose.connection.close();
    console.log('👋 Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedProducts();
