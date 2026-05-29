/**
 * 通知控制层
 */
const { createRequestId, buildSuccessResponse, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { listNotifications, clearNotifications } = require('../service/notification-service');

async function listNotificationsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { page = 1, pageSize = 20 } = req.query || {};

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await listNotifications({ userId, page: Number(page), pageSize: Number(pageSize), requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'notification-controller', operate: 'list-notifications', requestId, error: err?.message || '列表失败' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取通知失败', null, requestId));
  }
}

async function clearNotificationsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { ids } = req.body || {};

  try {
    if (!userId) return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    const data = await clearNotifications({ userId, ids, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'notification-controller', operate: 'clear-notifications', requestId, error: err?.message || 'clear failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '清除通知失败', null, requestId));
  }
}

module.exports = {
  listNotificationsController,
  clearNotificationsController,
};
