/**
 * 文件功能：认证鉴权控制层
 * 关联业务：用户密码登录
 * 说明：负责参数校验、调用 service、返回标准响应
 */
const { loginByPassword } = require('../service/auth-service');
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger, maskSensitive } = require('../utils/logger');

const CHINA_MAINLAND_PHONE_REGEX = /^1\d{10}$/;

/**
 * 函数功能：处理“用户密码登录”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function loginByPasswordController(req, res) {
  const requestId = createRequestId();
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

module.exports = {
  loginByPasswordController,
};
