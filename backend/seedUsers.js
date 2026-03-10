require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa users cũ (trừ admin đã tồn tại)
    await User.deleteMany({ email: { $in: ["admin@gmail.com", "user@gmail.com"] } });
    console.log("🗑️  Đã xóa users cũ");

    // Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Tạo admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      phone: "0123456789"
    });
    console.log("✅ Đã tạo admin:", admin.email);

    // Tạo user thường
    const user = await User.create({
      name: "Nguyễn Văn A",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      phone: "0987654321"
    });
    console.log("✅ Đã tạo user:", user.email);

    console.log("\n📋 Thông tin đăng nhập:");
    console.log("Admin - Email: admin@gmail.com | Password: 123456");
    console.log("User  - Email: user@gmail.com  | Password: 123456");

    mongoose.connection.close();
    console.log("\n✅ Seed users hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi seed users:", error);
    process.exit(1);
  }
}

seedUsers();
