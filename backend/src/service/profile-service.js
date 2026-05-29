/**
 * 文件功能：用户中心服务层
 * 关联业务：用户资料、车辆信息、勋章、常用地点、支付方式、通知设置、退出登录、版本检测
 * 说明：负责业务逻辑处理、调用DAO层
 */
const { logger } = require('../utils/logger');
const profileDao = require('../dao/profile-dao');

/**
 * 8.1 获取用户信息
 */
async function getProfileInfo({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-profile-info',
    params: { userId },
    requestId,
    result: 'Fetching profile info',
  });

  const user = await profileDao.findUserWithProfile(userId, requestId);

  return {
    userId: user.userId,
    userName: user.userName,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    gender: user.gender,
    birthday: user.birthday,
    creditScore: user.creditScore,
    ratingAvg: user.ratingAvg,
    accumulatedSavings: user.accumulatedSavings,
    level: user.level,
  };
}

/**
 * 8.2 更新用户资料
 */
async function updateProfile({ userId, userName, avatarUrl, gender, birthday, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'update-profile',
    params: { userId },
    requestId,
    result: 'Updating profile',
  });

  const user = await profileDao.updateUserProfile(userId, {
    userName,
    avatarUrl,
    gender,
    birthday,
  }, requestId);

  return {
    userId: user.user_id,
    userName: user.user_name,
    avatarUrl: user.avatar_url,
    gender: user.gender,
    birthday: user.birthday,
  };
}

/**
 * 8.3 获取车辆详情
 */
async function getVehicle({ userId, vehicleId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-vehicle',
    params: { userId, vehicleId },
    requestId,
    result: 'Fetching vehicle',
  });

  const vehicles = await profileDao.getUserVehicles(userId, requestId);

  if (vehicleId) {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    if (!vehicle) {
      const error = new Error('车辆不存在');
      error.statusCode = 404;
      throw error;
    }
    return {
      vehicleId: vehicle.vehicle_id,
      plateNumber: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      seatTotal: vehicle.seat_total,
      status: vehicle.vehicle_status,
    };
  }

  return {
    vehicles: vehicles.map((v) => ({
      vehicleId: v.vehicle_id,
      plateNumber: v.plate_number,
      brand: v.brand,
      model: v.model,
      color: v.color,
      seatTotal: v.seat_total,
      status: v.vehicle_status,
    })),
  };
}

/**
 * 8.4 更新车辆信息
 */
async function updateVehicle({ userId, vehicleId, plateNumber, brand, model, color, seatTotal, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'update-vehicle',
    params: { userId, vehicleId },
    requestId,
    result: 'Updating vehicle',
  });

  const vehicle = await profileDao.upsertVehicle(userId, {
    vehicleId,
    plateNumber,
    brand,
    model,
    color,
    seatTotal,
  }, requestId);

  return {
    vehicleId: vehicle.vehicle_id,
    plateNumber: vehicle.plate_number,
    brand: vehicle.brand,
    model: vehicle.model,
    color: vehicle.color,
    seatTotal: vehicle.seat_total,
    status: vehicle.vehicle_status,
  };
}

/**
 * 8.5 获取成就勋章列表
 */
async function getBadges({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-badges',
    params: { userId },
    requestId,
    result: 'Fetching badges',
  });

  const badges = await profileDao.getUserBadges(userId, requestId);

  return {
    badges: badges.map((b) => ({
      badgeId: b.badge_id,
      badgeName: b.badge_name,
      badgeIcon: b.badge_icon,
      description: b.description,
      earnedAt: b.earned_at,
    })),
  };
}

/**
 * 8.6 获取常用地点
 */
async function getFrequentLocations({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-frequent-locations',
    params: { userId },
    requestId,
    result: 'Fetching frequent locations',
  });

  const locations = await profileDao.getFrequentLocations(userId, requestId);

  return {
    locations: locations.map((loc) => ({
      locationId: loc.location_id,
      name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      useCount: loc.use_count,
    })),
  };
}

/**
 * 8.7 更新常用地点
 */
async function updateFrequentLocations({ userId, locations, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'update-frequent-locations',
    params: { userId },
    requestId,
    result: 'Updating frequent locations',
  });

  await profileDao.upsertFrequentLocations(userId, locations, requestId);

  return { success: true };
}

/**
 * 8.8 获取支付方式状态
 */
async function getPaymentMethods({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-payment-methods',
    params: { userId },
    requestId,
    result: 'Fetching payment methods',
  });

  const methods = await profileDao.getUserPaymentMethods(userId, requestId);

  return {
    methods: methods.map((m) => ({
      methodId: m.method_id,
      methodType: m.method_type,
      account: m.display_name || m.bind_summary || '',
      isDefault: m.is_default,
      status: m.status,
    })),
  };
}

/**
 * 8.9 获取通知设置
 */
async function getNotificationSettings({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'get-notification-settings',
    params: { userId },
    requestId,
    result: 'Fetching notification settings',
  });

  const settings = await profileDao.getUserNotificationSettings(userId, requestId);

  return {
    pushEnabled: settings.push_enabled || false,
    smsEnabled: settings.sms_enabled || false,
    emailEnabled: settings.email_enabled || false,
    orderNotification: settings.order_notification || true,
    promotionNotification: settings.promotion_notification || false,
  };
}

/**
 * 8.10 更新通知设置
 */
async function updateNotificationSettings({ userId, settings, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'update-notification-settings',
    params: { userId },
    requestId,
    result: 'Updating notification settings',
  });

  await profileDao.updateUserNotificationSettings(userId, settings, requestId);

  return { success: true };
}

/**
 * 8.11 退出登录
 */
async function logout({ userId, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'logout',
    params: { userId },
    requestId,
    result: 'Logging out',
  });

  // TODO: 实现token失效逻辑(如加入黑名单)
  await profileDao.updateLogoutTime(userId, requestId);

  return { success: true };
}

/**
 * 8.12 版本检测
 */
async function checkVersion({ platform, currentVersion, requestId }) {
  logger.info({
    module: 'profile-service',
    operate: 'check-version',
    params: { platform, currentVersion },
    requestId,
    result: 'Checking version',
  });

  // TODO: 从数据库或配置文件获取最新版本信息
  const latestVersion = '1.0.0';
  const needUpdate = currentVersion < latestVersion;

  return {
    needUpdate,
    latestVersion,
    downloadUrl: needUpdate ? 'https://example.com/download' : null,
    forceUpdate: false,
    updateLog: needUpdate ? '修复已知问题，优化用户体验' : null,
  };
}

module.exports = {
  getProfileInfo,
  updateProfile,
  getVehicle,
  updateVehicle,
  getBadges,
  getFrequentLocations,
  updateFrequentLocations,
  getPaymentMethods,
  getNotificationSettings,
  updateNotificationSettings,
  logout,
  checkVersion,
};