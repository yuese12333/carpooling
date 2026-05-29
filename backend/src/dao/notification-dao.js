/**
 * 通知数据访问层（最小实现）
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

async function listNotifications(userId, page = 1, pageSize = 20, requestId) {
  try {
    const where = { user_id: userId };
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  } catch (error) {
    logger.error({
      module: 'notification-dao',
      operate: 'list-notifications',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

async function clearNotifications(userId, ids = [], requestId) {
  try {
    if (ids && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { user_id: userId, notification_id: { in: ids } },
        data: { read: true, read_at: new Date() },
      });
    } else {
      await prisma.notification.updateMany({
        where: { user_id: userId, read: false },
        data: { read: true, read_at: new Date() },
      });
    }

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'notification-dao',
      operate: 'clear-notifications',
      params: { userId, idsLength: ids?.length || 0 },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

async function createNotification(userId, title, body, meta = {}, requestId) {
  try {
    const record = await prisma.notification.create({
      data: {
        notification_id: `n_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        user_id: userId,
        title,
        body,
        meta_json: meta,
        read: false,
      },
    });

    return record;
  } catch (error) {
    logger.error({
      module: 'notification-dao',
      operate: 'create-notification',
      params: { userId, title },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  listNotifications,
  clearNotifications,
  createNotification,
};
