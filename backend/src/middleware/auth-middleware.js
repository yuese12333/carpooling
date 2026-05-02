const jwtUtils = require('../utils/jwt-utils');
const { createRequestId, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 文件功能：JWT 鉴权中间件
 * 说明：校验 access token，解析用户信息挂载到 req.user
 */
function authMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json(buildFailureResponse(401, '未登录或 token 缺失', null, requestId));
  }

  try {
    const payload = jwtUtils.verifyToken(token);
    req.user = payload; // { userId, phone, role, ... }
    req.requestId = requestId;
    next();
  } catch (err) {
    logger.warn({
      module: 'auth-middleware',
      operate: 'verify_token_failed',
      requestId,
      params: { authorization_present: Boolean(token) },
      result: 'token_invalid',
    });
    return res
      .status(401)
      .json(buildFailureResponse(401, 'token 无效或已过期', null, requestId));
  }
}

module.exports = authMiddleware;

