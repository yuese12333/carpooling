/**
 * 文件功能：用户中心控制器层
 * 关联业务：用户资料、车辆信息、勋章、常用地点、支付方式、通知设置、退出登录、版本检测
 * 说明：负责参数校验、调用service、返回标准化响应
 */
const { logger } = require('../utils/logger');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');
const { maskSensitive } = require('../utils/mask');

/**
 * 8.1 获取用户信息
 */
async function getProfileInfoController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getProfileInfo({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-profile-info',
      params: { userId },
      requestId,
      error: error?.message || '获取用户信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取用户信息失败', null, requestId));
  }
}

/**
 * 8.2 更新用户资料
 */
async function updateProfileController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { userName, avatarUrl, gender, birthday } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await updateProfile({
      userId,
      userName,
      avatarUrl,
      gender,
      birthday,
      requestId,
    });

    logger.info({
      module: 'profile-controller',
      operate: 'update-profile',
      params: { userId },
      result: 'Profile updated successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'update-profile',
      params: { userId },
      requestId,
      error: error?.message || '更新用户资料失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '更新用户资料失败', null, requestId));
  }
}

/**
 * 8.3 获取车辆详情
 */
async function getVehicleController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { vehicleId } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getVehicle({ userId, vehicleId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-vehicle',
      params: { userId, vehicleId },
      requestId,
      error: error?.message || '获取车辆信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取车辆信息失败', null, requestId));
  }
}

/**
 * 8.4 更新车辆信息
 */
async function updateVehicleController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { vehicleId, plateNumber, brand, model, color, seatTotal } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!plateNumber || !brand || !model) {
      return res.status(400).json(buildFailureResponse(400, '车牌号、品牌、型号不能为空', null, requestId));
    }

    const data = await updateVehicle({
      userId,
      vehicleId,
      plateNumber,
      brand,
      model,
      color,
      seatTotal: seatTotal ? Number(seatTotal) : 5,
      requestId,
    });

    logger.info({
      module: 'profile-controller',
      operate: 'update-vehicle',
      params: { userId, vehicleId },
      result: 'Vehicle updated successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'update-vehicle',
      params: { userId, vehicleId },
      requestId,
      error: error?.message || '更新车辆信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '更新车辆信息失败', null, requestId));
  }
}

/**
 * 8.5 获取成就勋章列表
 */
async function getBadgesController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getBadges({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-badges',
      params: { userId },
      requestId,
      error: error?.message || '获取勋章列表失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取勋章列表失败', null, requestId));
  }
}

/**
 * 8.6 获取常用地点
 */
async function getFrequentLocationsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getFrequentLocations({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-frequent-locations',
      params: { userId },
      requestId,
      error: error?.message || '获取常用地点失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取常用地点失败', null, requestId));
  }
}

/**
 * 8.7 更新常用地点
 */
async function updateFrequentLocationsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { locations } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json(buildFailureResponse(400, '地点列表格式错误', null, requestId));
    }

    const data = await updateFrequentLocations({ userId, locations, requestId });

    logger.info({
      module: 'profile-controller',
      operate: 'update-frequent-locations',
      params: { userId },
      result: 'Frequent locations updated successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'update-frequent-locations',
      params: { userId },
      requestId,
      error: error?.message || '更新常用地点失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '更新常用地点失败', null, requestId));
  }
}

/**
 * 8.8 获取支付方式状态
 */
async function getPaymentMethodsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getPaymentMethods({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-payment-methods',
      params: { userId },
      requestId,
      error: error?.message || '获取支付方式失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取支付方式失败', null, requestId));
  }
}

/**
 * 8.9 获取通知设置
 */
async function getNotificationSettingsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getNotificationSettings({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'get-notification-settings',
      params: { userId },
      requestId,
      error: error?.message || '获取通知设置失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取通知设置失败', null, requestId));
  }
}

/**
 * 8.10 更新通知设置
 */
async function updateNotificationSettingsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { settings } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json(buildFailureResponse(400, '设置格式错误', null, requestId));
    }

    const data = await updateNotificationSettings({ userId, settings, requestId });

    logger.info({
      module: 'profile-controller',
      operate: 'update-notification-settings',
      params: { userId },
      result: 'Notification settings updated successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'update-notification-settings',
      params: { userId },
      requestId,
      error: error?.message || '更新通知设置失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '更新通知设置失败', null, requestId));
  }
}

/**
 * 8.11 退出登录
 */
async function logoutController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await logout({ userId, requestId });

    logger.info({
      module: 'profile-controller',
      operate: 'logout',
      params: { userId },
      result: 'User logged out successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'logout',
      params: { userId },
      requestId,
      error: error?.message || '退出登录失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '退出登录失败', null, requestId));
  }
}

/**
 * 8.12 版本检测
 */
async function checkVersionController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { platform, currentVersion } = req.query || {};

  try {
    if (!platform || !currentVersion) {
      return res.status(400).json(buildFailureResponse(400, '平台和版本号不能为空', null, requestId));
    }

    const data = await checkVersion({ platform, currentVersion, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'profile-controller',
      operate: 'check-version',
      params: { platform, currentVersion },
      requestId,
      error: error?.message || '版本检测失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '版本检测失败', null, requestId));
  }
}

module.exports = {
  getProfileInfoController,
  updateProfileController,
  getVehicleController,
  updateVehicleController,
  getBadgesController,
  getFrequentLocationsController,
  updateFrequentLocationsController,
  getPaymentMethodsController,
  getNotificationSettingsController,
  updateNotificationSettingsController,
  logoutController,
  checkVersionController,
};