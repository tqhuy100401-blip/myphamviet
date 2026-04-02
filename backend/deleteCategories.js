const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");

dotenv.config();

async function deleteCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công");

    // Xóa các danh mục theo tên
    const categoriesToDelete = [
      "Chăm sóc da mặt",
      "Trang điểm",
      "chăm sóc da mặt",
      "trang điểm"
    ];

    const result = await Category.deleteMany({
      name: { $in: categoriesToDelete }
    });

    console.log(`✅ Đã xóa ${result.deletedCount} danh mục`);

    // Hiển thị danh mục còn lại
    const remainingCategories = await Category.find({}, "name icon");
    console.log("\n📁 Danh mục còn lại:");
    remainingCategories.forEach(cat => {
      console.log(`   ${cat.icon || "📦"} ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

deleteCategories();
