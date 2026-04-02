const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, wishlistController.getWishlist);
router.post("/add", authMiddleware, wishlistController.addToWishlist);
router.delete("/remove/:productId", authMiddleware, wishlistController.removeFromWishlist);
router.get("/check/:productId", authMiddleware, wishlistController.checkWishlist);
router.delete("/clear", authMiddleware, wishlistController.clearWishlist);

module.exports = router;
