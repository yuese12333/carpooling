/**
 * 文件功能：系统配置 DAO（mock）
 * 关联业务：登录页配置、演示账号
 */

async function getLoginConfig({ platform }) {
  const activeSocialPlatforms = platform === 'ios' ? ['wechat', 'apple'] : ['wechat', 'qq'];

  return {
    logoUrl: 'https://example.com/logo.png',
    title: 'Carpooling',
    subtitle: '安全便捷拼车',
    activeSocialPlatforms,
  };
}

async function getDemoAccounts() {
  return [
    {
      phone: '13800000001',
      hint: '普通乘客账号',
    },
    {
      phone: '13800000002',
      hint: '司机账号',
    },
  ];
}

module.exports = {
  getLoginConfig,
  getDemoAccounts,
};
