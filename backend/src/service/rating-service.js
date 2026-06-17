/**
 * 文件功能：评价服务层
 * 关联业务：行程评价、评分统计
 */
const ratingDao = require('../dao/rating-dao');
const { logger, maskSensitive } = require('../utils/logger');

// 预设评价标签
const RATING_TAGS = {
  driver: [
    { id: 'safe', label: '驾驶安全' },
    { id: 'punctual', label: '准时到达' },
    { id: 'friendly', label: '态度友好' },
    { id: 'clean', label: '车内整洁' },
    { id: 'smooth', label: '行程平稳' },
  ],
  passenger: [
    { id: 'polite', label: '礼貌待人' },
    { id: 'punctual', label: '准时到达' },
    { id: 'clean', label: '保持整洁' },
    { id: 'quiet', label: '安静守规' },
    { id: 'friendly', label: '沟通顺畅' },
  ],
};

/**
 * 获取评价标签
 * @param {string} type - driver/passenger
 */
function getRatingTags(type) {
  return RATING_TAGS[type] || [...RATING_TAGS.driver, ...RATING_TAGS.passenger];
}

/**
 * 提交评价
 * @param {Object} params - 评价参数
 */
async function submitRating({ orderId, fromUserId, toUserId, score, commentText, tags, requestId }) {
  logger.info({
    module: 'rating-service',
    operate: 'submit-rating',
    params: { orderId, fromUserId, toUserId, score },
    result: 'Submitting rating',
    requestId,
  });

  // 校验分数范围
  if (score < 1 || score > 5) {
    const error = new Error('评分必须在 1-5 分之间');
    error.statusCode = 400;
    throw error;
  }

  // 检查是否已评价
  const alreadyRated = await ratingDao.checkRated(orderId, fromUserId, toUserId, requestId);
  if (alreadyRated) {
    const error = new Error('您已评价过该订单');
    error.statusCode = 400;
    throw error;
  }

  const rating = await ratingDao.createRating(
    { orderId, fromUserId, toUserId, score, commentText, tags },
    requestId,
  );

  return {
    ratingId: rating.rating_id,
    score: rating.score,
    createdAt: rating.created_at,
  };
}

/**
 * 获取订单评价列表
 * @param {string} orderId - 订单ID
 */
async function getOrderRatings({ orderId, requestId }) {
  const ratings = await ratingDao.getRatingsByOrderId(orderId, requestId);

  return ratings.map((r) => ({
    ratingId: r.rating_id,
    score: r.score,
    commentText: r.comment_text,
    tags: r.tags_json,
    createdAt: r.created_at,
    fromUser: {
      userId: r.from_user.user_id,
      userName: r.from_user.user_name,
      avatarUrl: r.from_user.avatar_url,
    },
  }));
}

/**
 * 获取用户收到的评价
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getUserRatings({ userId, page, pageSize, requestId }) {
  const { ratings, total } = await ratingDao.getReceivedRatings(userId, page, pageSize, requestId);
  const stats = await ratingDao.getRatingStats(userId, requestId);

  return {
    ratings: ratings.map((r) => ({
      ratingId: r.rating_id,
      score: r.score,
      commentText: r.comment_text,
      tags: r.tags_json,
      createdAt: r.created_at,
      fromUser: {
        userId: r.from_user.user_id,
        userName: r.from_user.user_name,
        avatarUrl: r.from_user.avatar_url,
      },
      order: r.order ? {
        fromCity: r.order.from_city,
        toCity: r.order.to_city,
        departAt: r.order.depart_at,
      } : null,
    })),
    total,
    page,
    pageSize,
    stats,
  };
}

/**
 * 获取用户评分统计
 * @param {string} userId - 用户ID
 */
async function getUserRatingStats({ userId, requestId }) {
  return ratingDao.getRatingStats(userId, requestId);
}

module.exports = {
  getRatingTags,
  submitRating,
  getOrderRatings,
  getUserRatings,
  getUserRatingStats,
};
