const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Chỉ cho phép upload hình
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb("Chỉ cho phép upload ảnh (jpg, jpeg, png, webp)");
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
