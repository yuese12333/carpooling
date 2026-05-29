/**
 * 文件功能：行程管理数据访问层
 * 关联业务：行程列表、取消行程、行程详情、评价行程、行程模板、联系信息、取消原因
 * 说明：负责数据库操作、不包含业务逻辑
 */
const { randomUUID } = require('crypto');
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 9.1 获取用户行程列表
 */
async function getUserTrips(userId, status, page, pageSize, requestId) {
  try {
    const where = {
      user_id: userId,
      ...(status && { status }),
    };

    const [trips, total] = await Promise.all([
      prisma.tripParticipant.findMany({
        where,
        include: {
          ride: {
            include: {
              driver: {
                select: {
                  user_name: true,
                },
              },
              vehicle: {
                select: {
                  brand: true,
                  model: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.tripParticipant.count({ where }),
    ]);

    return { trips, total };
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'get-user-trips',
      params: { userId, status },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.2 根据ID获取行程
 */
async function getTripById(tripId, requestId) {
  try {
    const trip = await prisma.tripParticipant.findUnique({
      where: { trip_id: tripId },
    });

    return trip;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'get-trip-by-id',
      params: { tripId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.2 更新行程状态
 */
async function updateTripStatus(tripId, status, cancelReason, cancelDescription, requestId) {
  try {
    const trip = await prisma.tripParticipant.update({
      where: { trip_id: tripId },
      data: {
        status,
        cancel_reason: cancelReason,
        cancelled_at: new Date(),
      },
    });

    return trip;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'update-trip-status',
      params: { tripId, status },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.3 获取行程详情(含关联信息)
 */
async function getTripWithDetails(tripId, requestId) {
  try {
    const trip = await prisma.tripParticipant.findUnique({
      where: { trip_id: tripId },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                user_id: true,
                user_name: true,
                avatar_url: true,
                phone: true,
                profile: {
                  select: {
                    rating_avg: true,
                  },
                },
              },
            },
            vehicle: {
              select: {
                vehicle_id: true,
                plate_number: true,
                brand: true,
                model: true,
                color: true,
              },
            },
            participants: {
              include: {
                user: {
                  select: {
                    user_id: true,
                    user_name: true,
                    avatar_url: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return trip;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'get-trip-with-details',
      params: { tripId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.4 更新行程评价
 */
async function recordTripRating({ tripId, fromUserId, toUserId, score, comment, tags, requestId }) {
  try {
    const order = await prisma.rideOrder.findFirst({
      where: { request_id: tripId },
    });

    if (!order) {
      const error = new Error('行程订单不存在');
      error.statusCode = 404;
      throw error;
    }

    const rating = await prisma.orderRating.create({
      data: {
        rating_id: `rt_${randomUUID().replace(/-/g, '')}`,
        order_id: order.order_id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        score,
        comment_text: comment || null,
        tags_json: tags || null,
      },
    });

    const aggregate = await prisma.orderRating.aggregate({
      where: { to_user_id: toUserId },
      _avg: { score: true },
    });

    await prisma.userProfile.upsert({
      where: { user_id: toUserId },
      update: {
        rating_avg: aggregate._avg.score ?? score,
      },
      create: {
        user_id: toUserId,
        role_type: 'passenger',
        real_name: null,
        gender: null,
        age: null,
        nationality: null,
        accessibility_needs: null,
        social_mode: 'efficiency',
        credit_score: 100,
        total_completed_orders: 0,
        rating_avg: aggregate._avg.score ?? score,
        accumulated_savings: 0,
        level: 1,
      },
    });

    return rating;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'record-trip-rating',
      params: { tripId, fromUserId, toUserId, score },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.4 查询是否已评价
 */
async function hasTripRating({ tripId, fromUserId, requestId }) {
  try {
    const order = await prisma.rideOrder.findFirst({
      where: { request_id: tripId },
      select: { order_id: true },
    });

    if (!order) {
      return false;
    }

    const rating = await prisma.orderRating.findFirst({
      where: {
        order_id: order.order_id,
        from_user_id: fromUserId,
      },
      select: { rating_id: true },
    });

    return Boolean(rating);
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'has-trip-rating',
      params: { tripId, fromUserId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 9.5 获取用户行程模板
 */
async function getUserTripTemplates(userId, requestId) {
  try {
    const templates = await prisma.tripTemplate.findMany({ where: { user_id: userId }, orderBy: { updated_at: 'desc' } });
    return templates;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'get-user-trip-templates',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 获取取消原因从 DB（若存在）
 */
async function getCancelReasonsFromDb(type, requestId) {
  try {
    const reasons = await prisma.cancelReason.findMany({ where: { type, status: 'enabled' }, orderBy: { sort_order: 'asc' } });
    return reasons.map((r) => ({ id: r.id, reason: r.reason }));
  } catch (error) {
    logger.error({ module: 'trip-dao', operate: 'get-cancel-reasons-db', params: { type }, requestId, error: error.message });
    throw error;
  }
}

module.exports = {
  getUserTrips,
  getTripById,
  updateTripStatus,
  getTripWithDetails,
  recordTripRating,
  hasTripRating,
  getUserTripTemplates,
  getCancelReasonsFromDb,
  // helper for refund/notification placeholders
  async getOrderByTripId(tripId, requestId) {
    try {
      const order = await prisma.rideOrder.findFirst({ where: { request_id: tripId } });
      return order;
    } catch (error) {
      logger.error({ module: 'trip-dao', operate: 'get-order-by-trip-id', params: { tripId }, requestId, error: error.message });
      throw error;
    }
  },
  async listParticipantUserIdsByTrip(tripId, requestId) {
    try {
      const parts = await prisma.tripParticipant.findMany({ where: { trip_id: tripId }, select: { user_id: true } });
      return parts.map((p) => p.user_id);
    } catch (error) {
      logger.error({ module: 'trip-dao', operate: 'list-participant-userids', params: { tripId }, requestId, error: error.message });
      throw error;
    }
  },
};