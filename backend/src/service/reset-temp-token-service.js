/**
 * 文件功能：密码重置临时令牌（resetTemp）签发与消费
 * 说明：短信校验通过后签发，用于一次性重置密码操作
 */
const jwtUtils = require('../utils/jwt-utils');
const redisUtils = require('../utils/redis-utils');
const { logger, maskSensitive } = require('../utils/logger');
const { RESET_TEMP_EXPIRE, REDIS_KEY_PREFIX } = require('../constants/auth-constants');

async function issueResetTempToken({ phone, requestId }) {
  const tempToken = jwtUtils.generateTempToken(
    { phone, type: 'reset' },
    { expiresIn: RESET_TEMP_EXPIRE },
  );

  const tempKey = `${REDIS_KEY_PREFIX.RESET_TEMP}${phone}`;
  await redisUtils.setExpire(tempKey, tempToken, RESET_TEMP_EXPIRE);

  logger.info({
    module: 'reset-temp-token-service',
    operate: 'issue-reset-temp',
    params: maskSensitive({ phone }),
    result: 'Reset tempToken issued',
    requestId,
  });

  return {
    isValid: true,
    tempToken,
  };
}

async function consumeResetTempToken({ phone, tempToken, requestId }) {
  const tempKey = `${REDIS_KEY_PREFIX.RESET_TEMP}${phone}`;
  const cachedToken = await redisUtils.get(tempKey);

  if (!cachedToken || cachedToken !== tempToken) {
    logger.warn({
      module: 'reset-temp-token-service',
      operate: 'consume-reset-temp',
      params: maskSensitive({ phone }),
      result: 'Invalid or missing reset tempToken',
      requestId,
    });
    const error = new Error('请先完成验证码校验');
    error.statusCode = 400;
    throw error;
  }

  await redisUtils.del(tempKey);

  logger.info({
    module: 'reset-temp-token-service',
    operate: 'consume-reset-temp',
    params: maskSensitive({ phone }),
    result: 'Reset tempToken consumed',
    requestId,
  });
}

module.exports = {
  issueResetTempToken,
  consumeResetTempToken,
};
