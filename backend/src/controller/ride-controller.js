/**
 * 文件功能：行程控制器层
 * 关联业务：行程搜索、发布、详情、预约
 * 说明：负责参数校验、调用service、返回标准化响应
 */
const { logger } = require('../utils/logger');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');
const { maskSensitive } = require('../utils/mask-utils');
const {
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
} = require('../service/ride-service');

/**
 * 5.1 行程搜索
 */
async function searchRidesController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const {
    fromText,
    toText,
    departDate,
    page = 1,
    pageSize = 10,
    sortBy = 'time',
    priceMin,
    priceMax,
    seatsMin,
  } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    // 参数校验
    if (!fromText || !toText) {
      return res.status(400).json(buildFailureResponse(400, '出发地和目的地不能为空', null, requestId));
    }

    if (!departDate) {
      return res.status(400).json(buildFailureResponse(400, '出发日期不能为空', null, requestId));
    }

    const data = await searchRides({
      userId,
      fromText,
      toText,
      departDate,
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      seatsMin: seatsMin ? Number(seatsMin) : undefined,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'search-rides',
      params: { userId, fromText, toText, departDate },
      requestId,
      error: error?.message || '搜索行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '搜索行程失败', null, requestId));
  }
}

/**
 * 5.2 地理位置建议/自动补全
 */
async function getLocationSuggestionsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { keyword, latitude, longitude, limit = 10 } = req.query || {};

  try {
    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return res.status(400).json(buildFailureResponse(400, '关键词不能为空', null, requestId));
    }

    const data = await getLocationSuggestions({
      keyword: keyword.trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      limit: Number(limit),
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-location-suggestions',
      params: { keyword },
      requestId,
      error: error?.message || '获取位置建议失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取位置建议失败', null, requestId));
  }
}

/**
 * 5.3 获取搜索筛选元数据
 */
async function getSearchMetadataController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const data = await getSearchMetadata({ requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-search-metadata',
      requestId,
      error: error?.message || '获取搜索元数据失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取搜索元数据失败', null, requestId));
  }
}

/**
 * 5.4 获取用户搜索习惯/推荐
 */
async function getSearchPreferencesController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getSearchPreferences({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-search-preferences',
      params: { userId },
      requestId,
      error: error?.message || '获取搜索习惯失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取搜索习惯失败', null, requestId));
  }
}

/**
 * 6.1 发布拼车行程
 */
async function publishRideController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const {
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
  } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    // 参数校验
    if (!fromText || !toText) {
      return res.status(400).json(buildFailureResponse(400, '出发地和目的地不能为空', null, requestId));
    }

    if (!departAt) {
      return res.status(400).json(buildFailureResponse(400, '出发时间不能为空', null, requestId));
    }

    if (!seatsTotal || seatsTotal < 1 || seatsTotal > 6) {
      return res.status(400).json(buildFailureResponse(400, '座位数必须在1-6之间', null, requestId));
    }

    if (!price || price < 0) {
      return res.status(400).json(buildFailureResponse(400, '价格不能为空或负数', null, requestId));
    }

    const data = await publishRide({
      userId,
      fromText,
      fromLatitude: fromLatitude ? Number(fromLatitude) : null,
      fromLongitude: fromLongitude ? Number(fromLongitude) : null,
      toText,
      toLatitude: toLatitude ? Number(toLatitude) : null,
      toLongitude: toLongitude ? Number(toLongitude) : null,
      departAt: new Date(departAt),
      seatsTotal: Number(seatsTotal),
      price: Number(price),
      vehicleId,
      remark,
      requestId,
    });

    logger.info({
      module: 'ride-controller',
      operate: 'publish-ride',
      params: { userId, fromText, toText, departAt },
      result: 'Ride published successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'publish-ride',
      params: { userId, fromText, toText },
      requestId,
      error: error?.message || '发布行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '发布行程失败', null, requestId));
  }
}

/**
 * 6.2 初始化发布配置加载
 */
async function getPublishConfigController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getPublishConfig({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-publish-config',
      params: { userId },
      requestId,
      error: error?.message || '获取发布配置失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取发布配置失败', null, requestId));
  }
}

/**
 * 6.3 路径规划与耗时预估
 */
async function routePlanController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { fromLatitude, fromLongitude, toLatitude, toLongitude } = req.body || {};

  try {
    if (!fromLatitude || !fromLongitude || !toLatitude || !toLongitude) {
      return res.status(400).json(buildFailureResponse(400, '起终点坐标不能为空', null, requestId));
    }

    const data = await routePlan({
      fromLatitude: Number(fromLatitude),
      fromLongitude: Number(fromLongitude),
      toLatitude: Number(toLatitude),
      toLongitude: Number(toLongitude),
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'route-plan',
      params: { fromLatitude, fromLongitude, toLatitude, toLongitude },
      requestId,
      error: error?.message || '路径规划失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '路径规划失败', null, requestId));
  }
}

/**
 * 6.4 发布权限与信用校验
 */
async function checkPublishPermissionController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await checkPublishPermission({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'check-publish-permission',
      params: { userId },
      requestId,
      error: error?.message || '校验发布权限失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '校验发布权限失败', null, requestId));
  }
}

/**
 * 7.1 获取行程详情
 */
async function getRideDetailController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { rideId } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!rideId) {
      return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
    }

    const data = await getRideDetail({ rideId, userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-ride-detail',
      params: { userId, rideId },
      requestId,
      error: error?.message || '获取行程详情失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取行程详情失败', null, requestId));
  }
}

/**
 * 7.2 提交拼车预约
 */
async function bookRideController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { rideId, seats, remark } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!rideId) {
      return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
    }

    if (!seats || seats < 1) {
      return res.status(400).json(buildFailureResponse(400, '预约座位数不能为空', null, requestId));
    }

    const data = await bookRide({
      userId,
      rideId,
      seats: Number(seats),
      remark,
      requestId,
    });

    logger.info({
      module: 'ride-controller',
      operate: 'book-ride',
      params: { userId, rideId, seats },
      result: 'Ride booked successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'book-ride',
      params: { userId, rideId, seats },
      requestId,
      error: error?.message || '预约行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '预约行程失败', null, requestId));
  }
}

/**
 * 7.3 司机评价与车辆详情查询
 */
async function getDriverProfileController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { driverId } = req.query || {};

  try {
    if (!driverId) {
      return res.status(400).json(buildFailureResponse(400, '司机ID不能为空', null, requestId));
    }

    const data = await getDriverProfile({ driverId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'get-driver-profile',
      params: { driverId },
      requestId,
      error: error?.message || '获取司机信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取司机信息失败', null, requestId));
  }
}

/**
 * 7.4 隐私通讯接入
 */
async function privateContactController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { orderId } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!orderId) {
      return res.status(400).json(buildFailureResponse(400, '订单ID不能为空', null, requestId));
    }

    const data = await getPrivateContact({ userId, orderId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'ride-controller',
      operate: 'private-contact',
      params: { userId, orderId },
      requestId,
      error: error?.message || '获取隐私通讯信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取隐私通讯信息失败', null, requestId));
  }
}

module.exports = {
  searchRidesController,
  getLocationSuggestionsController,
  getSearchMetadataController,
  getSearchPreferencesController,
  publishRideController,
  getPublishConfigController,
  routePlanController,
  checkPublishPermissionController,
  getRideDetailController,
  bookRideController,
  getDriverProfileController,
  privateContactController,
};
