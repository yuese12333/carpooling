/**
 * 文件功能：用户业务服务层
 * 关联业务：用户数据初始化与最小注册能力
 */
const {
  ensureUsersTable,
  createUser,
  findUserByPhone,
} = require('../dao/users-dao');
const { logger } = require('../utils/logger');

async function initUsersSchema(requestId) {
  try {
    await ensureUsersTable(requestId);

    return { initialized: true };
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'init-users-schema',
      requestId,
      error: error.message,
      errorType: 'ServiceSchemaInitError',
    });
    throw error;
  }
}

async function registerUser({ phone, nickname }, requestId) {
  try {
    const existed = await findUserByPhone(phone, requestId);
    if (existed) {
      return {
        created: false,
        user: existed,
        reason: 'PHONE_ALREADY_EXISTS',
      };
    }

    let insertId;
    try {
      insertId = await createUser({ phone, nickname }, requestId);
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        const duplicatedUser = await findUserByPhone(phone, requestId);
        return {
          created: false,
          user: duplicatedUser,
          reason: 'PHONE_ALREADY_EXISTS',
        };
      }
      throw error;
    }

    const createdUser = await findUserByPhone(phone, requestId);

    return {
      created: Boolean(insertId),
      user: createdUser,
    };
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      error: error.message,
      errorType: 'ServiceUserRegisterError',
    });
    throw error;
  }
}

module.exports = {
  initUsersSchema,
  registerUser,
};
