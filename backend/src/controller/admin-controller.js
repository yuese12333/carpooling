const { logger, maskSensitive } = require('../utils/logger');
const { createRequestId, buildSuccessResponse, buildFailureResponse } = require('../utils/response');
const {
  listAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
} = require('../service/admin-service');

function parsePositiveInt(val, defaultVal) {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return defaultVal;
  return Math.floor(num);
}

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

async function listAdminUsersController(req, res) {
  const requestId = req.headers['x-request-id'] || req.requestId || createRequestId();
  const {
    page,
    pageSize,
    phone,
    userName,
    role,
    status,
  } = req.query || {};

  try {
    const pageNum = parsePositiveInt(page, 1);
    const pageSizeNum = parsePositiveInt(pageSize, 10);

    if (pageSizeNum > 50) {
      return res.status(400).json(buildFailureResponse(400, 'pageSize 最大为 50', null, requestId));
    }

    const data = await listAdminUsers({
      page: pageNum,
      pageSize: pageSizeNum,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      userName: typeof userName === 'string' ? userName.trim() : undefined,
      role: typeof role === 'string' ? role.trim() : undefined,
      status: typeof status === 'string' ? status.trim() : undefined,
    }, requestId);

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'admin-controller',
      operate: 'list-admin-users',
      requestId,
      params: maskSensitive({ page, pageSize, phone, userName, role, status }),
      error: error?.message || String(error),
      errorType: error?.name || 'UnknownError',
    });
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json(buildFailureResponse(statusCode, error?.message || '获取用户列表失败', null, requestId));
  }
}

async function updateAdminUserStatusController(req, res) {
  const requestId = req.headers['x-request-id'] || req.requestId || createRequestId();
  const { targetUserId, status } = req.body || {};

  try {
    if (!isNonEmptyString(targetUserId)) {
      return res.status(400).json(buildFailureResponse(400, 'targetUserId 必填', null, requestId));
    }

    if (status !== 'active' && status !== 'disabled') {
      return res.status(400).json(buildFailureResponse(400, 'status 必须为 active 或 disabled', null, requestId));
    }

    const data = await updateAdminUserStatus({
      targetUserId: targetUserId.trim(),
      status,
      adminUserId: req.user?.userId,
    }, requestId);

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'admin-controller',
      operate: 'update-admin-user-status',
      requestId,
      params: maskSensitive({ targetUserId, status }),
      error: error?.message || String(error),
      errorType: error?.name || 'UnknownError',
    });
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json(buildFailureResponse(statusCode, error?.message || '更新用户状态失败', null, requestId));
  }
}

async function updateAdminUserRoleController(req, res) {
  const requestId = req.headers['x-request-id'] || req.requestId || createRequestId();
  const { targetUserId, role } = req.body || {};

  try {
    if (!isNonEmptyString(targetUserId)) {
      return res.status(400).json(buildFailureResponse(400, 'targetUserId 必填', null, requestId));
    }

    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json(buildFailureResponse(400, 'role 必须为 user 或 admin', null, requestId));
    }

    const data = await updateAdminUserRole({
      targetUserId: targetUserId.trim(),
      role,
      adminUserId: req.user?.userId,
    }, requestId);

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'admin-controller',
      operate: 'update-admin-user-role',
      requestId,
      params: maskSensitive({ targetUserId, role }),
      error: error?.message || String(error),
      errorType: error?.name || 'UnknownError',
    });
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json(buildFailureResponse(statusCode, error?.message || '更新用户角色失败', null, requestId));
  }
}

module.exports = {
  listAdminUsersController,
  updateAdminUserStatusController,
  updateAdminUserRoleController,
};

