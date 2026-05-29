/**
 * 文件功能：行程数据访问层
 * 关联业务：行程搜索、发布、详情、预约
 * 说明：负责数据库操作、不包含业务逻辑
 */
const { randomUUID } = require('crypto');
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 5.1 搜索行程
 */
async function searchRides({
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
  try {
    const skip = (page - 1) * pageSize;
    const dateStart = new Date(departDate);
    const dateEnd = new Date(dateStart);
    dateEnd.setHours(23, 59, 59, 999);

    const whereClause = {
      ride_status: 'open',
      depart_at: {
        gte: dateStart,
        lte: dateEnd,
      },
      seats_left: seatsMin ? { gte: seatsMin } : { gt: 0 },
      price: {
        ...(priceMin && { gte: priceMin }),
        ...(priceMax && { lte: priceMax }),
      },
      OR: [
        { from_text: { contains: fromText } },
        { to_text: { contains: toText } },
      ],
    };

    const orderBy = sortBy === 'price' ? { price: 'asc' } : { depart_at: 'asc' };

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy,
        include: {
          driver: {
            select: {
              user_id: true,
              user_name: true,
              avatar_url: true,
              profile: {
                select: {
                  rating_avg: true,
                },
              },
            },
          },
          vehicle: {
            select: {
              model: true,
              color: true,
              plate_number: true,
            },
          },
        },
      }),
      prisma.ride.count({ where: whereClause }),
    ]);

    return { rides, total };
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'search-rides',
      params: { fromText, toText, departDate, page, pageSize },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 5.3 获取搜索元数据
 */
async function getSearchMetadata(requestId) {
  try {
    const result = await prisma.ride.aggregate({
      where: { ride_status: 'open' },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      priceRange: {
        min: result._min.price || 0,
        max: result._max.price || 100,
      },
    };
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-search-metadata',
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 5.4 获取用户搜索习惯
 */
async function getUserSearchPreferences(userId, requestId) {
  try {
    // TODO: 实现用户搜索历史记录
    // 暂时返回空数组
    return {
      recentSearches: [],
      frequentRoutes: [],
    };
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-user-search-preferences',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 6.1 创建行程
 */
async function createRide({
  driverId,
  fromText,
  fromLatitude,
  fromLongitude,
  toText,
  toLatitude,
  toLongitude,
  departAt,
  seatsTotal,
  seatsLeft,
  price,
  vehicleId,
  remark,
  requestId,
}) {
  try {
    const ride = await prisma.ride.create({
      data: {
        driver_id: driverId,
        from_text: fromText,
        from_lat: fromLatitude,
        from_lng: fromLongitude,
        to_text: toText,
        to_lat: toLatitude,
        to_lng: toLongitude,
        depart_at: departAt,
        seats_total: seatsTotal,
        seats_left: seatsLeft,
        price,
        vehicle_id: vehicleId,
        notes: remark,
        ride_status: 'open',
      },
    });

    return ride;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'create-ride',
      params: { driverId, fromText, toText },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 6.2 获取用户车辆列表
 */
async function getUserVehicles(userId, requestId) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { owner_user_id: userId, vehicle_status: 'active' },
    });

    return vehicles;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
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
 * 6.2 获取用户常用地点
 */
async function getUserFrequentLocations(userId, requestId) {
  try {
    const locations = await prisma.userLocation.findMany({
      where: { 
        user_id: userId,
        is_deleted: false,
      },
      orderBy: { updated_at: 'desc' },
      take: 5,
    });

    return locations;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-user-frequent-locations',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 6.4 获取用户档案
 */
async function getUserProfile(userId, requestId) {
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
      creditScore: user.profile?.credit_score || 0,
      status: user.status,
    };
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-user-profile',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 7.1 根据ID获取行程
 */
async function getRideById(rideId, requestId) {
  try {
    const ride = await prisma.ride.findUnique({
      where: { ride_id: rideId },
      include: {
        driver: {
          select: {
            user_id: true,
            user_name: true,
            avatar_url: true,
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
            model: true,
            color: true,
          },
        },
      },
    });

    return ride;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-ride-by-id',
      params: { rideId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 7.2 创建订单
 */
async function createOrder({ passengerId, driverId, rideId, vehicleId, seats, originText, destinationText, departAt, requestId }) {
  try {
    const tripId = `tp_${randomUUID().replace(/-/g, '')}`;
    const orderId = `or_${randomUUID().replace(/-/g, '')}`;
    const order = await prisma.$transaction(async (tx) => {
      await tx.rideRequest.create({
        data: {
          request_id: tripId,
          passenger_user_id: passengerId,
          origin_text: originText,
          destination_text: destinationText,
          depart_at: departAt,
          passenger_count: seats,
          request_status: 'open',
        },
      });

      // 创建订单
      const newOrder = await tx.rideOrder.create({
        data: {
          order_id: orderId,
          request_id: tripId,
          passenger_user_id: passengerId,
          driver_user_id: driverId,
          vehicle_id: vehicleId || null,
        },
      });

      // 创建行程参与者记录
      await tx.tripParticipant.create({
        data: {
          trip_id: tripId,
          ride_id: rideId,
          user_id: passengerId,
          role: 'passenger',
          status: 'upcoming',
          booked_seats: seats,
        },
      });

      // 更新行程剩余座位
      await tx.ride.update({
        where: { ride_id: rideId },
        data: {
          seats_left: {
            decrement: seats,
          },
        },
      });

      return newOrder;
    });

    return {
      ...order,
      trip_id: tripId,
    };
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'create-order',
      params: { passengerId, driverId, rideId, seats },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 7.3 获取司机及其车辆信息
 */
async function getDriverWithVehicles(driverId, requestId) {
  try {
    const driver = await prisma.authUser.findUnique({
      where: { user_id: driverId },
      include: {
        profile: true,
        vehicles: {
          where: { vehicle_status: 'active' },
        },
      },
    });

    return driver;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-driver-with-vehicles',
      params: { driverId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 7.4 根据ID获取订单
 */
async function getOrderById(orderId, requestId) {
  try {
    const order = await prisma.rideOrder.findUnique({
      where: { order_id: orderId },
    });

    return order;
  } catch (error) {
    logger.error({
      module: 'ride-dao',
      operate: 'get-order-by-id',
      params: { orderId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  searchRides,
  getSearchMetadata,
  getUserSearchPreferences,
  createRide,
  getUserVehicles,
  getUserFrequentLocations,
  getUserProfile,
  getRideById,
  createOrder,
  getDriverWithVehicles,
  getOrderById,
};
