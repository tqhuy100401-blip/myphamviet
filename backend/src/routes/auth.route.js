const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { registerValidation, loginValidation } = require("../middlewares/validation.middleware");

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/profile", authMiddleware, authController.getProfile);

// OTP Routes
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
