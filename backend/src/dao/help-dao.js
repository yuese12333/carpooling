/**
 * 帮助中心数据访问（最小实现，返回静态分类）
 */
const { logger } = require('../utils/logger');

async function listHelpCategories(requestId) {
  try {
    // 最小实现：返回静态分类，真实项目可从 DB 或 CMS 读取
    const categories = [
      { id: 1, name: '使用指南' },
      { id: 2, name: '账户与安全' },
      { id: 3, name: '支付与退款' },
      { id: 4, name: '运营规则' },
      { id: 5, name: '其他' },
    ];
    return categories;
  } catch (error) {
    logger.error({ module: 'help-dao', operate: 'list-help-categories', requestId, error: error.message });
    throw error;
  }
}

module.exports = {
  listHelpCategories,
};
