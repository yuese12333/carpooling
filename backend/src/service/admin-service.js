const { logger } = require('../utils/logger');
const {
  listAdminUsersDao,
  updateAdminUserStatusDao,
  updateAdminUserRoleDao,
} = require('../dao/admin-dao');

function buildSelfOperateError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function listAdminUsers(params, requestId) {
  return listAdminUsersDao(params, requestId);
}

async function updateAdminUserStatus({ targetUserId, status, adminUserId }, requestId) {
  if (!adminUserId) {
    const error = new Error('无管理员身份');
    error.statusCode = 401;
    throw error;
  }

  // 管理员不能操作自己（降级/禁用自己都禁止）
  if (targetUserId === adminUserId) {
    throw buildSelfOperateError('不能操作自己');
  }

  return updateAdminUserStatusDao({ targetUserId, status, adminUserId }, requestId);
}

async function updateAdminUserRole({ targetUserId, role, adminUserId }, requestId) {
  if (!adminUserId) {
    const error = new Error('无管理员身份');
    error.statusCode = 401;
    throw error;
  }

  // 管理员不能操作自己
  if (targetUserId === adminUserId) {
    throw buildSelfOperateError('不能操作自己');
  }

  // 规则：管理员可将普通用户提升为管理员；但不允许对自身做 role 变更
  return updateAdminUserRoleDao({ targetUserId, role, adminUserId }, requestId);
}

module.exports = {
  listAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
};

