/**
 * 文件功能：认证鉴权控制层
 * 关联业务：用户密码登录
 * 说明：负责参数校验、调用 service、返回标准响应
 */
const {
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
} = require('../service/auth-service');
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger, maskSensitive } = require('../utils/logger');

const CHINA_MAINLAND_PHONE_REGEX = /^1\d{10}$/;
const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const SOCIAL_PLATFORM_SET = new Set(['wechat', 'qq', 'apple']);
const SMS_TYPE_SET = new Set(['login', 'register', 'reset_pwd']);
const CLIENT_PLATFORM_SET = new Set(['ios', 'android', 'web']);

/**
 * 函数功能：处理“用户密码登录”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function loginByPasswordController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { phone, password, rememberMe } = req.body || {};

  try {
    if (!phone || typeof phone !== 'string' || !CHINA_MAINLAND_PHONE_REGEX.test(phone)) {
      logger.warn({
        module: 'auth-controller',
        operate: 'login-by-password',
        params: maskSensitive({ phone }),
        result: '手机号格式不正确',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '手机号格式不正确', null, requestId));
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      logger.warn({
        module: 'auth-controller',
        operate: 'login-by-password',
        params: maskSensitive({ phone }),
        result: '密码不能为空',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '密码不能为空', null, requestId));
    }

    if (rememberMe !== undefined && typeof rememberMe !== 'boolean') {
      logger.warn({
        module: 'auth-controller',
        operate: 'login-by-password',
        params: maskSensitive({ phone }),
        result: 'rememberMe 必须为布尔值',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, 'rememberMe 必须为布尔值', null, requestId));
    }

    const data = await loginByPassword({
      phone,
      password,
      rememberMe: Boolean(rememberMe),
      deviceInfo: {
        userAgent: req.get('user-agent') || '',
        deviceId: req.get('x-device-id') || '',
      },
      requestId,
    });

    logger.info({
      module: 'auth-controller',
      operate: 'login-by-password',
      params: maskSensitive({ phone, rememberMe }),
      result: 'Login successful',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    const status = error?.statusCode || 500;
    const message =
      status === 401
        ? error?.message || '手机号或密码错误'
        : process.env.NODE_ENV === 'production'
          ? '登录失败'
          : error?.message || '登录失败';

    const logPayload = {
      module: 'auth-controller',
      operate: 'login-by-password',
      params: maskSensitive({ phone }),
      requestId,
    };
    if (status === 401) {
      logger.warn({
        ...logPayload,
        result: message,
      });
    } else {
      logger.error({
        ...logPayload,
        error: message,
        errorType: error?.name || 'UnknownError',
      });
    }

    return res.status(status).json(buildFailureResponse(status, message, null, requestId));
  }
}

async function loginBySocialController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { platform, authCode } = req.body || {};

  try {
    if (!platform || typeof platform !== 'string' || !SOCIAL_PLATFORM_SET.has(platform)) {
      return res
        .status(400)
        .json(buildFailureResponse(400, 'platform 必须为 wechat/qq/apple', null, requestId));
    }

    if (!authCode || typeof authCode !== 'string' || !authCode.trim()) {
      return res.status(400).json(buildFailureResponse(400, 'authCode 不能为空', null, requestId));
    }

    const data = await loginBySocial({ platform, authCode, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    logger.error({
      module: 'auth-controller',
      operate: 'login-by-social',
      params: { platform },
      requestId,
      error: error?.message || '三方登录失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '三方登录失败', null, requestId));
  }
}

async function sendAuthSmsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { phone, type } = req.body || {};

  try {
    if (!phone || typeof phone !== 'string' || !CHINA_MAINLAND_PHONE_REGEX.test(phone)) {
      return res.status(400).json(buildFailureResponse(400, '手机号格式不正确', null, requestId));
    }
    if (!type || typeof type !== 'string' || !SMS_TYPE_SET.has(type)) {
      return res
        .status(400)
        .json(buildFailureResponse(400, 'type 必须为 login/register/reset_pwd', null, requestId));
    }

    const data = await sendAuthSms({ phone, type, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '发送验证码失败', null, requestId));
  }
}

async function getLoginConfigController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { appVersion, platform } = req.query || {};

  try {
    if (platform && (typeof platform !== 'string' || !CLIENT_PLATFORM_SET.has(platform))) {
      return res
        .status(400)
        .json(buildFailureResponse(400, 'platform 必须为 ios/android/web', null, requestId));
    }

    const data = await getLoginConfig({ appVersion, platform, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取配置失败', null, requestId));
  }
}

async function getDemoAccountsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const data = await getDemoAccounts({ requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '获取演示账号失败', null, requestId));
  }
}

async function getCaptchaImageController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { sessionId, phone } = req.query || {};

  try {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      return res.status(400).json(buildFailureResponse(400, 'sessionId 不能为空', null, requestId));
    }

    if (phone && (typeof phone !== 'string' || !CHINA_MAINLAND_PHONE_REGEX.test(phone))) {
      return res.status(400).json(buildFailureResponse(400, '手机号格式不正确', null, requestId));
    }

    const data = await getCaptchaImage({ sessionId, phone, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '下发图形验证码失败', null, requestId));
  }
}

async function behaviorVerifyController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { verifyId, trackData } = req.body || {};

  try {
    if (!verifyId || typeof verifyId !== 'string' || !verifyId.trim()) {
      return res.status(400).json(buildFailureResponse(400, 'verifyId 不能为空', null, requestId));
    }
    if (!trackData || typeof trackData !== 'object' || Array.isArray(trackData)) {
      return res.status(400).json(buildFailureResponse(400, 'trackData 必须为对象', null, requestId));
    }

    const data = await behaviorVerify({ verifyId, trackData, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '行为验签失败', null, requestId));
  }
}

async function checkPhoneRiskController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { phoneNumber } = req.body || {};

  try {
    if (!phoneNumber || typeof phoneNumber !== 'string' || !CHINA_MAINLAND_PHONE_REGEX.test(phoneNumber)) {
      return res.status(400).json(buildFailureResponse(400, '手机号格式不正确', null, requestId));
    }

    const data = await checkPhoneRisk({ phoneNumber, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '手机号风控检测失败', null, requestId));
  }
}

async function deviceScoreController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { deviceInfo, ip } = req.body || {};

  try {
    if (!deviceInfo || typeof deviceInfo !== 'object' || Array.isArray(deviceInfo)) {
      return res.status(400).json(buildFailureResponse(400, 'deviceInfo 必须为对象', null, requestId));
    }
    if (!ip || typeof ip !== 'string' || !IPV4_REGEX.test(ip)) {
      return res.status(400).json(buildFailureResponse(400, 'IP 格式不合法', null, requestId));
    }

    const data = await deviceScore({ deviceInfo, ip, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || '设备风险评级失败', null, requestId));
  }
}

async function oauthBindController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { platform, accessToken } = req.body || {};

  try {
    if (!platform || typeof platform !== 'string' || !SOCIAL_PLATFORM_SET.has(platform)) {
      return res
        .status(400)
        .json(buildFailureResponse(400, 'platform 必须为 wechat/qq/apple', null, requestId));
    }

    if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
      return res.status(400).json(buildFailureResponse(400, 'accessToken 不能为空', null, requestId));
    }

    const data = await oauthBind({ platform, accessToken, requestId });
    return res.json({ code: 200, message: 'success', data });
  } catch (error) {
    logger.error({
      module: 'auth-controller',
      operate: 'oauth-bind',
      params: { platform },
      requestId,
      error: error?.message || 'OAuth 绑定失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res
      .status(status)
      .json(buildFailureResponse(status, error?.message || 'OAuth 绑定失败', null, requestId));
  }
}

module.exports = {
  loginByPasswordController,
  loginBySocialController,
  sendAuthSmsController,
  getLoginConfigController,
  getDemoAccountsController,
  getCaptchaImageController,
  behaviorVerifyController,
  checkPhoneRiskController,
  deviceScoreController,
  oauthBindController,
};
