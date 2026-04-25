/**
 * 文件功能：用户业务服务层
 * 关联业务：用户数据初始化与最小注册能力
 */
const crypto = require('crypto');
const { createAuthUser, findByPhone } = require('../dao/user-dao');
const { ensureCoreSchema } = require('../dao/schema-dao');
const passwordUtils = require('../utils/password-utils');
const { logger, maskSensitive } = require('../utils/logger');

function buildUserId() {
  return `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

function buildRegisterUserView(authUser) {
  if (!authUser) return null;
  return {
    userId: authUser.userId,
    phone: authUser.phone,
    nickname: authUser.userName,
    userName: authUser.userName,
    avatarUrl: authUser.avatarUrl || '',
    createdAt: authUser.createdAt || null,
    updatedAt: authUser.updatedAt || null,
  };
}

async function initCoreSchema(requestId) {
  try {
    logger.info({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      result: 'Starting core schema initialization',
    });

    const initResult = await ensureCoreSchema(requestId);

    logger.info({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      params: { tableCount: initResult.tableCount },
      result: 'Core schema initialization completed',
    });
    return initResult;
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      error: error.message,
      errorType: 'ServiceSchemaInitError',
    });
    throw error;
  }
}

async function registerUser({ phone, nickname, password }, requestId) {
  try {
    logger.info({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      params: {
        phone: maskSensitive({ phone }).phone,
        nickname,
      },
      result: 'Starting user registration',
    });

    const existed = await findByPhone(phone, requestId);
    if (existed) {
      return {
        created: false,
        user: buildRegisterUserView(existed),
        reason: 'PHONE_ALREADY_EXISTS',
      };
    }

    const passwordHash = await passwordUtils.hash(password);
    const userId = buildUserId();

    try {
      await createAuthUser({
        userId,
        phone,
        passwordHash,
        userName: nickname,
        avatarUrl: '',
      }, requestId);
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        const duplicatedUser = await findByPhone(phone, requestId);
        return {
          created: false,
          user: buildRegisterUserView(duplicatedUser),
          reason: 'PHONE_ALREADY_EXISTS',
        };
      }
      throw error;
    }

    const createdUser = await findByPhone(phone, requestId);

    logger.info({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      result: `User registered successfully with userId: ${userId}`,
    });
    return {
      created: true,
      user: buildRegisterUserView(createdUser),
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
  initCoreSchema,
  registerUser,
};
