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
const {
  sendVerifyCode,
  checkVerifyCode,
} = require('../service/aliyun-sms-service');

/**
 * 函数功能：处理“发送短信验证码”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应（code/message/data/requestId）
 * 异常场景：参数缺失或三方服务失败时返回 4xx/5xx
 */
async function sendVerifyCodeController(req, res) {
  const requestId = createRequestId();

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

    if (!phoneNumber || !signName || !templateCode || !templateParam) {
      return res.status(400).json(
        buildFailureResponse(
          400,
          '缺少必要参数：phoneNumber、signName、templateCode、templateParam',
          null,
          requestId,
        ),
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
      returnVerifyCode,
      smsUpExtendCode,
    });

    // 发送失败时不返回 verifyCode，避免验证码被误暴露给前端
    if (!data?.success) {
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

    return res.json(buildSuccessResponse(dataForClient, requestId));
  } catch (err) {
    const message =
      process.env.NODE_ENV === 'production'
        ? '短信发送失败'
        : err?.message || '短信发送失败';
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
  const requestId = createRequestId();

  try {
    const { phoneNumber, verifyCode, schemeName, caseAuthPolicy, outId } = req.body || {};

    if (!phoneNumber || !verifyCode) {
      return res.status(400).json(
        buildFailureResponse(400, '缺少必要参数：phoneNumber、verifyCode', null, requestId),
      );
    }

    const data = await checkVerifyCode({
      phoneNumber,
      verifyCode,
      schemeName,
      caseAuthPolicy,
      outId,
    });

    if (!data?.success) {
      return res.status(500).json(
        buildFailureResponse(
          500,
          data?.aliyunMessage || '短信校验失败',
          {
            success: data?.success,
            verifyResult: data?.verifyResult,
            aliyunCode: data?.aliyunCode,
            aliyunMessage: data?.aliyunMessage,
            requestId: data?.requestId,
          },
          requestId,
        ),
      );
    }

    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    const message =
      process.env.NODE_ENV === 'production'
        ? '短信校验失败'
        : err?.message || '短信校验失败';
    return res.status(500).json(buildFailureResponse(500, message, null, requestId));
  }
}

module.exports = {
  sendVerifyCodeController,
  checkVerifyCodeController,
};

