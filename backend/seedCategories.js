const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "FiTag" },
  slug: { type: String, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

function makeSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const categories = [
  { name: "Son môi", description: "Các loại son môi: lì, bóng, tint", icon: "FiHeart", slug: makeSlug("Son môi") },
  { name: "Kem dưỡng", description: "Kem dưỡng da mặt, body", icon: "FiDroplet", slug: makeSlug("Kem dưỡng") },
  { name: "Nước hoa", description: "Nước hoa nam, nữ, unisex", icon: "FiStar", slug: makeSlug("Nước hoa") },
  { name: "Mặt nạ", description: "Mặt nạ giấy, mặt nạ ngủ", icon: "FiFeather", slug: makeSlug("Mặt nạ") },
  { name: "Trang điểm", description: "Phấn, mascara, eyeliner", icon: "FiSun", slug: makeSlug("Trang điểm") },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công");

    await Category.deleteMany({});
    console.log("🗑️  Đã xóa danh mục cũ");

    for (const cat of categories) {
      const category = new Category(cat);
      await category.save();
      console.log(`✅ Đã thêm: ${category.name} (${category.slug})`);
    }

    console.log("\n🎉 Seed categories hoàn thành!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

seedCategories();
