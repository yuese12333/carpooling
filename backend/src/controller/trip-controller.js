/**
 * 文件功能：行程管理控制器层
 * 关联业务：行程列表、取消行程、行程详情、评价行程、行程模板、联系信息、取消原因
 * 说明：负责参数校验、调用service、返回标准化响应
 */
const { logger } = require('../utils/logger');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');

/**
 * 9.1 获取行程列表
 */
async function getTripListController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { status, page = 1, pageSize = 10 } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getTripList({
      userId,
      status,
      page: Number(page),
      pageSize: Number(pageSize),
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'get-trip-list',
      params: { userId, status },
      requestId,
      error: error?.message || '获取行程列表失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取行程列表失败', null, requestId));
  }
}

/**
 * 9.2 取消行程
 */
async function cancelTripController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { tripId, cancelReason, cancelDescription } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!tripId) {
      return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
    }

    const data = await cancelTrip({
      userId,
      tripId,
      cancelReason,
      cancelDescription,
      requestId,
    });

    logger.info({
      module: 'trip-controller',
      operate: 'cancel-trip',
      params: { userId, tripId },
      result: 'Trip cancelled successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'cancel-trip',
      params: { userId, tripId },
      requestId,
      error: error?.message || '取消行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '取消行程失败', null, requestId));
  }
}

/**
 * 9.3 获取行程详情
 */
async function getTripDetailController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { tripId } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!tripId) {
      return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
    }

    const data = await getTripDetail({ userId, tripId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'get-trip-detail',
      params: { userId, tripId },
      requestId,
      error: error?.message || '获取行程详情失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取行程详情失败', null, requestId));
  }
}

/**
 * 9.4 评价行程
 */
async function rateTripController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { tripId, rating, comment, tags } = req.body || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!tripId || !rating) {
      return res.status(400).json(buildFailureResponse(400, '行程ID和评分不能为空', null, requestId));
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json(buildFailureResponse(400, '评分必须在1-5之间', null, requestId));
    }

    const data = await rateTrip({
      userId,
      tripId,
      rating: Number(rating),
      comment,
      tags,
      requestId,
    });

    logger.info({
      module: 'trip-controller',
      operate: 'rate-trip',
      params: { userId, tripId, rating },
      result: 'Trip rated successfully',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'rate-trip',
      params: { userId, tripId },
      requestId,
      error: error?.message || '评价行程失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '评价行程失败', null, requestId));
  }
}

/**
 * 9.5 获取行程模板
 */
async function getTripTemplateController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    const data = await getTripTemplate({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'get-trip-template',
      params: { userId },
      requestId,
      error: error?.message || '获取行程模板失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取行程模板失败', null, requestId));
  }
}

/**
 * 9.6 获取联系信息
 */
async function getContactInfoController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { tripId } = req.query || {};

  try {
    if (!userId) {
      return res.status(401).json(buildFailureResponse(401, '未授权访问', null, requestId));
    }

    if (!tripId) {
      return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
    }

    const data = await getContactInfo({ userId, tripId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'get-contact-info',
      params: { userId, tripId },
      requestId,
      error: error?.message || '获取联系信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取联系信息失败', null, requestId));
  }
}

/**
 * 9.7 获取取消原因列表
 */
async function getCancelReasonsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { type = 'passenger' } = req.query || {};

  try {
    const data = await getCancelReasons({ type, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'trip-controller',
      operate: 'get-cancel-reasons',
      params: { type },
      requestId,
      error: error?.message || '获取取消原因失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取取消原因失败', null, requestId));
  }
}

module.exports = {
  getTripListController,
  cancelTripController,
  getTripDetailController,
  rateTripController,
  getTripTemplateController,
  getContactInfoController,
  getCancelReasonsController,
};