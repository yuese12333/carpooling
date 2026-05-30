const jwtUtils = require('../utils/jwt-utils');
const { logger } = require('../utils/logger');

/**
 * 文件功能：可选 JWT 鉴权中间件
 * 说明：尝试解析 token 并挂载 req.user，不拦截未登录请求。
 * 适用场景：公共接口但在登录态下需要用户身份（如日志上报、推荐接口）。
 */
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const payload = jwtUtils.verifyToken(token);
      req.user = payload;
    } catch (err) {
      logger.warn({
        module: 'optional-auth-middleware',
        operate: 'verify_token_failed',
        requestId: req.headers['x-request-id'] || '',
        params: { operate: 'optional-auth' },
        result: 'token_invalid_ignored',
      });
    }
  }

  next();
}

module.exports = optionalAuthMiddleware;
