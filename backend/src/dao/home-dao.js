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
        profile: true,
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
      creditScore: user.profile?.credit_score || 0,
      ratingAvg: user.profile?.rating_avg || 0,
      accumulatedSavings: user.profile?.accumulated_savings || 0,
      level: user.profile?.level || 1,
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

    const whereClause = {
      ride_status: 'open',
      depart_at: {
        gte: now,
        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
      seats_left: { gt: 0 },
    };

    let rides = await prisma.ride.findMany({
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
    });

    const total = await prisma.ride.count({ where: whereClause });

    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const maxDistance = 50;

      rides = rides.filter((ride) => {
        if (!ride.from_lat || !ride.from_lng) return true;
        const rideLat = parseFloat(ride.from_lat);
        const rideLng = parseFloat(ride.from_lng);
        const distance = calculateDistance(userLat, userLng, rideLat, rideLng);
        ride.distance = distance;
        return distance <= maxDistance;
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

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

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 函数功能：获取系统统计数据
 * 入参：requestId
 * 出参：统计数据对象
 */
async function getSystemStatistics(requestId) {
  try {
    const [totalRides, totalUsers, statsResult] = await Promise.all([
      prisma.ride.count(),
      prisma.authUser.count(),
      prisma.tripParticipant.aggregate({
        where: { status: 'completed' },
        _sum: {
          booked_seats: true,
        },
        _count: true,
      }),
    ]);

    const avgDistancePerRide = 15;
    const avgSavingsPerKm = 0.5;
    const totalParticipants = statsResult._count;
    const totalDistance = totalParticipants * avgDistancePerRide;
    const totalSavings = totalDistance * avgSavingsPerKm;

    return {
      totalRides,
      totalUsers,
      totalDistance,
      totalSavings,
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
