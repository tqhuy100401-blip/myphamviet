const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Collections cần export
const COLLECTIONS = [
  "categories",
  "products", 
  "users",
  "orders",
  "carts",
  "reviews",
  "coupons",
  "flashsales",
  "returns",
  "messages"
];

async function exportFromAtlas() {
  try {
    // Kết nối MongoDB Atlas
    console.log("🔗 Đang kết nối MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối thành công!\n");

    // Tạo thư mục backup
    const backupDir = path.join(__dirname, "backup_data");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Export từng collection
    for (const collectionName of COLLECTIONS) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const data = await collection.find({}).toArray();
        
        if (data.length > 0) {
          const filePath = path.join(backupDir, `${collectionName}.json`);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`✅ Exported ${collectionName}: ${data.length} documents`);
        } else {
          console.log(`⚠️  ${collectionName}: Không có dữ liệu`);
        }
      } catch (err) {
        console.log(`⚠️  ${collectionName}: Collection không tồn tại hoặc lỗi`);
      }
    }

    console.log("\n🎉 Export hoàn thành!");
    console.log(`📁 Dữ liệu được lưu tại: ${backupDir}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

exportFromAtlas();
