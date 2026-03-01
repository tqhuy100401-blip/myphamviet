const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashsale.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");

// Public routes
router.get("/live", flashSaleController.getLiveFlashSales);
router.get("/upcoming", flashSaleController.getUpcomingFlashSales);
router.get("/product/:productId", flashSaleController.getFlashSaleByProduct);

// User routes
router.post("/check-eligibility", authMiddleware, flashSaleController.checkFlashSaleEligibility);

// Admin routes
router.post("/", authMiddleware, isAdmin, flashSaleController.createFlashSale);
router.get("/", authMiddleware, isAdmin, flashSaleController.getAllFlashSales);
router.put("/:id", authMiddleware, isAdmin, flashSaleController.updateFlashSale);
router.delete("/:id", authMiddleware, isAdmin, flashSaleController.deleteFlashSale);

module.exports = router;
