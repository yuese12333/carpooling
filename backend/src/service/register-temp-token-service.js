/**
 * 文件功能：注册流程临时令牌（tempToken）签发与消费
 * 关联业务：短信验码通过后签发、注册提交时校验
 */
const jwtUtils = require('../utils/jwt-utils');
const redisUtils = require('../utils/redis-utils');
const { logger, maskSensitive } = require('../utils/logger');
const { REGISTER_TEMP_EXPIRE, REDIS_KEY_PREFIX } = require('../constants/auth-constants');

/**
 * 函数功能：签发注册用临时令牌并写入 Redis
 * 入参：phone/requestId
 * 出参：{ isValid, tempToken }
 */
async function issueRegisterTempToken({ phone, requestId }) {
  const tempToken = jwtUtils.generateTempToken(
    { phone, type: 'register' },
    { expiresIn: REGISTER_TEMP_EXPIRE },
  );

  const tempKey = `${REDIS_KEY_PREFIX.REGISTER_TEMP}${phone}`;
  await redisUtils.setExpire(tempKey, tempToken, REGISTER_TEMP_EXPIRE);

  logger.info({
    module: 'register-temp-token-service',
    operate: 'issue-register-temp',
    params: maskSensitive({ phone }),
    result: 'Register tempToken issued',
    requestId,
  });

  return {
    isValid: true,
    tempToken,
  };
}

/**
 * 函数功能：校验并一次性消费注册临时令牌
 * 入参：phone/tempToken/requestId
 * 出参：void（失败抛错）
 */
async function consumeRegisterTempToken({ phone, tempToken, requestId }) {
  const tempKey = `${REDIS_KEY_PREFIX.REGISTER_TEMP}${phone}`;
  const cachedToken = await redisUtils.get(tempKey);

  if (!cachedToken || cachedToken !== tempToken) {
    logger.warn({
      module: 'register-temp-token-service',
      operate: 'consume-register-temp',
      params: maskSensitive({ phone }),
      result: 'Invalid or missing tempToken',
      requestId,
    });
    const error = new Error('请先完成验证码校验');
    error.statusCode = 400;
    throw error;
  }

  await redisUtils.del(tempKey);

  logger.info({
    module: 'register-temp-token-service',
    operate: 'consume-register-temp',
    params: maskSensitive({ phone }),
    result: 'Register tempToken consumed',
    requestId,
  });
}

module.exports = {
  issueRegisterTempToken,
  consumeRegisterTempToken,
};
