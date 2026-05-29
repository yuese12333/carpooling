const { logger } = require('../utils/logger');
const helpDao = require('../dao/help-dao');

async function listHelpCategories({ requestId }) {
  logger.info({ module: 'help-service', operate: 'list-help-categories', requestId, result: 'Listing help categories' });
  return helpDao.listHelpCategories(requestId);
}

module.exports = {
  listHelpCategories,
};
