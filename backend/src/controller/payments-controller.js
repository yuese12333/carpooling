const { createRequestId, buildSuccessResponse, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const {
  getBalance,
  getPaymentHistory,
  getReceipt,
  listPaymentMethods,
  setDefaultPaymentMethod,
  getMonthlyStats,
} = require('../service/payments-service');

async function getBalanceController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await getBalance({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'get-balance', requestId, error: err?.message || 'get balance failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取余额失败', null, requestId));
  }
}

async function getPaymentHistoryController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { page = 1, pageSize = 20 } = req.query || {};

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await getPaymentHistory({ userId, page: Number(page), pageSize: Number(pageSize), requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'get-payment-history', requestId, error: err?.message || 'get payment history failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取支付记录失败', null, requestId));
  }
}

async function getReceiptController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const paymentId = req.params?.paymentId;

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    if (!paymentId) return res.status(400).json(buildFailureResponse(400, 'paymentId 不能为空', null, requestId));
    const data = await getReceipt({ paymentId, requestId });
    if (!data) return res.status(404).json(buildFailureResponse(404, '收据不存在', null, requestId));
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'get-receipt', requestId, error: err?.message || 'get receipt failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取收据失败', null, requestId));
  }
}

async function getPaymentMethodsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await listPaymentMethods({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'list-payment-methods', requestId, error: err?.message || 'list payment methods failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取支付方式失败', null, requestId));
  }
}

async function setDefaultPaymentMethodController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const methodId = req.body?.methodId;

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await setDefaultPaymentMethod({ userId, methodId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'set-default-payment-method', requestId, error: err?.message || 'set default payment method failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '设置默认支付方式失败', null, requestId));
  }
}

async function getMonthlyStatsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const month = req.query?.month;

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await getMonthlyStats({ userId, month, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'payments-controller', operate: 'get-monthly-stats', requestId, error: err?.message || 'get monthly stats failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取月度统计失败', null, requestId));
  }
}

module.exports = { getBalanceController, getPaymentHistoryController, getReceiptController, getPaymentMethodsController, setDefaultPaymentMethodController, getMonthlyStatsController };
