/**
 * 文件功能：用户数据访问层
 * 关联业务：用户登录鉴权
 * 说明：基于 Prisma ORM，映射 auth_users 表
 */
const prisma = require('../config/prisma');
const { logger, maskSensitive } = require('../utils/logger');

/**
 * 函数功能：按手机号查询用户
 * 入参：phone（手机号）
 * 出参：用户对象或 null
 */
async function findByPhone(phone, requestId) {
  const user = await prisma.authUser.findUnique({
    where: { phone },
  });

  if (!user) return null;

  return {
    userId: user.user_id,
    phone: user.phone,
    passwordHash: user.password_hash,
    userName: user.user_name,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLoginAt: user.last_login_at,
    lastLoginDeviceInfo: user.last_login_device_info,
  };
}

/**
 * 函数功能：创建登录用户账号
 * 入参：userId/phone/passwordHash/userName/avatarUrl
 * 出参：boolean（是否创建成功）
 */
async function createAuthUser({ userId, phone, passwordHash, userName, avatarUrl = '' }, requestId) {
  await prisma.authUser.create({
    data: {
      user_id: userId,
      phone,
      password_hash: passwordHash,
      user_name: userName,
      avatar_url: avatarUrl,
    },
  });

  logger.info({
    module: 'user-dao',
    operate: 'create-auth-user',
    requestId,
    params: { userId, phone: maskSensitive({ phone }).phone },
    result: 'Auth user created',
  });

  return true;
}

/**
 * 函数功能：更新用户最近登录时间与设备信息
 * 入参：userId、lastLoginAt、deviceInfo
 * 出参：更新后的用户对象或 null
 */
async function updateLastLoginInfo(userId, { lastLoginAt, deviceInfo }, requestId) {
  await prisma.authUser.update({
    where: { user_id: userId },
    data: {
      last_login_at: lastLoginAt || new Date(),
      last_login_device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
    },
  });

  logger.info({
    module: 'user-dao',
    operate: 'update-last-login-info',
    requestId,
    params: { userId },
    result: 'Auth login info updated',
  });
}

module.exports = {
  findByPhone,
  createAuthUser,
  updateLastLoginInfo,
};
