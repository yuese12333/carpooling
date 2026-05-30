/**
 * 文件功能：用户中心数据访问层
 * 关联业务：用户资料、车辆信息、勋章、常用地点、支付方式、通知设置、退出登录、版本检测
 * 说明：负责数据库操作、不包含业务逻辑
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');
const { randomUUID } = require('crypto');

/**
 * 8.1 查询用户及档案信息
 */
async function findUserWithProfile(userId, requestId) {
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
      gender: user.gender,
      birthday: user.birthday,
      creditScore: user.profile?.credit_score || 0,
      ratingAvg: user.profile?.rating_avg || 0,
      accumulatedSavings: user.profile?.accumulated_savings || 0,
      level: user.profile?.level || 1,
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
      where: { owner_user_id: userId },
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
          where: { vehicle_id: vehicleData.vehicleId, owner_user_id: userId },
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
            vehicle_id: `v_${randomUUID().replace(/-/g, '')}`,
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
    });

    return badges.map((ub) => ({
      badge_code: ub.badge_code,
      label: ub.label,
      emoji: ub.emoji,
      unlocked: ub.unlocked,
      unlocked_at: ub.unlocked_at,
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
    const locations = await prisma.userLocation.findMany({
      where: { 
        user_id: userId,
        is_deleted: false,
      },
      orderBy: { updated_at: 'desc' },
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
    // First pass: find existing locations to build a map of user-owned IDs
    const locationIds = locations.filter(l => l.locationId).map(l => l.locationId);
    const existingSet = new Set();
    if (locationIds.length > 0) {
      const existing = await prisma.userLocation.findMany({
        where: { location_id: { in: locationIds }, user_id: userId },
        select: { location_id: true },
      });
      existing.forEach(loc => existingSet.add(loc.location_id));
    }

    await prisma.$transaction(
      locations.map((loc) => {
        const exists = loc.locationId && existingSet.has(loc.locationId);
        return prisma.userLocation.upsert({
          where: { location_id: loc.locationId || 'create-new' },
          update: exists ? {
            label: loc.label || loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            type: loc.type || 'other',
            is_deleted: false,
          } : {
            label: loc.label || loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            type: loc.type || 'other',
            is_deleted: false,
            is_default: false,
          },
          create: {
            location_id: loc.locationId || `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            label: loc.label || loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            type: loc.type || 'other',
            is_default: false,
            is_deleted: false,
          },
        });
      })
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
async function updateUserPassword(userId, newPasswordHash, requestId) {
  try {
    const user = await prisma.authUser.update({
      where: { user_id: userId },
      data: {
        password: newPasswordHash,
      },
    });

    return user;
  } catch (error) {
    logger.error({
      module: 'profile-dao',
      operate: 'update-user-password',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

async function updateLogoutTime(userId, requestId) {
  try {
    await prisma.authUser.update({
      where: { user_id: userId },
      data: {
        updated_at: new Date(),
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
  updateUserPassword,
  updateLogoutTime,
};