/**
 * 文件功能：认证鉴权服务层
 * 关联业务：用户密码登录
 * 说明：封装账号查询、密码校验、令牌签发和登录态更新
 */
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
const maskUtils = require('../utils/mask-utils');
const captchaUtils = require('../utils/captcha-utils');
const riskUtils = require('../utils/risk-utils');
const ipUtils = require('../utils/ip-utils');
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

async function loginBySocial({ platform, authCode, requestId }) {
  const { openId } = await oauthUtils.exchangeAuthCode({ platform, authCode });
  const bindRecord = await oauthDao.findByOpenId({ platform, openId, requestId });

  if (!bindRecord) {
    const tempUserId = `temp_${platform}_${openId.slice(-8)}`;
    const token = jwtUtils.generateToken({ userId: tempUserId, platform, openId, isNewUser: true });
    return {
      token,
      userId: tempUserId,
      isNewUser: true,
    };
  }

  const token = jwtUtils.generateToken({
    userId: bindRecord.userId,
    platform,
    openId,
    isNewUser: false,
  });
  return {
    token,
    userId: bindRecord.userId,
    isNewUser: false,
  };
}

async function sendAuthSms({ phone, type, requestId }) {
  const resendInterval = 60;
  const freqKey = `sms_limit:${type}:${phone}`;
  const sentCount = await redisUtils.incrWithExpire(freqKey, resendInterval);
  if (sentCount > 1) {
    const error = new Error('发送过于频繁，请稍后重试');
    error.statusCode = 429;
    throw error;
  }

  const verifyCode = smsUtils.generateCode(6);
  await redisUtils.setExpire(`sms_code:${type}:${phone}`, verifyCode, 5 * 60);
  await redisUtils.incrWithExpire(`sms_total:${phone}`, 24 * 60 * 60);
  const smsResult = await smsUtils.sendCode({ phone, code: verifyCode, type, requestId });

  return {
    requestId: smsResult.requestId,
    resendInterval,
  };
}

async function getLoginConfig({ appVersion, platform }) {
  const config = await configDao.getLoginConfig({ appVersion, platform });
  return config;
}

async function getDemoAccounts({ requestId }) {
  const env = process.env.NODE_ENV || 'development';
  const demoEnabled = env === 'development' || env === 'test' || process.env.DEMO_MODE === 'true';
  if (!demoEnabled) {
    logger.info({
      module: 'auth-service',
      operate: 'get-demo-accounts',
      requestId,
      result: 'Demo accounts disabled in current environment',
    });
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

async function getCaptchaImage({ sessionId, phone, requestId }) {
  const verifyId = `captcha_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const text = captchaUtils.generateText(4);
  const captchaImage = captchaUtils.generateImage(text);

  await redisUtils.setExpire(
    `captcha:${verifyId}`,
    {
      text,
      sessionId,
      phone: phone || '',
      failedTimes: 0,
    },
    5 * 60,
  );

  logger.info({
    module: 'auth-service',
    operate: 'get-captcha-image',
    requestId,
    result: 'Captcha generated',
  });

  return { verifyId, captchaImage };
}

async function behaviorVerify({ verifyId, trackData, requestId }) {
  const captchaKey = `captcha:${verifyId}`;
  const captchaRecord = await redisUtils.get(captchaKey);
  if (!captchaRecord) {
    const error = new Error('verifyId 不存在或已过期');
    error.statusCode = 400;
    throw error;
  }

  const behavior = riskUtils.analyzeTrackData(trackData);
  const challengeToken = `challenge_${Math.random().toString(36).slice(2, 14)}`;
  await redisUtils.setExpire(
    `challenge:${challengeToken}`,
    {
      verifyId,
      score: behavior.score,
      status: behavior.status,
      issuedAt: Date.now(),
    },
    10 * 60,
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

async function checkPhoneRisk({ phoneNumber }) {
  const inBlacklist = await riskDao.checkPhoneBlacklist(phoneNumber);
  const smsCount = Number((await redisUtils.get(`sms_total:${phoneNumber}`)) || 0);
  const hasDeviceRisk = await riskDao.checkPhoneDeviceAbuse(phoneNumber);

  let riskLevel = 'low';
  if (inBlacklist || hasDeviceRisk || smsCount > 10) {
    riskLevel = 'high';
  } else if (smsCount > 5) {
    riskLevel = 'medium';
  }

  return {
    isRisk: riskLevel !== 'low',
    riskLevel,
  };
}

async function deviceScore({ deviceInfo, ip }) {
  const riskRecord = await deviceDao.findRiskRecord(deviceInfo.deviceId, ip);
  const region = ipUtils.parseRegion(ip);
  const score = riskUtils.calculateDeviceScore({
    deviceInfo,
    riskRecord,
    region,
  });

  const riskLevel = riskUtils.getDeviceRiskLevel(score);
  return {
    riskLevel,
    needMfa: riskLevel === 'medium' || riskLevel === 'high',
  };
}

async function oauthBind({ platform, accessToken, requestId }) {
  const { openId } = await oauthUtils.exchangeAuthCode({ platform, authCode: accessToken });
  const bindRecord = await oauthDao.findByOpenId({ platform, openId, requestId });

  if (bindRecord) {
    const token = jwtUtils.generateToken({
      userId: bindRecord.userId,
      platform,
      openId,
    });
    return {
      tempUserId: bindRecord.userId,
      isBoundPhone: true,
      token,
    };
  }

  const tempUserId = `temp_${platform}_${openId.slice(-8)}`;
  const token = jwtUtils.generateTempToken({ userId: tempUserId, platform, openId });

  await redisUtils.setExpire(
    `oauth_bind:${tempUserId}`,
    {
      platform,
      openId,
      createdAt: Date.now(),
    },
    30 * 60,
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
};
