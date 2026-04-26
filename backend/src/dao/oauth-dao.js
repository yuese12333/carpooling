/**
 * 文件功能：三方账号绑定 DAO（mock）
 * 关联业务：三方登录
 */
const { logger } = require('../utils/logger');

const oauthBindings = [
  {
    platform: 'wechat',
    openId: 'wechat_demo_bound_openid',
    userId: 'u_10001',
  },
];

/**
 * 函数功能：根据平台和 openId 查找绑定记录
 * 入参：platform/openId/requestId
 * 出参：绑定记录或 null
 */
async function findByOpenId({ platform, openId, requestId }) {
  logger.debug({
    module: 'oauth-dao',
    operate: 'find-by-open-id',
    params: { platform },
    result: 'Querying oauth binding',
    requestId,
  });

  const result = oauthBindings.find((item) => item.platform === platform && item.openId === openId) || null;

  logger.debug({
    module: 'oauth-dao',
    operate: 'find-by-open-id',
    params: { platform },
    result: result ? 'Binding found' : 'Binding not found',
    requestId,
  });

  return result;
}

module.exports = {
  findByOpenId,
};
