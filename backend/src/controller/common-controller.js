/**
 * 文件功能：公共功能控制器层
 * 关联业务：地点建议、协议内容、事件日志、配置信息、协议检测、错误日志、性能日志
 * 说明：负责参数校验、调用service、返回标准化响应
 */
const { logger } = require('../utils/logger');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');

/**
 * 10.1 获取地点建议
 */
async function getLocationSuggestionsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { keyword, city } = req.query || {};

  try {
    if (!keyword) {
      return res.status(400).json(buildFailureResponse(400, '关键词不能为空', null, requestId));
    }

    const data = await getLocationSuggestions({ keyword, city, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'get-location-suggestions',
      params: { keyword, city },
      requestId,
      error: error?.message || '获取地点建议失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取地点建议失败', null, requestId));
  }
}

/**
 * 10.2 获取协议内容
 */
async function getProtocolController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { type } = req.query || {};

  try {
    if (!type) {
      return res.status(400).json(buildFailureResponse(400, '协议类型不能为空', null, requestId));
    }

    const data = await getProtocol({ type, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'get-protocol',
      params: { type },
      requestId,
      error: error?.message || '获取协议内容失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取协议内容失败', null, requestId));
  }
}

/**
 * 10.3 上报事件日志
 */
async function reportEventLogController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { eventType, eventData, page, timestamp } = req.body || {};

  try {
    if (!eventType) {
      return res.status(400).json(buildFailureResponse(400, '事件类型不能为空', null, requestId));
    }

    const data = await reportEventLog({
      userId,
      eventType,
      eventData,
      page,
      timestamp,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'report-event-log',
      params: { userId, eventType },
      requestId,
      error: error?.message || '上报事件日志失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '上报事件日志失败', null, requestId));
  }
}

/**
 * 10.4 获取配置信息
 */
async function getConfigController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { keys } = req.query || {};

  try {
    const data = await getConfig({ keys: keys?.split(','), requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'get-config',
      params: { keys },
      requestId,
      error: error?.message || '获取配置信息失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '获取配置信息失败', null, requestId));
  }
}

/**
 * 10.5 检测协议更新
 */
async function checkProtocolUpdateController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const { type, version } = req.query || {};

  try {
    if (!type || !version) {
      return res.status(400).json(buildFailureResponse(400, '协议类型和版本号不能为空', null, requestId));
    }

    const data = await checkProtocolUpdate({ type, version, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'check-protocol-update',
      params: { type, version },
      requestId,
      error: error?.message || '检测协议更新失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '检测协议更新失败', null, requestId));
  }
}

/**
 * 10.6 上报错误日志
 */
async function reportErrorLogController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { errorType, errorMessage, errorStack, page, timestamp } = req.body || {};

  try {
    if (!errorType || !errorMessage) {
      return res.status(400).json(buildFailureResponse(400, '错误类型和错误信息不能为空', null, requestId));
    }

    const data = await reportErrorLog({
      userId,
      errorType,
      errorMessage,
      errorStack,
      page,
      timestamp,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'report-error-log',
      params: { userId, errorType },
      requestId,
      error: error?.message || '上报错误日志失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '上报错误日志失败', null, requestId));
  }
}

/**
 * 10.7 上报性能日志
 */
async function reportPerformanceLogController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { metrics, page, timestamp } = req.body || {};

  try {
    if (!metrics) {
      return res.status(400).json(buildFailureResponse(400, '性能指标不能为空', null, requestId));
    }

    const data = await reportPerformanceLog({
      userId,
      metrics,
      page,
      timestamp,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'report-performance-log',
      params: { userId },
      requestId,
      error: error?.message || '上报性能日志失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '上报性能日志失败', null, requestId));
  }
}

/**
 * 10.8 批量上报事件日志
 */
async function reportEventLogsBatchController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { events } = req.body || {};

  try {
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json(buildFailureResponse(400, '事件列表不能为空', null, requestId));
    }

    const data = await reportEventLogsBatch({
      userId,
      events,
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'common-controller',
      operate: 'report-event-logs-batch',
      params: { userId },
      requestId,
      error: error?.message || '批量上报事件日志失败',
      errorType: error?.name || 'UnknownError',
    });
    const status = error?.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error?.message || '批量上报事件日志失败', null, requestId));
  }
}

module.exports = {
  getLocationSuggestionsController,
  getProtocolController,
  reportEventLogController,
  getConfigController,
  checkProtocolUpdateController,
  reportErrorLogController,
  reportPerformanceLogController,
  reportEventLogsBatchController,
};