/**
 * 文件功能：三方 OAuth 工具（mock）
 * 关联业务：三方登录
 */
const crypto = require('crypto');

async function exchangeAuthCode({ platform, authCode }) {
  if (authCode === 'demo-bound') {
    return { openId: `${platform}_demo_bound_openid` };
  }

  const openId = `${platform}_${crypto
    .createHash('sha256')
    .update(`${platform}:${authCode}`)
    .digest('hex')
    .slice(0, 16)}`;

  return { openId };
}

module.exports = {
  exchangeAuthCode,
};
