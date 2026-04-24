/**
 * 文件功能：三方账号绑定 DAO（mock）
 * 关联业务：三方登录
 */

const oauthBindings = [
  {
    platform: 'wechat',
    openId: 'wechat_demo_bound_openid',
    userId: 'u_10001',
  },
];

async function findByOpenId({ platform, openId }) {
  return oauthBindings.find((item) => item.platform === platform && item.openId === openId) || null;
}

module.exports = {
  findByOpenId,
};
