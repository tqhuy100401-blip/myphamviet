const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");
const Coupon = require("./src/models/Coupon");
const FlashSale = require("./src/models/FlashSale");

dotenv.config();

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công");

    // XÓA TẤT CẢ DATA CŨ
    console.log("\n🗑️  Đang xóa tất cả data cũ...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await FlashSale.deleteMany({});
    console.log("✅ Đã xóa tất cả data cũ");

    // 1. TẠO ADMIN & USER
    console.log("\n👤 Tạo tài khoản...");
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const admin = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      phone: "0123456789",
      isVerified: true
    });
    console.log("✅ Admin: admin@gmail.com / 123456");

    const user = await User.create({
      name: "Huy Trần",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "user",
      phone: "0987654321",
      isVerified: true
    });
    console.log("✅ User: user@gmail.com / 123456");

    // 2. TẠO DANH MỤC
    console.log("\n📁 Tạo danh mục...");
    const categories = await Category.insertMany([
      { name: "Son môi", slug: "son-moi", icon: "💄", description: "Son thỏi, son kem, son dưỡng" },
      { name: "Kem dưỡng da", slug: "kem-duong-da", icon: "🧴", description: "Kem dưỡng ẩm, kem chống lão hóa" },
      { name: "Sữa rửa mặt", slug: "sua-rua-mat", icon: "🧼", description: "Làm sạch da mặt" },
      { name: "Phấn mắt", slug: "phan-mat", icon: "👁️", description: "Phấn mắt, mascara" },
      { name: "Nước hoa", slug: "nuoc-hoa", icon: "🌸", description: "Nước hoa nam, nữ" }
    ]);
    console.log(`✅ Đã tạo ${categories.length} danh mục`);

    // 3. TẠO SẢN PHẨM
    console.log("\n🛍️  Tạo sản phẩm...");
    const products = await Product.insertMany([
      // Son môi
      { name: "Son DIOR Rouge 999", price: 950000, category: "Son môi", stock: 50, description: "Son môi cao cấp DIOR màu đỏ 999", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop" },
      { name: "Son MAC Ruby Woo", price: 550000, category: "Son môi", stock: 30, description: "Son MAC màu đỏ Ruby Woo", image: "https://images.unsplash.com/photo-1631214524220-6554e7b02b52?w=500&h=500&fit=crop" },
      { name: "Son 3CE Velvet Lip", price: 280000, category: "Son môi", stock: 100, description: "Son 3CE Hàn Quốc", image: "https://images.unsplash.com/photo-1627893270555-aa2b0490da88?w=500&h=500&fit=crop" },
      
      // Kem dưỡng da
      { name: "Kem Sulwhasoo Concentrate", price: 1800000, category: "Kem dưỡng da", stock: 20, description: "Kem dưỡng da cao cấp Sulwhasoo", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop" },
      { name: "Kem Innisfree Green Tea", price: 320000, category: "Kem dưỡng da", stock: 80, description: "Kem dưỡng trà xanh Innisfree", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop" },
      { name: "Kem La Roche-Posay", price: 450000, category: "Kem dưỡng da", stock: 60, description: "Kem dưỡng da nhạy cảm", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop" },
      
      // Sữa rửa mặt
      { name: "SRM Cetaphil Gentle", price: 180000, category: "Sữa rửa mặt", stock: 120, description: "Sữa rửa mặt dịu nhẹ Cetaphil", image: "https://images.unsplash.com/photo-1556228852-80a9060b2e13?w=500&h=500&fit=crop" },
      { name: "SRM Senka Perfect Whip", price: 95000, category: "Sữa rửa mặt", stock: 200, description: "Sữa rửa mặt Senka", image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500&h=500&fit=crop" },
      
      // Phấn mắt
      { name: "Bảng Phấn Urban Decay", price: 1200000, category: "Phấn mắt", stock: 15, description: "Bảng phấn mắt Urban Decay Naked", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop" },
      { name: "Mascara Maybelline", price: 150000, category: "Phấn mắt", stock: 90, description: "Mascara Maybelline Hypercurl", image: "https://images.unsplash.com/photo-1631730486572-226c2d0c5c8f?w=500&h=500&fit=crop" },
      
      // Nước hoa
      { name: "Nước hoa Chanel No.5", price: 2500000, category: "Nước hoa", stock: 10, description: "Nước hoa nữ Chanel No.5", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop" },
      { name: "Nước hoa Dior Sauvage", price: 2200000, category: "Nước hoa", stock: 12, description: "Nước hoa nam Dior Sauvage", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop" }
    ]);
    console.log(`✅ Đã tạo ${products.length} sản phẩm`);

    // 4. TẠO MÃ GIẢM GIÁ
    console.log("\n🎫 Tạo mã giảm giá...");
    const now = new Date();
    const coupons = await Coupon.insertMany([
      {
        code: "VIP100K",
        description: "Giảm 100.000đ cho đơn từ 500.000đ",
        type: "fixed",
        value: 100000,
        minOrderValue: 500000,
        startDate: now,
        endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
        usageLimit: 100,
        isActive: true
      },
      {
        code: "SALE20",
        description: "Giảm 20% tối đa 200.000đ",
        type: "percentage",
        value: 20,
        minOrderValue: 300000,
        maxDiscount: 200000,
        startDate: now,
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
        usageLimit: 200,
        isActive: true
      },
      {
        code: "FREESHIP",
        description: "Miễn phí ship cho đơn từ 200.000đ",
        type: "fixed",
        value: 30000,
        minOrderValue: 200000,
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
        usageLimit: null, // Không giới hạn
        isActive: true
      }
    ]);
    console.log(`✅ Đã tạo ${coupons.length} mã giảm giá`);
    console.log("   - VIP100K: Giảm 100k cho đơn từ 500k");
    console.log("   - SALE20: Giảm 20% tối đa 200k");
    console.log("   - FREESHIP: Free ship cho đơn từ 200k");

    // 5. TẠO FLASH SALE
    console.log("\n⚡ Tạo Flash Sale...");
    const flashSales = await FlashSale.insertMany([
      {
        name: "Flash Sale Son DIOR -30%",
        description: "Giảm giá 30% cho Son DIOR Rouge 999",
        product: products[0]._id, // Son DIOR
        discountPercent: 30,
        originalPrice: products[0].price,
        salePrice: Math.round(products[0].price * 0.7), // Giảm 30%
        startTime: now,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        quantity: 20,
        isActive: true
      },
      {
        name: "Flash Sale Kem Sulwhasoo -25%",
        description: "Giảm giá 25% cho Kem Sulwhasoo",
        product: products[3]._id, // Kem Sulwhasoo
        discountPercent: 25,
        originalPrice: products[3].price,
        salePrice: Math.round(products[3].price * 0.75), // Giảm 25%
        startTime: now,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        quantity: 10,
        isActive: true
      },
      {
        name: "Flash Sale Bảng Phấn -40%",
        description: "Giảm giá 40% cho Bảng Phấn Urban Decay",
        product: products[8]._id, // Bảng phấn Urban Decay
        discountPercent: 40,
        originalPrice: products[8].price,
        salePrice: Math.round(products[8].price * 0.6), // Giảm 40%
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Bắt đầu sau 1 ngày
        endTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        quantity: 5,
        isActive: true
      }
    ]);
    console.log(`✅ Đã tạo ${flashSales.length} Flash Sale`);

    // TỔNG KẾT
    console.log("\n" + "=".repeat(50));
    console.log("✅ HOÀN THÀNH SEED DATA");
    console.log("=".repeat(50));
    console.log("\n📊 Thống kê:");
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   📁 Categories: ${await Category.countDocuments()}`);
    console.log(`   🛍️  Products: ${await Product.countDocuments()}`);
    console.log(`   🎫 Coupons: ${await Coupon.countDocuments()}`);
    console.log(`   ⚡ Flash Sales: ${await FlashSale.countDocuments()}`);
    
    console.log("\n🔑 Tài khoản đăng nhập:");
    console.log("   Admin: admin@gmail.com / 123456");
    console.log("   User:  user@gmail.com / 123456");

    console.log("\n🎫 Mã giảm giá:");
    console.log("   VIP100K  - Giảm 100k");
    console.log("   SALE20   - Giảm 20%");
    console.log("   FREESHIP - Free ship");

    console.log("\n⚡ Flash Sale đang chạy:");
    console.log("   Son DIOR (-30%)");
    console.log("   Kem Sulwhasoo (-25%)");
    console.log("   Bảng phấn Urban Decay (-40%, sắp diễn ra)");

    console.log("\n✅ Bạn có thể chạy frontend và backend ngay bây giờ!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

seedAll();
