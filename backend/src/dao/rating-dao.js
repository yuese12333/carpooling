/**
 * 文件功能：评价数据访问层
 * 关联业务：行程评价、用户评分统计
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');
const { randomUUID } = require('crypto');

/**
 * 创建评价
 * @param {Object} data - 评价数据
 * @param {string} requestId - 请求ID
 */
async function createRating(data, requestId) {
  const { orderId, fromUserId, toUserId, score, commentText, tags } = data;

  try {
    const rating = await prisma.orderRating.create({
      data: {
        rating_id: `rating_${randomUUID().replace(/-/g, '')}`,
        order_id: orderId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        score,
        comment_text: commentText || null,
        tags_json: tags || null,
      },
    });

    logger.info({
      module: 'rating-dao',
      operate: 'create-rating',
      params: { orderId, fromUserId, toUserId, score },
      result: 'Rating created',
      requestId,
    });

    return rating;
  } catch (error) {
    logger.error({
      module: 'rating-dao',
      operate: 'create-rating',
      params: { orderId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 检查是否已评价
 * @param {string} orderId - 订单ID
 * @param {string} fromUserId - 评价者ID
 * @param {string} toUserId - 被评价者ID
 * @param {string} requestId - 请求ID
 */
async function checkRated(orderId, fromUserId, toUserId, requestId) {
  try {
    const rating = await prisma.orderRating.findUnique({
      where: {
        order_id_from_user_id_to_user_id: {
          order_id: orderId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
        },
      },
    });

    return !!rating;
  } catch (error) {
    logger.error({
      module: 'rating-dao',
      operate: 'check-rated',
      params: { orderId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 获取订单的评价列表
 * @param {string} orderId - 订单ID
 * @param {string} requestId - 请求ID
 */
async function getRatingsByOrderId(orderId, requestId) {
  try {
    const ratings = await prisma.orderRating.findMany({
      where: { order_id: orderId },
      include: {
        from_user: {
          select: { user_id: true, user_name: true, avatar_url: true },
        },
      },
    });

    return ratings;
  } catch (error) {
    logger.error({
      module: 'rating-dao',
      operate: 'get-ratings-by-order',
      params: { orderId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 获取用户收到的评价
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} requestId - 请求ID
 */
async function getReceivedRatings(userId, page, pageSize, requestId) {
  try {
    const skip = (page - 1) * pageSize;

    const [ratings, total] = await Promise.all([
      prisma.orderRating.findMany({
        where: { to_user_id: userId },
        include: {
          from_user: {
            select: { user_id: true, user_name: true, avatar_url: true },
          },
          order: {
            select: { from_city: true, to_city: true, depart_at: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.orderRating.count({ where: { to_user_id: userId } }),
    ]);

    return { ratings, total };
  } catch (error) {
    logger.error({
      module: 'rating-dao',
      operate: 'get-received-ratings',
      params: { userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 获取用户评分统计
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 */
async function getRatingStats(userId, requestId) {
  try {
    const stats = await prisma.orderRating.aggregate({
      where: { to_user_id: userId },
      _count: { rating_id: true },
      _avg: { score: true },
    });

    // 统计各分数数量
    const scoreDistribution = await prisma.orderRating.groupBy({
      by: ['score'],
      where: { to_user_id: userId },
      _count: { score: true },
    });

    return {
      totalRatings: stats._count.rating_id || 0,
      avgScore: Number((stats._avg.score || 0).toFixed(1)),
      scoreDistribution: scoreDistribution.reduce((acc, item) => {
        acc[item.score] = item._count.score;
        return acc;
      }, {}),
    };
  } catch (error) {
    logger.error({
      module: 'rating-dao',
      operate: 'get-rating-stats',
      params: { userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

module.exports = {
  createRating,
  checkRated,
  getRatingsByOrderId,
  getReceivedRatings,
  getRatingStats,
};
