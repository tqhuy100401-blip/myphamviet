const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");
const upload = require("../middlewares/upload.middleware");
const { optimizeImage } = require("../middlewares/imageOptimization.middleware");
const { productValidation, mongoIdValidation } = require("../middlewares/validation.middleware");
const { cacheMiddleware } = require("../middlewares/cache.middleware");

// Public API with cache
router.get("/", cacheMiddleware(300), productController.getProducts); // 5 minutes cache
router.get("/:id", mongoIdValidation('id'), cacheMiddleware(600), productController.getProductById); // 10 minutes cache

// Protected API (cần đăng nhập)
router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  // optimizeImage, // Bật nếu muốn tối ưu ảnh ở server
  productController.createProduct
);

router.put(
  "/:id", 
  authMiddleware,
  isAdmin,
  mongoIdValidation('id'),
  upload.single("image"),
  optimizeImage,
  productValidation,
  productController.updateProduct
);

router.delete(
  "/:id", 
  authMiddleware,
  isAdmin,
  mongoIdValidation('id'),
  productController.deleteProduct
);

module.exports = router;
