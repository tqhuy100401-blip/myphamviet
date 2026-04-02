const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");

// Public routes
router.get("/available", couponController.getAvailableCoupons);
router.post("/validate", authMiddleware, couponController.validateCoupon);

// Admin routes
router.post("/", authMiddleware, isAdmin, couponController.createCoupon);
router.get("/", authMiddleware, isAdmin, couponController.getAllCoupons);
router.put("/:id", authMiddleware, isAdmin, couponController.updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, couponController.deleteCoupon);

module.exports = router;
