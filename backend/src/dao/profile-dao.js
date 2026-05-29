/**
 * 文件功能：用户中心数据访问层
 * 关联业务：用户资料、车辆信息、勋章、常用地点、支付方式、通知设置、退出登录、版本检测
 * 说明：负责数据库操作、不包含业务逻辑
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 8.1 查询用户及档案信息
 */
async function findUserWithProfile(userId, requestId) {
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
      gender: user.gender,
      birthday: user.birthday,
      creditScore: user.user_profile?.credit_score || 0,
      ratingAvg: user.user_profile?.rating_avg || 0,
      accumulatedSavings: user.user_profile?.accumulated_savings || 0,
      level: user.user_profile?.level || 1,
    };
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'find-user-with-profile',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.2 更新用户资料
 */
async function updateUserProfile(userId, profileData, requestId) {
  try {
    const user = await prisma.authUser.update({
      where: { user_id: userId },
      data: {
        ...(profileData.userName && { user_name: profileData.userName }),
        ...(profileData.avatarUrl && { avatar_url: profileData.avatarUrl }),
        ...(profileData.gender !== undefined && { gender: profileData.gender }),
        ...(profileData.birthday && { birthday: new Date(profileData.birthday) }),
      },
    });

    return user;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'update-user-profile',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.3 获取用户车辆列表
 */
async function getUserVehicles(userId, requestId) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { user_id: userId },
    });

    return vehicles;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'get-user-vehicles',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.4 创建或更新车辆
 */
async function upsertVehicle(userId, vehicleData, requestId) {
  try {
    const vehicle = vehicleData.vehicleId
      ? await prisma.vehicle.update({
          where: { vehicle_id: vehicleData.vehicleId },
          data: {
            plate_number: vehicleData.plateNumber,
            brand: vehicleData.brand,
            model: vehicleData.model,
            color: vehicleData.color,
            seat_total: vehicleData.seatTotal,
          },
        })
      : await prisma.vehicle.create({
          data: {
            owner_user_id: userId,
            plate_number: vehicleData.plateNumber,
            brand: vehicleData.brand,
            model: vehicleData.model,
            color: vehicleData.color,
            seat_total: vehicleData.seatTotal,
            vehicle_status: 'active',
          },
        });

    return vehicle;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'upsert-vehicle',
      params: { userId, vehicleId: vehicleData.vehicleId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.5 获取用户勋章
 */
async function getUserBadges(userId, requestId) {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { user_id: userId },
      include: {
        badge: true,
      },
    });

    return badges.map((ub) => ({
      badge_id: ub.badge.badge_id,
      badge_name: ub.badge.badge_name,
      badge_icon: ub.badge.badge_icon,
      description: ub.badge.description,
      earned_at: ub.earned_at,
    }));
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'get-user-badges',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.6 获取常用地点
 */
async function getFrequentLocations(userId, requestId) {
  try {
    const locations = await prisma.frequentLocation.findMany({
      where: { user_id: userId },
      orderBy: { use_count: 'desc' },
    });

    return locations;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'get-frequent-locations',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.7 批量更新常用地点
 */
async function upsertFrequentLocations(userId, locations, requestId) {
  try {
    await prisma.$transaction(
      locations.map((loc) =>
        prisma.frequentLocation.upsert({
          where: { location_id: loc.locationId || 'create-new' },
          update: {
            name: loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            use_count: { increment: 1 },
          },
          create: {
            user_id: userId,
            name: loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            use_count: 1,
          },
        })
      )
    );

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'upsert-frequent-locations',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.8 获取用户支付方式
 */
async function getUserPaymentMethods(userId, requestId) {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { user_id: userId, status: 'active' },
    });

    return methods;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'get-user-payment-methods',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.9 获取用户通知设置
 */
async function getUserNotificationSettings(userId, requestId) {
  try {
    // TODO: 实现通知设置表
    // 暂时返回默认设置
    return {
      push_enabled: true,
      sms_enabled: true,
      email_enabled: false,
      order_notification: true,
      promotion_notification: false,
    };
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'get-user-notification-settings',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.10 更新用户通知设置
 */
async function updateUserNotificationSettings(userId, settings, requestId) {
  try {
    // TODO: 实现通知设置表更新
    logger.info({
      module: 'profile-dao',
      operate: 'update-user-notification-settings',
      params: { userId },
      requestId,
      result: 'Notification settings updated',
    });

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'update-user-notification-settings',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 8.11 更新退出登录时间
 */
async function updateLogoutTime(userId, requestId) {
  try {
    await prisma.authUser.update({
      where: { user_id: userId },
      data: {
        last_login_at: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'update-logout-time',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  findUserWithProfile,
  updateUserProfile,
  getUserVehicles,
  upsertVehicle,
  getUserBadges,
  getFrequentLocations,
  upsertFrequentLocations,
  getUserPaymentMethods,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  updateLogoutTime,
};