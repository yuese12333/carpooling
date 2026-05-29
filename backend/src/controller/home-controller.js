/**
 * 文件功能：首页控制器层
 * 关联业务：首页用户信息、推荐行程、系统统计、未读通知
 * 说明：负责参数校验、调用service、返回标准化响应
 */
const { logger } = require('../utils/logger');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');
const { maskSensitive } = require('../utils/mask-utils');
const {
  getUserInfo,
  getRecommendRides,
  getStatistics,
  getUnreadStatus,
} = require('../service/home-service');

/**
 * 函数功能：处理"获取当前用户信息"接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function getUserInfoController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId; // 从JWT中间件获取

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getUserInfo({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'home-controller',
      operate: 'get-user-info',
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
 * 函数功能：处理"获取推荐行程列表"接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function getRecommendRidesController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { page = 1, pageSize = 10, latitude, longitude } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getRecommendRides({
      userId,
      page: Number(page),
      pageSize: Number(pageSize),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'home-controller',
      operate: 'get-recommend-rides',
      params: { userId, page, pageSize },
      requestId,
      error: error?.message || '获取推荐行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取推荐行程失败', null, requestId));
  }
}

/**
 * 函数功能：处理"获取系统统计数据"接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function getStatisticsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const data = await getStatistics({ requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'home-controller',
      operate: 'get-statistics',
      requestId,
      error: error?.message || '获取统计数据失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取统计数据失败', null, requestId));
  }
}

/**
 * 函数功能：处理"获取未读通知状态"接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function getUnreadStatusController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getUnreadStatus({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'home-controller',
      operate: 'get-unread-status',
      params: { userId },
      requestId,
      error: error?.message || '获取未读通知状态失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取未读通知状态失败', null, requestId));
  }
}

module.exports = {
  getUserInfoController,
  getRecommendRidesController,
  getStatisticsController,
  getUnreadStatusController,
};
