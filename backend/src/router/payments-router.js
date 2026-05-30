const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const { getBalanceController, getPaymentHistoryController, getReceiptController } = require('../controller/payments-controller');

/** GET /api/payments/balance */
router.get('/balance', authMiddleware, getBalanceController);

/** GET /api/payments/history */
router.get('/history', authMiddleware, getPaymentHistoryController);

/** GET /api/payments/receipts/:paymentId */
router.get('/receipts/:paymentId', authMiddleware, getReceiptController);

module.exports = router;
