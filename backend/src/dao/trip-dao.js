/**
 * 文件功能：行程管理数据访问层
 * 关联业务：行程列表、取消行程、行程详情、评价行程、行程模板、联系信息、取消原因
 * 说明：负责数据库操作、不包含业务逻辑
 */
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
        cancel_description: cancelDescription,
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
                user_profile: {
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
async function updateTripRating(tripId, rating, comment, tags, requestId) {
  try {
    const trip = await prisma.tripParticipant.update({
      where: { trip_id: tripId },
      data: {
        rating,
        comment,
        rating_tags: tags,
        rated_at: new Date(),
      },
    });

    return trip;
  } catch (error) {
    logger.error({
      module: 'trip-dao',
      operate: 'update-trip-rating',
      params: { tripId, rating },
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
    // TODO: 实现行程模板表
    // 暂时返回空数组
    return [];
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

module.exports = {
  getUserTrips,
  getTripById,
  updateTripStatus,
  getTripWithDetails,
  updateTripRating,
  getUserTripTemplates,
};