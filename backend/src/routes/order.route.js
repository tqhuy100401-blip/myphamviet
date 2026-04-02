const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// sau này thêm isAdmin middleware

router.post("/create", authMiddleware, orderController.createOrder);
router.get("/my-orders", authMiddleware, orderController.getMyOrders);
router.get("/my-orders/count", authMiddleware, orderController.getMyActiveOrdersCount);
router.put("/cancel/:orderId", authMiddleware, orderController.cancelOrder);
router.delete("/delete/:orderId", authMiddleware, orderController.deleteOrder);

// Admin
router.get("/", authMiddleware, orderController.getAllOrders);
router.get("/pending/count", authMiddleware, orderController.getPendingOrdersCount);
router.put("/update/:id", authMiddleware, orderController.updateOrderStatus);

module.exports = router;
