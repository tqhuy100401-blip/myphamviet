require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const sampleProducts = [
  {
    name: "Son Dior Rouge 999",
    price: 850000,
    category: "Trang điểm",
    brand: "Dior",
    description: "Son môi Dior Rouge 999 màu đỏ truyền thống, lâu trôi, dưỡng môi. Công thức mới giúp môi mềm mịn, không khô.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
    stock: 50,
    rating: 4.8,
    numReviews: 125
  },
  {
    name: "Kem chống nắng La Roche-Posay SPF50",
    price: 450000,
    category: "Chăm sóc da",
    brand: "La Roche-Posay",
    description: "Kem chống nắng cho da nhạy cảm, không gây nhờn, SPF50+ PA++++. Bảo vệ da khỏi tia UV hiệu quả.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    stock: 100,
    rating: 4.9,
    numReviews: 230
  },
  {
    name: "Serum Vitamin C The Ordinary",
    price: 320000,
    category: "Chăm sóc da",
    brand: "The Ordinary",
    description: "Serum Vitamin C giúp làm sáng da, mờ thâm nám hiệu quả. Phù hợp mọi loại da.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
    stock: 80,
    rating: 4.6,
    numReviews: 189
  },
  {
    name: "Nước hoa Chanel No.5",
    price: 2500000,
    category: "Nước hoa",
    brand: "Chanel",
    description: "Nước hoa Chanel No.5 hương thơm sang trọng, quyến rũ. Mùi hương cổ điển của phụ nữ hiện đại.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    stock: 30,
    rating: 5.0,
    numReviews: 456
  },
  {
    name: "Phấn phủ Innisfree No Sebum",
    price: 180000,
    category: "Trang điểm",
    brand: "Innisfree",
    description: "Phấn phủ kiềm dầu hiệu quả, giúp da mịn màng cả ngày. Không gây bít tắc lỗ chân lông.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
    stock: 120,
    rating: 4.7,
    numReviews: 312
  },
  {
    name: "Sữa rửa mặt CeraVe Foaming",
    price: 280000,
    category: "Chăm sóc da",
    brand: "CeraVe",
    description: "Sữa rửa mặt tạo bọt nhẹ nhàng, làm sạch sâu mà không làm khô da. Chứa ceramides giúp phục hồi da.",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500",
    stock: 95,
    rating: 4.5,
    numReviews: 178
  },
  {
    name: "Cushion LANEIGE BB Neo",
    price: 680000,
    category: "Trang điểm",
    brand: "LANEIGE",
    description: "Phấn nước cushion che phủ tốt, tự nhiên, lâu trôi. Chứa dưỡng chất giúp dưỡng ẩm cho da.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
    stock: 60,
    rating: 4.8,
    numReviews: 267
  },
  {
    name: "Mặt nạ Mediheal N.M.F Aquaring",
    price: 35000,
    category: "Chăm sóc da",
    brand: "Mediheal",
    description: "Mặt nạ giấy cấp ẩm chuyên sâu, phục hồi da khô. Sử dụng 2-3 lần/tuần cho làn da căng mọng.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500",
    stock: 200,
    rating: 4.6,
    numReviews: 445
  },
  {
    name: "Xịt khoáng Avène Thermal Water",
    price: 320000,
    category: "Chăm sóc da",
    brand: "Avène",
    description: "Nước khoáng xịt dịu nhẹ, làm dịu da nhạy cảm, cân bằng độ ẩm. Có thể dùng mọi lúc trong ngày.",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500",
    stock: 75,
    rating: 4.7,
    numReviews: 198
  },
  {
    name: "Mascara Maybelline Lash Sensational",
    price: 220000,
    category: "Trang điểm",
    brand: "Maybelline",
    description: "Mascara giúp mi dài, cong vút, không lem. Công thức không thấm nước, giữ được cả ngày.",
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500",
    stock: 85,
    rating: 4.4,
    numReviews: 334
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
