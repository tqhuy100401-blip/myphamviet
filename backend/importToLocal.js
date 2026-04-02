const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Kết nối MongoDB Local
const LOCAL_MONGO_URI = "mongodb://localhost:27017/myphamviet";

// Collections cần import
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

async function importToLocal() {
  try {
    // Kết nối MongoDB Local
    console.log("🔗 Đang kết nối MongoDB Local...");
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log("✅ Kết nối thành công!\n");

    const backupDir = path.join(__dirname, "backup_data");
    
    if (!fs.existsSync(backupDir)) {
      console.error("❌ Không tìm thấy thư mục backup_data!");
      console.log("💡 Hãy chạy exportFromAtlas.js trước");
      process.exit(1);
    }

    // Import từng collection
    for (const collectionName of COLLECTIONS) {
      const filePath = path.join(backupDir, `${collectionName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${collectionName}.json: File không tồn tại`);
        continue;
      }

      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        
        if (data.length === 0) {
          console.log(`⚠️  ${collectionName}: Không có dữ liệu để import`);
          continue;
        }

        const collection = mongoose.connection.db.collection(collectionName);
        
        // Xóa dữ liệu cũ (nếu có)
        await collection.deleteMany({});
        
        // Insert dữ liệu mới
        await collection.insertMany(data);
        console.log(`✅ Imported ${collectionName}: ${data.length} documents`);
      } catch (err) {
        console.error(`❌ Lỗi import ${collectionName}:`, err.message);
      }
    }

    console.log("\n🎉 Import hoàn thành!");
    console.log(`📊 Database: ${LOCAL_MONGO_URI}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

importToLocal();
