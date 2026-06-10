const { createRequestId, buildSuccessResponse, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { listHelpCategories, listHelpQuestions } = require('../service/help-service');

async function listHelpCategoriesController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  try {
    const data = await listHelpCategories({ requestId });
    return res.json(buildSuccessResponse({ categories: data }, requestId));
  } catch (err) {
    logger.error({ module: 'help-controller', operate: 'list-help-categories', requestId, error: err?.message || 'list failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取帮助分类失败', null, requestId));
  }
}

async function listHelpQuestionsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { search, categoryId, hot, limit } = req.query || {};
  try {
    const data = await listHelpQuestions({
      keyword: typeof search === 'string' ? search.trim() : '',
      categoryId: categoryId || undefined,
      hotOnly: hot === '1' || hot === 'true',
      limit: limit ? Number(limit) : undefined,
      requestId,
    });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (err) {
    logger.error({ module: 'help-controller', operate: 'list-help-questions', requestId, error: err?.message || 'list failed' });
    const status = err?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, err?.message || '获取帮助问题失败', null, requestId));
  }
}

module.exports = {
  listHelpCategoriesController,
  listHelpQuestionsController,
};
