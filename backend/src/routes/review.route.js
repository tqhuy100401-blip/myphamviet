const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { cacheMiddleware } = require("../middlewares/cache.middleware");

// Thêm review (cần đăng nhập)
router.post("/", authMiddleware, reviewController.addReview);

// Lấy reviews của sản phẩm (public) - cache 10 phút
router.get("/product/:productId", cacheMiddleware(600), reviewController.getProductReviews);

// Kiểm tra có thể review không (cần đăng nhập)
router.get("/can-review/:productId", authMiddleware, reviewController.canReview);

// Sửa review (cần đăng nhập)
router.put("/:reviewId", authMiddleware, reviewController.updateReview);

// Xóa review (cần đăng nhập)
router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

module.exports = router;
