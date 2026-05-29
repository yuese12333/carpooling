const express = require('express');
const router = express.Router();
const { getBalanceController } = require('../controller/payments-controller');

const { getPaymentHistoryController, getReceiptController } = require('../controller/payments-controller');

/** GET /api/payments/balance */
router.get('/balance', getBalanceController);

/** GET /api/payments/history */
router.get('/history', getPaymentHistoryController);

/** GET /api/payments/receipts/:paymentId */
router.get('/receipts/:paymentId', getReceiptController);

module.exports = router;
