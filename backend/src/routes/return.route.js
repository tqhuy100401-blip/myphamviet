const express = require("express");
const router = express.Router();
const returnController = require("../controllers/return.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");
const upload = require("../middlewares/upload.middleware");

// Upload return images (cần đăng nhập)
router.post("/upload-images", authMiddleware, upload.array("images", 5), returnController.uploadReturnImages);

// User routes (cần đăng nhập)
router.post("/", authMiddleware, returnController.createReturn);
router.get("/my-returns", authMiddleware, returnController.getMyReturns);
router.put("/cancel/:returnId", authMiddleware, returnController.cancelReturn);
router.get("/check-eligibility/:orderId", authMiddleware, returnController.checkReturnEligibility);

// Admin routes
router.get("/all", authMiddleware, isAdmin, returnController.getAllReturns);
router.put("/process/:returnId", authMiddleware, isAdmin, returnController.processReturn);

module.exports = router;
