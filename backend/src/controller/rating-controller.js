/**
 * 文件功能：评价控制层
 * 关联业务：行程评价
 */
const {
  getRatingTags,
  submitRating,
  getOrderRatings,
  getUserRatings,
  getUserRatingStats,
} = require('../service/rating-service');
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 获取评价标签
 * GET /api/ratings/tags
 */
async function getTagsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { type } = req.query || {};

  try {
    const tags = getRatingTags(type);
    return res.json(buildSuccessResponse({ tags }, requestId));
  } catch (error) {
    logger.error({
      module: 'rating-controller',
      operate: 'get-tags',
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取标签失败', null, requestId));
  }
}

/**
 * 提交评价
 * POST /api/ratings
 */
async function submitRatingController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { orderId, toUserId, score, commentText, tags } = req.body || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  if (!orderId || !toUserId || !score) {
    return res.status(400).json(buildFailureResponse(400, '缺少必要参数', null, requestId));
  }

  try {
    const data = await submitRating({
      orderId,
      fromUserId: userId,
      toUserId,
      score,
      commentText,
      tags,
      requestId,
    });

    logger.info({
      module: 'rating-controller',
      operate: 'submit-rating',
      params: { orderId, userId, score },
      result: 'Rating submitted',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'rating-controller',
      operate: 'submit-rating',
      params: { orderId },
      error: error.message,
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '评价失败', null, requestId));
  }
}

/**
 * 获取订单评价
 * GET /api/ratings/order/:orderId
 */
async function getOrderRatingsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { orderId } = req.params || {};

  if (!orderId) {
    return res.status(400).json(buildFailureResponse(400, '订单ID不能为空', null, requestId));
  }

  try {
    const data = await getOrderRatings({ orderId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'rating-controller',
      operate: 'get-order-ratings',
      params: { orderId },
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取评价失败', null, requestId));
  }
}

/**
 * 获取用户收到的评价
 * GET /api/ratings/user/:userId
 */
async function getUserRatingsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { userId } = req.params || {};
  const { page = 1, pageSize = 10 } = req.query || {};

  if (!userId) {
    return res.status(400).json(buildFailureResponse(400, '用户ID不能为空', null, requestId));
  }

  try {
    const data = await getUserRatings({
      userId,
      page: Number(page),
      pageSize: Number(pageSize),
      requestId,
    });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'rating-controller',
      operate: 'get-user-ratings',
      params: { userId },
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取评价失败', null, requestId));
  }
}

/**
 * 获取当前用户评分统计
 * GET /api/ratings/stats
 */
async function getMyStatsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  try {
    const data = await getUserRatingStats({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'rating-controller',
      operate: 'get-my-stats',
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取统计失败', null, requestId));
  }
}

module.exports = {
  getTagsController,
  submitRatingController,
  getOrderRatingsController,
  getUserRatingsController,
  getMyStatsController,
};
