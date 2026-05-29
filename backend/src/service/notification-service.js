/**
 * 通知服务（最小实现）
 */
const { logger } = require('../utils/logger');
const notificationDao = require('../dao/notification-dao');

async function listNotifications({ userId, page, pageSize, requestId }) {
  logger.info({ module: 'notification-service', operate: 'list-notifications', params: { userId, page, pageSize }, requestId, result: 'Listing notifications' });
  const data = await notificationDao.listNotifications(userId, page, pageSize, requestId);
  return data;
}

async function clearNotifications({ userId, ids, requestId }) {
  logger.info({ module: 'notification-service', operate: 'clear-notifications', params: { userId, idsLength: ids?.length || 0 }, requestId, result: 'Clearing notifications' });
  return notificationDao.clearNotifications(userId, ids || [], requestId);
}

async function createNotification({ userId, title, body, meta, requestId }) {
  logger.info({ module: 'notification-service', operate: 'create-notification', params: { userId, title }, requestId, result: 'Creating notification' });
  return notificationDao.createNotification(userId, title, body, meta, requestId);
}

module.exports = {
  listNotifications,
  clearNotifications,
  createNotification,
};
