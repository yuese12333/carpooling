/**
 * 文件功能：JWT 工具
 * 关联业务：用户登录鉴权
 * 说明：负责 access token 与 refresh token 签发
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Missing required JWT environment variables: JWT_SECRET, JWT_REFRESH_SECRET');
}

/**
 * 函数功能：生成访问令牌
 * 入参：payload/options
 * 出参：token string
 */
function generateToken(payload, options = {}) {
  const expiresIn = options.expiresIn || 24 * 60 * 60;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 函数功能：生成刷新令牌
 * 入参：payload/options
 * 出参：refresh token string
 */
function generateRefreshToken(payload, options = {}) {
  const expiresIn = options.expiresIn || 7 * 24 * 60 * 60;
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

/**
 * 函数功能：生成临时令牌（用于 OAuth 绑定流程）
 * 入参：payload/options
 * 出参：temp token string
 */
function generateTempToken(payload, options = {}) {
  const expiresIn = options.expiresIn || 30 * 60; // 默认 30 分钟
  return jwt.sign({ ...payload, type: 'temp' }, JWT_SECRET, { expiresIn });
}

/**
 * 函数功能：校验 access token 并返回 payload
 * 入参：token
 * 出参：payload（包含 userId/phone/role 等字段）
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  generateRefreshToken,
  generateTempToken,
  verifyToken,
};
