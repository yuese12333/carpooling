const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const {
  getBalanceController,
  getPaymentHistoryController,
  getReceiptController,
  getPaymentMethodsController,
  setDefaultPaymentMethodController,
  getMonthlyStatsController,
} = require('../controller/payments-controller');

/** GET /api/payments/balance */
router.get('/balance', authMiddleware, getBalanceController);

/** GET /api/payments/history */
router.get('/history', authMiddleware, getPaymentHistoryController);

/** GET /api/payments/methods */
router.get('/methods', authMiddleware, getPaymentMethodsController);

/** POST /api/payments/methods/default */
router.post('/methods/default', authMiddleware, setDefaultPaymentMethodController);

/** GET /api/payments/stats/monthly?month=YYYY-MM */
router.get('/stats/monthly', authMiddleware, getMonthlyStatsController);

/** GET /api/payments/receipts/:paymentId */
router.get('/receipts/:paymentId', authMiddleware, getReceiptController);

module.exports = router;
