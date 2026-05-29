/**
 * 文件功能：首页数据访问层
 * 关联业务：首页用户信息、推荐行程、系统统计、未读通知
 * 说明：负责数据库操作、不包含业务逻辑
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 函数功能：根据用户ID查询用户详细信息
 * 入参：userId, requestId
 * 出参：用户详细信息对象
 */
async function findUserProfileById(userId, requestId) {
  try {
    const user = await prisma.authUser.findUnique({
      where: { user_id: userId },
      include: {
        user_profile: true,
      },
    });

    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      throw error;
    }

    return {
      userId: user.user_id,
      userName: user.user_name,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      creditScore: user.user_profile?.credit_score || 0,
      ratingAvg: user.user_profile?.rating_avg || 0,
      accumulatedSavings: user.user_profile?.accumulated_savings || 0,
      level: user.user_profile?.level || 1,
    };
  } catch (error) {
    logger.error({
      module: 'home-dao',
      operate: 'find-user-profile-by-id',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 函数功能：查询推荐行程列表
 * 入参：{ userId, page, pageSize, latitude, longitude, requestId }
 * 出参：{ rides, total }
 */
async function findRecommendRides({ userId, page, pageSize, latitude, longitude, requestId }) {
  try {
    const skip = (page - 1) * pageSize;
    const now = new Date();

    // 查询未来24小时内的行程
    const whereClause = {
      ride_status: 'open',
      depart_at: {
        gte: now,
        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
      seats_left: { gt: 0 },
    };

    // 如果提供了经纬度,可以添加距离筛选(这里暂时简化处理)
    // TODO: 实现基于地理位置的距离筛选

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { depart_at: 'asc' },
        include: {
          driver: {
            select: {
              user_name: true,
              avatar_url: true,
            },
          },
          vehicle: {
            select: {
              model: true,
            },
          },
        },
      }),
      prisma.ride.count({ where: whereClause }),
    ]);

    return { rides, total };
  } catch (error) {
    logger.error({
      module: 'home-dao',
      operate: 'find-recommend-rides',
      params: { userId, page, pageSize },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 函数功能：获取系统统计数据
 * 入参：requestId
 * 出参：统计数据对象
 */
async function getSystemStatistics(requestId) {
  try {
    const [totalRides, totalUsers] = await Promise.all([
      prisma.ride.count(),
      prisma.authUser.count(),
    ]);

    // TODO: 实现总距离和总节省金额的计算
    // 需要从TripParticipant表中聚合计算

    return {
      totalRides,
      totalUsers,
      totalDistance: 0, // 暂时返回0,待实现
      totalSavings: 0, // 暂时返回0,待实现
    };
  } catch (error) {
    logger.error({
      module: 'home-dao',
      operate: 'get-system-statistics',
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 函数功能：统计用户未读通知数量
 * 入参：userId, requestId
 * 出参：未读通知数量
 */
async function countUnreadNotifications(userId, requestId) {
  try {
    const count = await prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return count;
  } catch (error) {
    logger.error({
      module: 'home-dao',
      operate: 'count-unread-notifications',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  findUserProfileById,
  findRecommendRides,
  getSystemStatistics,
  countUnreadNotifications,
};
