/**
 * 隐私电话占位服务
 * 返回映射的 proxyNumber 或 null（表示未接入隐私号服务）
 */
const { logger } = require('../utils/logger');

async function getProxyNumberForPair({ callerUserId, calleeUserId, tripId, requestId }) {
  try {
    // 最小实现：不接入真实隐私号服务，返回 null 表示前端应使用脱敏手机号
    // 如果需要模拟代理号码，可返回一个固定占位号，例如 '400-000-0000'
    return null;
  } catch (error) {
    logger.error({ module: 'privacy-service', operate: 'get-proxy-number', params: { callerUserId, calleeUserId, tripId }, requestId, error: error.message });
    return null;
  }
}

module.exports = {
  getProxyNumberForPair,
};
