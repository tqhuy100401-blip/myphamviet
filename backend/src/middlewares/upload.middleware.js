const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config/config");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

// Sử dụng Cloudinary storage nếu có config, nếu không dùng local
let storage;

if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  // Cloudinary storage (cho production)
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "myphamviet",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit" }]
    }
  });
  console.log("✅ Using Cloudinary storage for uploads");
} else {
  // Local storage (cho development)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  console.log("⚠️  Using local storage for uploads (set Cloudinary env vars for production)");
}

// Chỉ cho phép upload hình
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload ảnh (jpg, jpeg, png, webp)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE || 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
