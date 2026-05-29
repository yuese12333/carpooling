/**
 * 文件功能：首页服务层
 * 关联业务：首页用户信息、推荐行程、系统统计、未读通知
 * 说明：负责业务逻辑处理、调用DAO层
 */
const { logger } = require('../utils/logger');
const homeDao = require('../dao/home-dao');

/**
 * 函数功能：获取当前用户信息
 * 入参：{ userId, requestId }
 * 出参：用户信息对象
 */
async function getUserInfo({ userId, requestId }) {
  logger.info({
    module: 'home-service',
    operate: 'get-user-info',
    params: { userId },
    requestId,
    result: 'Fetching user info',
  });

  const user = await homeDao.findUserProfileById(userId, requestId);

  return {
    userId: user.userId,
    userName: user.userName,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    creditScore: user.creditScore,
    ratingAvg: user.ratingAvg,
    accumulatedSavings: user.accumulatedSavings,
    level: user.level,
  };
}

/**
 * 函数功能：获取推荐行程列表
 * 入参：{ userId, page, pageSize, latitude, longitude, requestId }
 * 出参：推荐行程列表
 */
async function getRecommendRides({ userId, page, pageSize, latitude, longitude, requestId }) {
  logger.info({
    module: 'home-service',
    operate: 'get-recommend-rides',
    params: { userId, page, pageSize, latitude, longitude },
    requestId,
    result: 'Fetching recommend rides',
  });

  const { rides, total } = await homeDao.findRecommendRides({
    userId,
    page,
    pageSize,
    latitude,
    longitude,
    requestId,
  });

  return {
    list: rides.map((ride) => ({
      rideId: ride.ride_id,
      fromText: ride.from_text,
      toText: ride.to_text,
      departAt: ride.depart_at,
      seatsLeft: ride.seats_left,
      seatsTotal: ride.seats_total,
      price: ride.price,
      driverName: ride.driver?.user_name || '未知',
      driverAvatar: ride.driver?.avatar_url || '',
      vehicleModel: ride.vehicle?.model || '',
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * 函数功能：获取系统统计数据
 * 入参：{ requestId }
 * 出参：统计数据对象
 */
async function getStatistics({ requestId }) {
  logger.info({
    module: 'home-service',
    operate: 'get-statistics',
    requestId,
    result: 'Fetching system statistics',
  });

  const stats = await homeDao.getSystemStatistics(requestId);

  return {
    totalRides: stats.totalRides,
    totalUsers: stats.totalUsers,
    totalDistance: stats.totalDistance,
    totalSavings: stats.totalSavings,
  };
}

/**
 * 函数功能：获取未读通知状态
 * 入参：{ userId, requestId }
 * 出参：未读通知状态对象
 */
async function getUnreadStatus({ userId, requestId }) {
  logger.info({
    module: 'home-service',
    operate: 'get-unread-status',
    params: { userId },
    requestId,
    result: 'Fetching unread notification status',
  });

  const unreadCount = await homeDao.countUnreadNotifications(userId, requestId);

  return {
    hasUnread: unreadCount > 0,
    unreadCount,
  };
}

module.exports = {
  getUserInfo,
  getRecommendRides,
  getStatistics,
  getUnreadStatus,
};
