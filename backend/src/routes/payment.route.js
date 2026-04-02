const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Bank Transfer routes
router.post('/bank-transfer/create', authMiddleware, paymentController.createBankTransfer);
router.post('/bank-transfer/confirm', authMiddleware, paymentController.confirmBankTransfer);

module.exports = router;
