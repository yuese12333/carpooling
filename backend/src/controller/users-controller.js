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
    const data = await initUsersSchema();
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

    if (!phone || !nickname) {
      return res
        .status(400)
        .json(buildFailureResponse(400, '缺少必要参数：phone、nickname', null, requestId));
    }

    const result = await registerUser({ phone, nickname });

    logger.info({
      module: 'users-controller',
      operate: 'create-user',
      requestId,
      params: maskSensitive({ phone, nickname }),
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
