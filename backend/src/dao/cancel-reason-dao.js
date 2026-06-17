/**
 * 文件功能：取消原因数据访问层
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 获取取消原因列表
 * @param {string} type - 类型：driver/passenger
 * @param {string} requestId - 请求ID
 */
async function getCancelReasons(type, requestId) {
  try {
    const reasons = await prisma.cancelReason.findMany({
      where: {
        type,
        status: 'enabled',
      },
      orderBy: { sort_order: 'asc' },
    });

    return reasons;
  } catch (error) {
    logger.error({
      module: 'cancel-reason-dao',
      operate: 'get-cancel-reasons',
      params: { type },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

module.exports = { getCancelReasons };
