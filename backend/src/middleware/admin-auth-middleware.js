const { createRequestId, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 文件功能：管理员权限鉴权中间件
 * 说明：要求 req.user.role === 'admin'
 */
function adminAuthMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || req.requestId || createRequestId();

  if (req.user?.role !== 'admin') {
    logger.warn({
      module: 'admin-auth-middleware',
      operate: 'admin_auth_failed',
      requestId,
      params: { userRole: req.user?.role },
      result: 'forbidden',
    });
    return res
      .status(403)
      .json(buildFailureResponse(403, '无管理员权限', null, requestId));
  }

  next();
}

module.exports = adminAuthMiddleware;

