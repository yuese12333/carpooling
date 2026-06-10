const { logger } = require('../utils/logger');
const helpDao = require('../dao/help-dao');

async function listHelpCategories({ requestId }) {
  logger.info({ module: 'help-service', operate: 'list-help-categories', requestId, result: 'Listing help categories' });
  return helpDao.listHelpCategories(requestId);
}

async function listHelpQuestions({ keyword, categoryId, hotOnly, limit, requestId }) {
  logger.info({ module: 'help-service', operate: 'list-help-questions', params: { keyword, categoryId, hotOnly }, requestId, result: 'Listing help questions' });
  const rows = await helpDao.listHelpQuestions({ keyword, categoryId, hotOnly, limit, requestId });
  return rows.map((q) => ({
    id: q.question_id,
    q: q.question,
    a: q.answer,
    isHot: q.is_hot,
    categoryId: q.category_id,
  }));
}

module.exports = {
  listHelpCategories,
  listHelpQuestions,
};
