const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { cacheMiddleware } = require("../middlewares/cache.middleware");

// Async wrapper để xử lý errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public - với cache 30 phút
router.get("/", cacheMiddleware(1800), asyncHandler(categoryController.getAllCategories));

// Test route (no auth)
router.post("/test", (req, res) => {
  res.json({ message: "Test route works", body: req.body });
});

// Admin only
router.post("/", authMiddleware, asyncHandler(categoryController.createCategory));
router.put("/:id", authMiddleware, asyncHandler(categoryController.updateCategory));
router.delete("/:id", authMiddleware, asyncHandler(categoryController.deleteCategory));

module.exports = router;
