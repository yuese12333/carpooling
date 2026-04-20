/**
 * 文件功能：密码工具
 * 关联业务：用户登录鉴权
 * 说明：兼容 bcrypt 与 sha256 两种历史密码存储格式
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function timingSafeEqualText(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

/**
 * 函数功能：比较明文密码与存储哈希
 * 入参：plainText、hashText
 * 出参：boolean
 */
async function compare(plainText, hashText) {
  if (!plainText || !hashText) return false;

  if (hashText.startsWith('$2a$') || hashText.startsWith('$2b$') || hashText.startsWith('$2y$')) {
    return bcrypt.compare(plainText, hashText);
  }

  const encrypted = sha256(plainText);
  return timingSafeEqualText(encrypted, hashText);
}

/**
 * 函数功能：生成 bcrypt 哈希密码
 * 入参：plainText、saltRounds（可选）
 * 出参：hash string
 */
async function hash(plainText, saltRounds = 10) {
  if (!plainText || typeof plainText !== 'string' || !plainText.trim()) {
    throw new Error('密码明文不能为空');
  }
  return bcrypt.hash(plainText, saltRounds);
}

module.exports = {
  compare,
  hash,
  sha256,
};
