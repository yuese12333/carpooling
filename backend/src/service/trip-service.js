/**
 * 文件功能：行程管理服务层
 * 关联业务：行程列表、取消行程、行程详情、评价行程、行程模板、联系信息、取消原因
 * 说明：负责业务逻辑处理、调用DAO层
 */
const { logger } = require('../utils/logger');
const { maskPhone } = require('../utils/mask-utils');
const tripDao = require('../dao/trip-dao');
const privacyService = require('./privacy-service');
const prisma = require('../config/prisma');

/**
 * 9.1 获取行程列表
 */
async function getTripList({ userId, status, page, pageSize, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'get-trip-list',
    params: { userId, status },
    requestId,
    result: 'Fetching trip list',
  });

  const result = await tripDao.getUserTrips(userId, status, page, pageSize, requestId);

  return {
    total: result.total,
    page,
    pageSize,
    trips: result.trips.map((trip) => ({
      tripId: trip.trip_id,
      rideId: trip.ride_id,
      role: trip.role,
      status: trip.status,
      origin: trip.ride.from_text,
      destination: trip.ride.to_text,
      departureTime: trip.ride.depart_at,
      price: trip.ride.price,
      driverName: trip.ride.driver?.user_name,
      vehicleInfo: trip.ride.vehicle ? `${trip.ride.vehicle.brand} ${trip.ride.vehicle.model}` : null,
    })),
  };
}

/**
 * 9.2 取消行程
 */
async function cancelTrip({ userId, tripId, cancelReason, cancelDescription, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'cancel-trip',
    params: { userId, tripId },
    requestId,
    result: 'Cancelling trip',
  });

  const trip = await tripDao.getTripById(tripId, requestId);

  if (!trip) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  if (trip.user_id !== userId) {
    const error = new Error('无权取消此行程');
    error.statusCode = 403;
    throw error;
  }

  if (trip.status === 'cancelled') {
    const error = new Error('行程已取消');
    error.statusCode = 400;
    throw error;
  }

  await tripDao.updateTripStatus(tripId, 'cancelled', cancelReason, cancelDescription, requestId);

  // 处理退款逻辑（占位）：尝试按订单发起退款
  try {
    const paymentsService = require('./payments-service');
    // 查找订单并退款（最小实现：若存在订单则发起占位退款）
    const order = await tripDao.getOrderByTripId(tripId, requestId).catch(() => null);
    if (order) {
      await paymentsService.issueRefund({ orderId: order.order_id, amount: order.amount || 0, requestId });
    }
  } catch (err) {
    logger.warn({ module: 'trip-service', operate: 'cancel-trip-refund', requestId, error: err?.message || 'refund failed (placeholder)' });
  }

  // 通知其他参与者（占位）
  try {
    const notificationService = require('./notification-service');
    const participants = await tripDao.listParticipantUserIdsByTrip(tripId, requestId).catch(() => []);
    for (const uid of participants) {
      if (uid !== userId) {
        await notificationService.createNotification({ userId: uid, title: '行程已取消', body: `行程 ${tripId} 被取消`, meta: { tripId }, requestId }).catch(() => null);
      }
    }
  } catch (err) {
    logger.warn({ module: 'trip-service', operate: 'cancel-trip-notify', requestId, error: err?.message || 'notify failed (placeholder)' });
  }

  return { success: true };
}

/**
 * 9.3 获取行程详情
 */
async function getTripDetail({ userId, tripId, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'get-trip-detail',
    params: { userId, tripId },
    requestId,
    result: 'Fetching trip detail',
  });

  const trip = await tripDao.getTripWithDetails(tripId, requestId);

  if (!trip) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  if (trip.user_id !== userId) {
    const error = new Error('无权查看此行程');
    error.statusCode = 403;
    throw error;
  }

  return {
    tripId: trip.trip_id,
    rideId: trip.ride_id,
    role: trip.role,
    status: trip.status,
    price: trip.ride.price,
    seatCount: trip.booked_seats,
    origin: trip.ride.from_text,
    destination: trip.ride.to_text,
    departureTime: trip.ride.depart_at,
    driver: {
      userId: trip.ride.driver_id,
      userName: trip.ride.driver?.user_name,
      avatarUrl: trip.ride.driver?.avatar_url,
      phone: trip.ride.driver?.phone,
      ratingAvg: trip.ride.driver?.profile?.rating_avg,
    },
    vehicle: trip.ride.vehicle
      ? {
          vehicleId: trip.ride.vehicle.vehicle_id,
          plateNumber: trip.ride.vehicle.plate_number,
          brand: trip.ride.vehicle.brand,
          model: trip.ride.vehicle.model,
          color: trip.ride.vehicle.color,
        }
      : null,
    participants: trip.ride.participants.map((p) => ({
      userId: p.user_id,
      userName: p.user?.user_name,
      avatarUrl: p.user?.avatar_url,
      seatCount: p.booked_seats,
    })),
    rating: null,
    comment: null,
  };
}

/**
 * 9.4 评价行程
 */
async function rateTrip({ userId, tripId, rating, comment, tags, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'rate-trip',
    params: { userId, tripId, rating },
    requestId,
    result: 'Rating trip',
  });

  const trip = await tripDao.getTripWithDetails(tripId, requestId);

  if (!trip) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  if (trip.user_id !== userId) {
    const error = new Error('无权评价此行程');
    error.statusCode = 403;
    throw error;
  }

  if (trip.status !== 'completed') {
    const error = new Error('只能评价已完成的行程');
    error.statusCode = 400;
    throw error;
  }

  const targetUserId = trip.role === 'passenger'
    ? trip.ride.driver_id
    : trip.ride.participants.find((participant) => participant.user_id !== userId)?.user_id;

  if (!targetUserId) {
    const error = new Error('未找到可评价对象');
    error.statusCode = 400;
    throw error;
  }

  const alreadyRated = await tripDao.hasTripRating({ tripId, fromUserId: userId, requestId });

  if (alreadyRated) {
    const error = new Error('行程已评价');
    error.statusCode = 400;
    throw error;
  }

  await tripDao.recordTripRating({
    tripId,
    fromUserId: userId,
    toUserId: targetUserId,
    score: rating,
    comment,
    tags,
    requestId,
  });

  const ratings = await prisma.orderRating.findMany({
    where: { to_user_id: targetUserId },
    select: { score: true },
  });

  if (ratings.length > 0) {
    const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    await prisma.userProfile.update({
      where: { user_id: targetUserId },
      data: { rating_avg: Math.round(avgRating * 100) / 100 },
    });
  }

  return { success: true };
}

/**
 * 9.5 获取行程模板
 */
async function getTripTemplate({ userId, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'get-trip-template',
    params: { userId },
    requestId,
    result: 'Fetching trip templates',
  });

  const templates = await tripDao.getUserTripTemplates(userId, requestId);

  return {
    templates: templates.map((t) => ({
      templateId: t.template_id,
      templateName: t.template_name,
      origin: t.origin,
      destination: t.destination,
      departureTime: t.departure_time,
      frequency: t.frequency,
    })),
  };
}

/**
 * 9.6 获取联系信息
 */
async function getContactInfo({ userId, tripId, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'get-contact-info',
    params: { userId, tripId },
    requestId,
    result: 'Fetching contact info',
  });

  const trip = await tripDao.getTripWithDetails(tripId, requestId);

  if (!trip) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  if (trip.user_id !== userId) {
    const error = new Error('无权查看此行程联系信息');
    error.statusCode = 403;
    throw error;
  }

  // 尝试获取隐私代理号；若不可用则返回脱敏号码
  const driverProxy = await privacyService.getProxyNumberForPair({ callerUserId: userId, calleeUserId: trip.ride.driver_id, tripId, requestId });

  const passengerPhones = [];
  for (const p of trip.ride.participants) {
    const proxy = await privacyService.getProxyNumberForPair({ callerUserId: userId, calleeUserId: p.user_id, tripId, requestId });
    passengerPhones.push({
      userId: p.user_id,
      userName: p.user?.user_name,
      phone: proxy || maskPhone(p.user?.phone),
    });
  }

  return {
    driverPhone: driverProxy || maskPhone(trip.ride.driver?.phone),
    passengerPhones,
  };
}

/**
 * 9.7 获取取消原因列表
 */
async function getCancelReasons({ type, requestId }) {
  logger.info({
    module: 'trip-service',
    operate: 'get-cancel-reasons',
    params: { type },
    requestId,
    result: 'Fetching cancel reasons',
  });

  try {
    const dbReasons = await prisma.cancelReason.findMany({
      where: { type, status: 'enabled' },
      orderBy: { sort_order: 'asc' },
      select: { id: true, reason: true },
    });

    if (dbReasons && dbReasons.length > 0) {
      return { reasons: dbReasons };
    }
  } catch (err) {
    logger.warn({ module: 'trip-service', operate: 'get-cancel-reasons-db', requestId, error: err?.message || 'db read failed' });
  }

  const reasons = {
    passenger: [
      { id: 1, reason: '临时有事无法出行' },
      { id: 2, reason: '行程计划变更' },
      { id: 3, reason: '找到其他出行方式' },
      { id: 4, reason: '司机联系不上' },
      { id: 5, reason: '其他原因' },
    ],
    driver: [
      { id: 1, reason: '临时有事无法出车' },
      { id: 2, reason: '车辆故障' },
      { id: 3, reason: '乘客未按时到达' },
      { id: 4, reason: '其他原因' },
    ],
  };

  return {
    reasons: reasons[type] || reasons.passenger,
  };
}

module.exports = {
  getTripList,
  cancelTrip,
  getTripDetail,
  rateTrip,
  getTripTemplate,
  getContactInfo,
  getCancelReasons,
};