/**
 * 文件功能：认证鉴权服务层
 * 关联业务：用户密码登录、三方登录、短信验证、风控检测
 * 说明：封装账号查询、密码校验、令牌签发和登录态更新
 */
const { randomUUID } = require('crypto');
const userDao = require('../dao/user-dao');
const oauthDao = require('../dao/oauth-dao');
const configDao = require('../dao/config-dao');
const riskDao = require('../dao/risk-dao');
const deviceDao = require('../dao/device-dao');
const passwordUtils = require('../utils/password-utils');
const jwtUtils = require('../utils/jwt-utils');
const oauthUtils = require('../utils/oauth-utils');
const smsUtils = require('../utils/sms-utils');
const redisUtils = require('../utils/redis-utils');
const { consumeRegisterTempToken } = require('./register-temp-token-service');
const { consumeResetTempToken, issueResetTempToken } = require('./reset-temp-token-service');
const profileDao = require('../dao/profile-dao');
const maskUtils = require('../utils/mask-utils');
const captchaUtils = require('../utils/captcha-utils');
const riskUtils = require('../utils/risk-utils');
const ipUtils = require('../utils/ip-utils');
const { logger, maskSensitive } = require('../utils/logger');
const {
  TOKEN_EXPIRE_DEFAULT,
  TOKEN_EXPIRE_REMEMBER_ME,
  REFRESH_TOKEN_EXPIRE_DEFAULT,
  REFRESH_TOKEN_EXPIRE_REMEMBER_ME,
  SMS_CODE_LENGTH,
  SMS_CODE_EXPIRE,
  CAPTCHA_EXPIRE,
  CAPTCHA_LENGTH,
  CHALLENGE_TOKEN_EXPIRE,
  SMS_RESEND_INTERVAL,
  SMS_COUNT_THRESHOLD_HIGH,
  SMS_COUNT_THRESHOLD_MEDIUM,
  SMS_COUNT_PERIOD,
  OAUTH_BIND_EXPIRE,
  REDIS_KEY_PREFIX,
} = require('../constants/auth-constants');

function buildUserId() {
  return `u_${randomUUID().replace(/-/g, '')}`;
}

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
    const error = new Error('用户不存在');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await passwordUtils.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('密码错误');
    error.statusCode = 401;
    throw error;
  }

  // 管理员系统规则：禁用用户不可登录
  if (user.status === 'disabled') {
    const error = new Error('账号已被禁用，无法登录');
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    userId: user.userId,
    phone: user.phone,
    role: user.role,
  };

  const expireIn = rememberMe ? TOKEN_EXPIRE_REMEMBER_ME : TOKEN_EXPIRE_DEFAULT;
  const refreshExpireIn = rememberMe ? REFRESH_TOKEN_EXPIRE_REMEMBER_ME : REFRESH_TOKEN_EXPIRE_DEFAULT;

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

/**
 * 函数功能：三方登录核心流程
 * 入参：platform/authCode/requestId
 * 出参：登录响应 data（含 isNewUser 标识）
 */
async function loginBySocial({ platform, authCode, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'login-by-social',
    params: { platform },
    result: 'Start social login process',
    requestId,
  });

  const { openId } = await oauthUtils.exchangeAuthCode({ platform, authCode });
  const bindRecord = await oauthDao.findByOpenId({ platform, openId, requestId });

  if (!bindRecord) {
    // 使用完整 openId + 时间戳 + 随机数生成唯一临时 ID，避免碰撞
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).slice(2, 10);
    const tempUserId = `temp_${platform}_${openId.slice(-16)}_${timestamp}_${randomPart}`;
    const token = jwtUtils.generateToken({ userId: tempUserId, platform, openId, isNewUser: true });

    logger.info({
      module: 'auth-service',
      operate: 'login-by-social',
      params: { platform },
      result: 'New user, temporary ID generated',
      requestId,
    });

    return {
      token,
      userId: tempUserId,
      isNewUser: true,
    };
  }

  // 只有绑定的正式用户才需要检查状态/角色
  const authUser = await userDao.findByUserId(bindRecord.userId, requestId);
  if (!authUser) {
    // 数据不一致：存在绑定记录但找不到对应登录用户，视为服务侧异常
    logger.error({
      module: 'auth-service',
      operate: 'login-by-social',
      requestId,
      params: { platform, userId: bindRecord.userId },
      error: 'auth user not found for existing bind record',
      errorType: 'AuthUserNotFound',
    });
    const error = new Error('登录失败');
    error.statusCode = 500;
    throw error;
  }

  if (authUser.status === 'disabled') {
    const error = new Error('账号已被禁用，无法登录');
    error.statusCode = 401;
    throw error;
  }

  const token = jwtUtils.generateToken({
    userId: bindRecord.userId,
    phone: authUser.phone,
    role: authUser.role,
    platform,
    openId,
    isNewUser: false,
  });

  logger.info({
    module: 'auth-service',
    operate: 'login-by-social',
    params: { platform },
    result: 'Existing user logged in',
    requestId,
  });

  return {
    token,
    userId: bindRecord.userId,
    isNewUser: false,
  };
}

/**
 * 函数功能：发送短信验证码
 * 入参：phone/type/requestId
 * 出参：发送结果（含 resendInterval）
 */
async function sendAuthSms({ phone, type, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'send-auth-sms',
    params: maskSensitive({ phone, type }),
    result: 'Start sending SMS',
    requestId,
  });

  const freqKey = `${REDIS_KEY_PREFIX.SMS_LIMIT}${type}:${phone}`;
  const sentCount = await redisUtils.incrWithExpire(freqKey, SMS_RESEND_INTERVAL);
  if (sentCount > 1) {
    const error = new Error('发送过于频繁，请稍后重试');
    error.statusCode = 429;
    throw error;
  }

  const verifyCode = smsUtils.generateCode(SMS_CODE_LENGTH);
  await redisUtils.setExpire(
    `${REDIS_KEY_PREFIX.SMS_CODE}${type}:${phone}`,
    verifyCode,
    SMS_CODE_EXPIRE,
  );
  await redisUtils.incrWithExpire(`${REDIS_KEY_PREFIX.SMS_TOTAL}${phone}`, SMS_COUNT_PERIOD);
  const smsResult = await smsUtils.sendCode({ phone, code: verifyCode, type, requestId });

  logger.info({
    module: 'auth-service',
    operate: 'send-auth-sms',
    params: maskSensitive({ phone, type }),
    result: 'SMS sent successfully',
    requestId,
  });

  return {
    requestId: smsResult.requestId,
    resendInterval: SMS_RESEND_INTERVAL,
  };
}

/**
 * 函数功能：获取登录页配置
 * 入参：appVersion/platform/requestId
 * 出参：登录配置对象
 */
async function getLoginConfig({ appVersion, platform, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'get-login-config',
    params: { appVersion, platform },
    result: 'Fetching login config',
    requestId,
  });

  const config = await configDao.getLoginConfig({ appVersion, platform, requestId });
  return config;
}

/**
 * 函数功能：获取演示账号列表
 * 入参：requestId
 * 出参：演示账号列表（手机号已脱敏）
 */
async function getDemoAccounts({ requestId }) {
  const env = process.env.NODE_ENV || 'development';
  const demoEnabled = env === 'development' || env === 'test' || process.env.DEMO_MODE === 'true';

  logger.info({
    module: 'auth-service',
    operate: 'get-demo-accounts',
    requestId,
    result: demoEnabled ? 'Demo accounts enabled' : 'Demo accounts disabled',
  });

  if (!demoEnabled) {
    return { demoAccounts: [] };
  }

  const demoAccounts = await configDao.getDemoAccounts();
  return {
    demoAccounts: demoAccounts.map((item) => ({
      phone: maskUtils.maskPhone(item.phone),
      hint: item.hint,
    })),
  };
}

/**
 * 函数功能：生成图形验证码
 * 入参：sessionId/phone/requestId
 * 出参：验证码 ID 和图片 Base64
 */
async function getCaptchaImage({ sessionId, phone, requestId }) {
  const verifyId = `captcha_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const text = captchaUtils.generateText(CAPTCHA_LENGTH);
  const captchaImage = captchaUtils.generateImage(text);

  await redisUtils.setExpire(
    `${REDIS_KEY_PREFIX.CAPTCHA}${verifyId}`,
    {
      text,
      sessionId,
      phone: phone || '',
      failedTimes: 0,
    },
    CAPTCHA_EXPIRE,
  );

  logger.info({
    module: 'auth-service',
    operate: 'get-captcha-image',
    requestId,
    params: { sessionId },
    result: 'Captcha generated',
  });

  return { verifyId, captchaImage };
}

/**
 * 函数功能：行为验证
 * 入参：verifyId/trackData/requestId
 * 出参：challengeToken 和验证状态
 */
async function behaviorVerify({ verifyId, trackData, requestId }) {
  const captchaKey = `${REDIS_KEY_PREFIX.CAPTCHA}${verifyId}`;
  const captchaRecord = await redisUtils.get(captchaKey);
  if (!captchaRecord) {
    const error = new Error('verifyId 不存在或已过期');
    error.statusCode = 400;
    throw error;
  }

  const behavior = riskUtils.analyzeTrackData(trackData);
  const challengeToken = `challenge_${Math.random().toString(36).slice(2, 14)}`;
  await redisUtils.setExpire(
    `${REDIS_KEY_PREFIX.CHALLENGE}${challengeToken}`,
    {
      verifyId,
      score: behavior.score,
      status: behavior.status,
      issuedAt: Date.now(),
    },
    CHALLENGE_TOKEN_EXPIRE,
  );

  logger.info({
    module: 'auth-service',
    operate: 'behavior-verify',
    requestId,
    params: { verifyId },
    result: `Behavior status: ${behavior.status}`,
  });

  return {
    challengeToken,
    status: behavior.status,
  };
}

/**
 * 函数功能：手机号风控检测与注册状态查询
 * 入参：phone/requestId
 * 出参：风险等级、是否高风险、是否已注册、用户状态
 */
async function checkPhoneRisk({ phone, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'check-phone-risk',
    params: maskSensitive({ phone }),
    result: 'Checking phone risk and registration',
    requestId,
  });

  // 检查用户是否存在
  const user = await userDao.findByPhone(phone, requestId);
  const isRegistered = !!user;
  const userStatus = user?.status || 'not_registered';

  // 风控检测
  const inBlacklist = await riskDao.checkPhoneBlacklist(phone, requestId);
  const smsCount = Number((await redisUtils.get(`${REDIS_KEY_PREFIX.SMS_TOTAL}${phone}`)) || 0);
  const hasDeviceRisk = await riskDao.checkPhoneDeviceAbuse(phone, requestId);

  let riskLevel = 'low';
  if (inBlacklist || hasDeviceRisk || smsCount > SMS_COUNT_THRESHOLD_HIGH) {
    riskLevel = 'high';
  } else if (smsCount > SMS_COUNT_THRESHOLD_MEDIUM) {
    riskLevel = 'medium';
  }

  logger.info({
    module: 'auth-service',
    operate: 'check-phone-risk',
    params: maskSensitive({ phone }),
    result: `Risk level: ${riskLevel}, Registered: ${isRegistered}`,
    requestId,
  });

  return {
    isRisk: riskLevel !== 'low',
    riskLevel,
    isRegistered,
    userStatus,
  };
}

/**
 * 函数功能：设备风险评分
 * 入参：deviceInfo/ip/requestId
 * 出参：风险等级和是否需要 MFA
 */
async function deviceScore({ deviceInfo, ip, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'device-score',
    params: { deviceId: deviceInfo?.deviceId, ip },
    result: 'Calculating device score',
    requestId,
  });

  const riskRecord = await deviceDao.findRiskRecord(deviceInfo.deviceId, ip);
  const region = ipUtils.parseRegion(ip);
  const score = riskUtils.calculateDeviceScore({
    deviceInfo,
    riskRecord,
    region,
  });

  const riskLevel = riskUtils.getDeviceRiskLevel(score);

  logger.info({
    module: 'auth-service',
    operate: 'device-score',
    params: { deviceId: deviceInfo?.deviceId },
    result: `Device risk level: ${riskLevel}`,
    requestId,
  });

  return {
    riskLevel,
    needMfa: riskLevel === 'medium' || riskLevel === 'high',
  };
}

/**
 * 函数功能：OAuth 绑定
 * 入参：platform/accessToken/requestId
 * 出参：临时用户 ID 和绑定状态
 */
async function oauthBind({ platform, accessToken, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'oauth-bind',
    params: { platform },
    result: 'Starting OAuth bind',
    requestId,
  });

  const { openId } = await oauthUtils.exchangeAuthCode({ platform, authCode: accessToken });
  const bindRecord = await oauthDao.findByOpenId({ platform, openId, requestId });

  if (bindRecord) {
    const token = jwtUtils.generateToken({
      userId: bindRecord.userId,
      platform,
      openId,
    });

    logger.info({
      module: 'auth-service',
      operate: 'oauth-bind',
      params: { platform },
      result: 'User already bound',
      requestId,
    });

    return {
      tempUserId: bindRecord.userId,
      isBoundPhone: true,
      token,
    };
  }

  // 使用完整 openId + 时间戳 + 随机数生成唯一临时 ID，避免碰撞
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  const tempUserId = `temp_${platform}_${openId.slice(-16)}_${timestamp}_${randomPart}`;
  const token = jwtUtils.generateTempToken({ userId: tempUserId, platform, openId });

  await redisUtils.setExpire(
    `${REDIS_KEY_PREFIX.OAUTH_BIND}${tempUserId}`,
    {
      platform,
      openId,
      createdAt: Date.now(),
    },
    OAUTH_BIND_EXPIRE,
  );

  logger.info({
    module: 'auth-service',
    operate: 'oauth-bind',
    requestId,
    params: { platform },
    result: 'OAuth temporary binding created',
  });

  return {
    tempUserId,
    isBoundPhone: false,
    token,
  };
}

/**
 * 函数功能：用户注册
 * 入参：nickname/phone/password/tempToken/agreeProtocol/requestId
 * 出参：{ userId, accessToken, userInfo }
 */
async function registerUser({ nickname, phone, password, tempToken, agreeProtocol, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'register-user',
    params: maskSensitive({ phone, nickname }),
    result: 'Start user registration',
    requestId,
  });

  // 检查手机号是否已注册
  const existingUser = await userDao.findByPhone(phone, requestId);
  if (existingUser) {
    const error = new Error('该手机号已注册');
    error.statusCode = 409;
    throw error;
  }

  // 检查昵称是否被占用
  const existingNickname = await userDao.findByUserName(nickname, requestId);
  if (existingNickname) {
    const error = new Error('该昵称已被占用');
    error.statusCode = 409;
    throw error;
  }

  await consumeRegisterTempToken({ phone, tempToken, requestId });

  // 对密码进行加盐哈希处理
  const passwordHash = await passwordUtils.hash(password);

  const userId = buildUserId();

  // 创建用户账号
  await userDao.createAuthUser(
    {
      userId,
      phone,
      passwordHash,
      userName: nickname,
      avatarUrl: '',
    },
    requestId,
  );

  // 生成登录态 Token
  const tokenPayload = { userId, phone };
  const accessToken = jwtUtils.generateToken(tokenPayload, { expiresIn: TOKEN_EXPIRE_DEFAULT });
  const refreshToken = jwtUtils.generateRefreshToken(
    { ...tokenPayload, type: 'refresh' },
    { expiresIn: REFRESH_TOKEN_EXPIRE_DEFAULT },
  );

  await redisUtils.setExpire(
    `${REDIS_KEY_PREFIX.REFRESH_TOKEN}${userId}`,
    refreshToken,
    REFRESH_TOKEN_EXPIRE_DEFAULT,
  );

  logger.info({
    module: 'auth-service',
    operate: 'register-user',
    params: maskSensitive({ phone, nickname }),
    result: 'User registered successfully',
    requestId,
  });

  return {
    userId,
    accessToken,
    refreshToken,
    userInfo: {
      nickname,
      avatarUrl: '',
    },
  };
}

/**
 * 函数功能：昵称可用性检测
 * 入参：nickname/requestId
 * 出参：{ isAvailable }
 */
async function checkNickname({ nickname, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'check-nickname',
    params: { nickname },
    result: 'Checking nickname availability',
    requestId,
  });

  const existingUser = await userDao.findByUserName(nickname, requestId);
  const isAvailable = !existingUser;

  logger.info({
    module: 'auth-service',
    operate: 'check-nickname',
    params: { nickname },
    result: isAvailable ? 'Nickname available' : 'Nickname taken',
    requestId,
  });

  return { isAvailable };
}

/**
 * 刷新 Token
 * 使用 refreshToken 换取新的 accessToken
 */
async function refreshToken({ refreshToken, requestId }) {
  logger.info({
    module: 'auth-service',
    operate: 'refresh-token',
    requestId,
    result: 'Start refresh token',
  });

  try {
    // 验证 refreshToken
    const payload = jwtUtils.verifyToken(refreshToken);

    // 检查是否是 refresh token 类型
    if (payload.type !== 'refresh') {
      const error = new Error('无效的刷新令牌');
      error.statusCode = 401;
      throw error;
    }

    // 查找用户确认存在
    const user = await userDao.findById(payload.userId, requestId);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }

    // 生成新的 access token
    const tokenPayload = {
      userId: user.user_id,
      phone: user.phone,
      role: user.role,
    };

    const newToken = jwtUtils.generateToken(tokenPayload, { expiresIn: TOKEN_EXPIRE_DEFAULT });

    logger.info({
      module: 'auth-service',
      operate: 'refresh-token',
      params: { userId: user.user_id },
      requestId,
      result: 'Token refreshed',
    });

    return {
      token: newToken,
      expireIn: TOKEN_EXPIRE_DEFAULT,
    };
  } catch (error) {
    logger.error({
      module: 'auth-service',
      operate: 'refresh-token',
      requestId,
      error: error.message,
      errorType: 'REFRESH_TOKEN_ERROR',
    });
    throw error;
  }
}

module.exports = {
  loginByPassword,
  loginBySocial,
  sendAuthSms,
  getLoginConfig,
  getDemoAccounts,
  getCaptchaImage,
  behaviorVerify,
  checkPhoneRisk,
  deviceScore,
  oauthBind,
  registerUser,
  checkNickname,
  refreshToken,
  // 密码重置
  async resetPassword({ phone, newPassword, tempToken, requestId }) {
    logger.info({
      module: 'auth-service',
      operate: 'reset-password',
      params: maskSensitive({ phone }),
      requestId,
      result: 'Start reset password',
    });

    // 校验临时令牌
    await consumeResetTempToken({ phone, tempToken, requestId });

    // 查找用户
    const user = await userDao.findByPhone(phone, requestId);
    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }

    // 哈希新密码
    const passwordHash = await passwordUtils.hash(newPassword);

    // 更新密码
    await profileDao.updateUserPassword(user.user_id, passwordHash, requestId);

    logger.info({
      module: 'auth-service',
      operate: 'reset-password',
      params: maskSensitive({ phone }),
      requestId,
      result: 'Password updated',
    });

    return { success: true };
  },
};
