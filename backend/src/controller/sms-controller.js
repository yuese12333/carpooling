/**
 * 文件功能：短信验证码控制层
 * 关联业务：短信验证码发送、短信验证码校验
 * 说明：负责参数接收与校验、调用 service、返回标准响应
 */
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger, maskSensitive } = require('../utils/logger');
const {
  sendVerifyCode,
  checkVerifyCode,
} = require('../service/aliyun-sms-service');
const { issueRegisterTempToken } = require('../service/register-temp-token-service');
const { validatePhone } = require('../constants/auth-constants');

/**
 * 函数功能：处理“发送短信验证码”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应（code/message/data/requestId）
 * 异常场景：参数缺失或三方服务失败时返回 4xx/5xx
 */
async function sendVerifyCodeController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const {
      phoneNumber,
      signName,
      templateCode,
      templateParam,
      schemeName,
      validTime,
      interval,
      codeLength,
      codeType,
      duplicatePolicy,
      outId,
      returnVerifyCode,
      smsUpExtendCode,
    } = req.body || {};

    if (!phoneNumber) {
      logger.warn({
        module: 'sms-controller',
        operate: 'send-verify-code',
        params: maskSensitive({ phoneNumber }),
        result: '缺少必要参数 phoneNumber',
        requestId,
      });
      return res.status(400).json(
        buildFailureResponse(400, '缺少必要参数：phoneNumber', null, requestId),
      );
    }

    const data = await sendVerifyCode({
      phoneNumber,
      signName,
      templateCode,
      templateParam,
      schemeName,
      validTime,
      interval,
      codeLength,
      codeType,
      duplicatePolicy,
      outId,
      returnVerifyCode:
        returnVerifyCode !== undefined
          ? returnVerifyCode
          : process.env.NODE_ENV !== 'production',
      smsUpExtendCode,
    });

    // 发送失败时不返回 verifyCode，避免验证码被误暴露给前端
    if (!data?.success) {
      logger.warn({
        module: 'sms-controller',
        operate: 'send-verify-code',
        params: maskSensitive({ phoneNumber }),
        result: data?.aliyunMessage || '短信发送失败',
        requestId,
      });
      return res.status(500).json(
        buildFailureResponse(
          500,
          data?.aliyunMessage || '短信发送失败',
          {
            success: data?.success,
            aliyunCode: data?.aliyunCode,
            aliyunMessage: data?.aliyunMessage,
            accessDeniedDetail: data?.accessDeniedDetail,
            requestId: data?.requestId,
          },
          requestId,
        ),
      );
    }

    // 生产环境默认不把验证码回传给前端（联调可设 ALLOW_RETURN_VERIFY_CODE=true）
    const dataForClient = { ...data };
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_RETURN_VERIFY_CODE !== 'true'
    ) {
      delete dataForClient.verifyCode;
    }

    logger.info({
      module: 'sms-controller',
      operate: 'send-verify-code',
      params: maskSensitive({ phoneNumber }),
      result: 'SMS sent successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(dataForClient, requestId));
  } catch (err) {
    const message =
      process.env.NODE_ENV === 'production'
        ? '短信发送失败'
        : err?.message || '短信发送失败';
    logger.error({
      module: 'sms-controller',
      operate: 'send-verify-code',
      params: maskSensitive({ phoneNumber: req.body?.phoneNumber }),
      error: message,
      errorType: err?.name || 'SmsServiceError',
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, message, null, requestId));
  }
}

/**
 * 函数功能：处理“校验短信验证码”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应（code/message/data/requestId）
 * 异常场景：参数缺失或三方服务失败时返回 4xx/5xx
 */
async function checkVerifyCodeController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const { phoneNumber, verifyCode, schemeName, caseAuthPolicy, outId } = req.body || {};

    const phoneValidation = validatePhone(phoneNumber);
    if (!phoneValidation.valid) {
      logger.warn({
        module: 'sms-controller',
        operate: 'check-verify-code',
        params: maskSensitive({ phone: phoneNumber }),
        result: phoneValidation.error,
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, phoneValidation.error, null, requestId));
    }

    if (!verifyCode || typeof verifyCode !== 'string' || verifyCode.length !== 6) {
      logger.warn({
        module: 'sms-controller',
        operate: 'check-verify-code',
        params: maskSensitive({ phone: phoneNumber }),
        result: '验证码必须为 6 位',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '验证码必须为 6 位', null, requestId));
    }

    const data = await checkVerifyCode({
      phoneNumber,
      verifyCode,
      schemeName,
      caseAuthPolicy,
      outId,
    });

    if (!data?.success) {
      logger.warn({
        module: 'sms-controller',
        operate: 'check-verify-code',
        params: maskSensitive({ phoneNumber }),
        result: data?.aliyunMessage || '短信校验失败',
        requestId,
      });
      return res.status(400).json(
        buildFailureResponse(400, data?.aliyunMessage || '验证码校验失败', {
          success: data?.success,
          verifyResult: data?.verifyResult,
          aliyunCode: data?.aliyunCode,
          aliyunMessage: data?.aliyunMessage,
          requestId: data?.requestId,
        }, requestId),
      );
    }

    if (data.verifyResult && data.verifyResult !== 'PASS') {
      logger.warn({
        module: 'sms-controller',
        operate: 'check-verify-code',
        params: maskSensitive({ phoneNumber }),
        result: '验证码错误',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '验证码错误', null, requestId));
    }

    const tokenData = await issueRegisterTempToken({ phone: phoneNumber, requestId });

    logger.info({
      module: 'sms-controller',
      operate: 'check-verify-code',
      params: maskSensitive({ phoneNumber }),
      result: 'Code verified and tempToken issued',
      requestId,
    });

    return res.json(buildSuccessResponse({ ...data, ...tokenData }, requestId));
  } catch (err) {
    const message =
      process.env.NODE_ENV === 'production'
        ? '短信校验失败'
        : err?.message || '短信校验失败';
    logger.error({
      module: 'sms-controller',
      operate: 'check-verify-code',
      params: maskSensitive({ phoneNumber: req.body?.phoneNumber }),
      error: message,
      errorType: err?.name || 'SmsServiceError',
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, message, null, requestId));
  }
}

module.exports = {
  sendVerifyCodeController,
  checkVerifyCodeController,
};

