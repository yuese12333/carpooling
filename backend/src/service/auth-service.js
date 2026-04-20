/**
 * 文件功能：认证鉴权服务层
 * 关联业务：用户密码登录
 * 说明：封装账号查询、密码校验、令牌签发和登录态更新
 */
const userDao = require('../dao/user-dao');
const passwordUtils = require('../utils/password-utils');
const jwtUtils = require('../utils/jwt-utils');
const { logger, maskSensitive } = require('../utils/logger');

/**
 * 函数功能：密码登录核心流程
 * 入参：phone/password/rememberMe/deviceInfo/requestId
 * 出参：登录响应 data
 */
async function loginByPassword({ phone, password, rememberMe, deviceInfo, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'login-by-password',
    params: maskSensitive({ phone, rememberMe }),
    result: 'Start login process',
    requestId,
  });

  const user = await userDao.findByPhone(phone, requestId);

  if (!user) {
    logger.warn({
      module: 'auth-service',
      operate: 'login-by-password',
      params: maskSensitive({ phone }),
      result: '用户不存在',
      requestId,
    });
    const error = new Error('用户不存在');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await passwordUtils.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    logger.warn({
      module: 'auth-service',
      operate: 'login-by-password',
      params: maskSensitive({ phone }),
      result: '密码错误',
      requestId,
    });
    const error = new Error('密码错误');
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    userId: user.userId,
    phone: user.phone,
  };

  const expireIn = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
  const refreshExpireIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

  const token = jwtUtils.generateToken(tokenPayload, { expiresIn: expireIn });
  const refreshToken = jwtUtils.generateRefreshToken(
    { ...tokenPayload, type: 'refresh' },
    { expiresIn: refreshExpireIn },
  );

  logger.info({
    module: 'auth-service',
    operate: 'login-by-password',
    params: maskSensitive({ phone }),
    result: 'access/refresh 令牌已签发',
    requestId,
  });

  await userDao.updateLastLoginInfo(
    user.userId,
    {
      // DATETIME 字段直接使用 Date 对象，避免 ISO 字符串写入报错
      lastLoginAt: new Date(),
      deviceInfo,
    },
    requestId,
  );

  return {
    token,
    refreshToken,
    userId: user.userId,
    userName: user.userName,
    avatarUrl: user.avatarUrl || '',
    expireIn,
  };
}

module.exports = {
  loginByPassword,
};
