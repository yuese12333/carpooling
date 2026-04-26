/**
 * 文件功能：系统配置 DAO（mock）
 * 关联业务：登录页配置、演示账号
 * 注意：当前为 Mock 实现，logoUrl 为示例地址
 */
const { logger } = require('../utils/logger');

/**
 * 函数功能：获取登录页配置
 * 入参：platform/requestId
 * 出参：登录配置对象
 */
async function getLoginConfig({ platform, requestId }) {
  logger.debug({
    module: 'config-dao',
    operate: 'get-login-config',
    params: { platform },
    result: 'Fetching login config (mock)',
    requestId,
  });

  const activeSocialPlatforms = platform === 'ios' ? ['wechat', 'apple'] : ['wechat', 'qq'];

  return {
    logoUrl: 'https://example.com/logo.png', // Mock 数据
    title: 'Carpooling',
    subtitle: '安全便捷拼车',
    activeSocialPlatforms,
  };
}

/**
 * 函数功能：获取演示账号列表
 * 入参：requestId
 * 出参：演示账号数组
 */
async function getDemoAccounts(requestId) {
  logger.debug({
    module: 'config-dao',
    operate: 'get-demo-accounts',
    result: 'Fetching demo accounts (mock)',
    requestId,
  });

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
