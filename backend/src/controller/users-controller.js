/**
 * 文件功能：用户控制层
 * 关联业务：数据库建表初始化与用户最小创建接口
 */
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger, maskSensitive } = require('../utils/logger');
const { initUsersSchema, registerUser } = require('../service/users-service');

async function initUsersSchemaController(req, res) {
  const requestId = createRequestId();

  try {
    const data = await initUsersSchema(requestId);
    logger.info({
      module: 'users-controller',
      operate: 'init-users-schema',
      requestId,
      result: 'Users schema initialized',
    });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'users-controller',
      operate: 'init-users-schema',
      requestId,
      error: error.message,
      errorType: 'DatabaseSchemaInitError',
    });
    return res.status(500).json(buildFailureResponse(500, '初始化用户表失败', null, requestId));
  }
}

async function createUserController(req, res) {
  const requestId = createRequestId();

  try {
    const { phone, nickname } = req.body || {};

    // 参数必填性校验
    if (!phone || !nickname) {
      return res
        .status(400)
        .json(buildFailureResponse(400, '缺少必要参数：phone、nickname', null, requestId));
    }

    // 参数类型校验
    if (typeof phone !== 'string' || typeof nickname !== 'string') {
      return res
        .status(400)
        .json(buildFailureResponse(400, '参数类型错误：phone和nickname必须为字符串', null, requestId));
    }

    const normalizedPhone = phone.trim();
    const normalizedNickname = nickname.trim();

    if (!normalizedPhone || !normalizedNickname) {
      return res
        .status(400)
        .json(buildFailureResponse(400, '参数不能为空白字符', null, requestId));
    }

    // 手机号格式校验（11位数字）
    const phoneRegex = /^1\d{10}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return res
        .status(400)
        .json(buildFailureResponse(400, '手机号格式错误，必须为11位数字', null, requestId));
    }

    // 昵称长度校验（1-50字符）
    if (normalizedNickname.length < 1 || normalizedNickname.length > 50) {
      return res
        .status(400)
        .json(buildFailureResponse(400, '昵称长度必须在1-50个字符之间', null, requestId));
    }

    const result = await registerUser(
      { phone: normalizedPhone, nickname: normalizedNickname },
      requestId,
    );

    logger.info({
      module: 'users-controller',
      operate: 'create-user',
      requestId,
      params: maskSensitive({ phone: normalizedPhone, nickname: normalizedNickname }),
      result: result.created ? 'User created' : 'User already exists',
    });

    if (!result.created) {
      return res.status(409).json(
        buildFailureResponse(
          409,
          '手机号已存在',
          {
            reason: result.reason,
            user: result.user,
          },
          requestId,
        ),
      );
    }

    return res.status(201).json(buildSuccessResponse(result, requestId));
  } catch (error) {
    logger.error({
      module: 'users-controller',
      operate: 'create-user',
      requestId,
      error: error.message,
      errorType: 'UserCreateError',
    });

    return res.status(500).json(buildFailureResponse(500, '创建用户失败', null, requestId));
  }
}

module.exports = {
  initUsersSchemaController,
  createUserController,
};
