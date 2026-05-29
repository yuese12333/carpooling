const { createRequestId, buildSuccessResponse, buildFailureResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { listHelpCategories } = require('../service/help-service');

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

module.exports = {
  listHelpCategoriesController,
};
