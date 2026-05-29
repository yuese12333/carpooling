/**
 * 文件功能：行程服务层
 * 关联业务：行程搜索、发布、详情、预约
 * 说明：负责业务逻辑处理、调用DAO层
 */
const { logger } = require('../utils/logger');
const rideDao = require('../dao/ride-dao');

/**
 * 5.1 行程搜索
 */
async function searchRides({
  userId,
  fromText,
  toText,
  departDate,
  page,
  pageSize,
  sortBy,
  priceMin,
  priceMax,
  seatsMin,
  requestId,
}) {
  logger.info({
    module: 'ride-service',
    operate: 'search-rides',
    params: { userId, fromText, toText, departDate, page, pageSize },
    requestId,
    result: 'Searching rides',
  });

  const { rides, total } = await rideDao.searchRides({
    fromText,
    toText,
    departDate,
    page,
    pageSize,
    sortBy,
    priceMin,
    priceMax,
    seatsMin,
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
      status: ride.ride_status,
      driverId: ride.driver_id,
      driverName: ride.driver?.user_name || '未知',
      driverAvatar: ride.driver?.avatar_url || '',
      driverRating: ride.driver?.profile?.rating_avg || 0,
      vehicleModel: ride.vehicle?.model || '',
      vehicleColor: ride.vehicle?.color || '',
      vehiclePlate: ride.vehicle?.plate_number || '',
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * 5.2 地理位置建议/自动补全
 */
async function getLocationSuggestions({ keyword, latitude, longitude, limit, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-location-suggestions',
    params: { keyword, limit },
    requestId,
    result: 'Getting location suggestions',
  });

  // TODO: 集成高德地图API或其他地图服务
  // 这里暂时返回模拟数据
  const suggestions = [
    {
      name: `${keyword}附近地点1`,
      address: '示例地址1',
      latitude: latitude || 39.9042,
      longitude: longitude || 116.4074,
      distance: 1000,
    },
    {
      name: `${keyword}附近地点2`,
      address: '示例地址2',
      latitude: latitude || 39.9042,
      longitude: longitude || 116.4074,
      distance: 2000,
    },
  ];

  return { suggestions: suggestions.slice(0, limit) };
}

/**
 * 5.3 获取搜索筛选元数据
 */
async function getSearchMetadata({ requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-search-metadata',
    requestId,
    result: 'Getting search metadata',
  });

  const metadata = await rideDao.getSearchMetadata(requestId);

  return {
    priceRange: metadata.priceRange,
    seatOptions: [1, 2, 3, 4, 5, 6],
    sortOptions: [
      { value: 'time', label: '时间优先' },
      { value: 'price', label: '价格优先' },
      { value: 'distance', label: '距离优先' },
    ],
  };
}

/**
 * 5.4 获取用户搜索习惯/推荐
 */
async function getSearchPreferences({ userId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-search-preferences',
    params: { userId },
    requestId,
    result: 'Getting search preferences',
  });

  const preferences = await rideDao.getUserSearchPreferences(userId, requestId);

  return {
    recentSearches: preferences.recentSearches || [],
    frequentRoutes: preferences.frequentRoutes || [],
  };
}

/**
 * 6.1 发布拼车行程
 */
async function publishRide({
  userId,
  fromText,
  fromLatitude,
  fromLongitude,
  toText,
  toLatitude,
  toLongitude,
  departAt,
  seatsTotal,
  price,
  vehicleId,
  remark,
  requestId,
}) {
  logger.info({
    module: 'ride-service',
    operate: 'publish-ride',
    params: { userId, fromText, toText, departAt, seatsTotal, price },
    requestId,
    result: 'Publishing ride',
  });

  // 检查用户是否有车辆
  if (!vehicleId) {
    const vehicles = await rideDao.getUserVehicles(userId, requestId);
    if (vehicles.length === 0) {
      const error = new Error('您还没有添加车辆，请先添加车辆');
      error.statusCode = 400;
      throw error;
    }
  }

  const ride = await rideDao.createRide({
    driverId: userId,
    fromText,
    fromLatitude,
    fromLongitude,
    toText,
    toLatitude,
    toLongitude,
    departAt,
    seatsTotal,
    seatsLeft: seatsTotal,
    price,
    vehicleId,
    remark,
    requestId,
  });

  return {
    rideId: ride.ride_id,
    fromText: ride.from_text,
    toText: ride.to_text,
    departAt: ride.depart_at,
    seatsTotal: ride.seats_total,
    price: ride.price,
    status: ride.ride_status,
  };
}

/**
 * 6.2 初始化发布配置加载
 */
async function getPublishConfig({ userId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-publish-config',
    params: { userId },
    requestId,
    result: 'Getting publish config',
  });

  const [vehicles, frequentLocations] = await Promise.all([
    rideDao.getUserVehicles(userId, requestId),
    rideDao.getUserFrequentLocations(userId, requestId),
  ]);

  return {
    vehicles: vehicles.map((v) => ({
      vehicleId: v.vehicle_id,
      plateNumber: v.plate_number,
      brand: v.brand,
      model: v.model,
      color: v.color,
      seatTotal: v.seat_total,
    })),
    frequentLocations: frequentLocations.map((loc) => ({
      locationId: loc.location_id,
      name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
    })),
  };
}

/**
 * 6.3 路径规划与耗时预估
 */
async function routePlan({ fromLatitude, fromLongitude, toLatitude, toLongitude, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'route-plan',
    params: { fromLatitude, fromLongitude, toLatitude, toLongitude },
    requestId,
    result: 'Planning route',
  });

  // TODO: 集成高德地图API或其他地图服务
  // 这里暂时返回模拟数据
  const distance = Math.sqrt(
    Math.pow(toLatitude - fromLatitude, 2) + Math.pow(toLongitude - fromLongitude, 2)
  ) * 111000; // 粗略计算距离(米)

  const duration = distance / 500; // 假设平均速度500米/分钟

  return {
    distance: Math.round(distance),
    duration: Math.round(duration),
    estimatedPrice: Math.round(distance / 1000 * 2), // 假设每公里2元
    routePath: [], // 路径坐标点
  };
}

/**
 * 6.4 发布权限与信用校验
 */
async function checkPublishPermission({ userId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'check-publish-permission',
    params: { userId },
    requestId,
    result: 'Checking publish permission',
  });

  const userProfile = await rideDao.getUserProfile(userId, requestId);

  const canPublish = userProfile.creditScore >= 60 && userProfile.status === 'active';

  return {
    canPublish,
    creditScore: userProfile.creditScore,
    status: userProfile.status,
    reason: canPublish ? '' : userProfile.creditScore < 60 ? '信用分不足' : '账号状态异常',
  };
}

/**
 * 7.1 获取行程详情
 */
async function getRideDetail({ rideId, userId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-ride-detail',
    params: { rideId, userId },
    requestId,
    result: 'Getting ride detail',
  });

  const ride = await rideDao.getRideById(rideId, requestId);

  if (!ride) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  return {
    rideId: ride.ride_id,
    fromText: ride.from_text,
    toText: ride.to_text,
    departAt: ride.depart_at,
    seatsLeft: ride.seats_left,
    seatsTotal: ride.seats_total,
    price: ride.price,
    status: ride.ride_status,
    remark: ride.notes,
    driver: {
      userId: ride.driver.user_id,
      userName: ride.driver.user_name,
      avatarUrl: ride.driver.avatar_url,
      rating: ride.driver.profile?.rating_avg || 0,
    },
    vehicle: ride.vehicle
      ? {
          vehicleId: ride.vehicle.vehicle_id,
          plateNumber: ride.vehicle.plate_number,
          model: ride.vehicle.model,
          color: ride.vehicle.color,
        }
      : null,
  };
}

/**
 * 7.2 提交拼车预约
 */
async function bookRide({ userId, rideId, seats, remark, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'book-ride',
    params: { userId, rideId, seats },
    requestId,
    result: 'Booking ride',
  });

  const ride = await rideDao.getRideById(rideId, requestId);

  if (!ride) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  if (ride.seats_left < seats) {
    const error = new Error('剩余座位不足');
    error.statusCode = 400;
    throw error;
  }

  if (ride.driver_id === userId) {
    const error = new Error('不能预约自己发布的行程');
    error.statusCode = 400;
    throw error;
  }

  const order = await rideDao.createOrder({
    passengerId: userId,
    driverId: ride.driver_id,
    rideId,
    vehicleId: ride.vehicle_id,
    seats,
    originText: ride.from_text,
    destinationText: ride.to_text,
    departAt: ride.depart_at,
    requestId,
  });

  return {
    orderId: order.order_id,
    tripId: order.request_id,
    rideId,
    seats,
    status: order.order_status,
    createdAt: order.created_at,
  };
}

/**
 * 7.3 司机评价与车辆详情查询
 */
async function getDriverProfile({ driverId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'get-driver-profile',
    params: { driverId },
    requestId,
    result: 'Getting driver profile',
  });

  const driver = await rideDao.getDriverWithVehicles(driverId, requestId);

  if (!driver) {
    const error = new Error('司机不存在');
    error.statusCode = 404;
    throw error;
  }

  return {
    driverId: driver.user_id,
    userName: driver.user_name,
    avatarUrl: driver.avatar_url,
    rating: driver.profile?.rating_avg || 0,
    totalRides: driver.profile?.total_completed_orders || 0,
    creditScore: driver.profile?.credit_score || 0,
    vehicles: driver.vehicles.map((v) => ({
      vehicleId: v.vehicle_id,
      plateNumber: v.plate_number,
      model: v.model,
      color: v.color,
    })),
  };
}

/**
 * 7.4 隐私通讯接入
 */
async function getPrivateContact({ userId, orderId, requestId }) {
  logger.info({
    module: 'ride-service',
    operate: 'private-contact',
    params: { userId, orderId },
    requestId,
    result: 'Getting private contact',
  });

  const order = await rideDao.getOrderById(orderId, requestId);

  if (!order) {
    const error = new Error('订单不存在');
    error.statusCode = 404;
    throw error;
  }

  if (order.passenger_user_id !== userId && order.driver_user_id !== userId) {
    const error = new Error('无权访问此订单');
    error.statusCode = 403;
    throw error;
  }

  // TODO: 集成隐私号码服务(如阿里云隐私号)
  // 这里暂时返回模拟数据
  return {
    privacyPhone: '13800138000',
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
  };
}

module.exports = {
  searchRides,
  getLocationSuggestions,
  getSearchMetadata,
  getSearchPreferences,
  publishRide,
  getPublishConfig,
  routePlan,
  checkPublishPermission,
  getRideDetail,
  bookRide,
  getDriverProfile,
  getPrivateContact,
};
