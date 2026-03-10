const express = require("express");
const router = express.Router();
const returnController = require("../controllers/return.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

// User routes (cần đăng nhập)
router.post("/", authMiddleware, returnController.createReturn);
router.get("/my-returns", authMiddleware, returnController.getMyReturns);
router.put("/cancel/:returnId", authMiddleware, returnController.cancelReturn);
router.get("/check-eligibility/:orderId", authMiddleware, returnController.checkReturnEligibility);

// Admin routes
router.get("/all", authMiddleware, adminMiddleware, returnController.getAllReturns);
router.put("/process/:returnId", authMiddleware, adminMiddleware, returnController.processReturn);

module.exports = router;
