/**
 * 文件功能：公共功能服务层
 * 关联业务：地点建议、协议内容、事件日志、配置信息、协议检测、错误日志、性能日志
 * 说明：负责业务逻辑处理、调用DAO层
 */
const { logger } = require('../utils/logger');
const commonDao = require('../dao/common-dao');
const mapService = require('../utils/map-service');

/**
 * 10.1 获取地点建议
 * 入参：keyword（字符串，搜索关键字）、city（字符串，城市名）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - 包含 suggestions 数组
 */
async function getLocationSuggestions({ keyword, city, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'get-location-suggestions',
    params: { keyword, city },
    requestId,
    result: 'Fetching location suggestions',
  });

  const mapSuggestions = await mapService.searchPlaces(keyword, city, 10, requestId);
  const dbSuggestions = await commonDao.searchLocations(keyword, city, requestId);

  const allSuggestions = [
    ...mapSuggestions,
    ...dbSuggestions.filter((db) =>
      !mapSuggestions.some((map) =>
        map.name === db.name || Math.abs(map.latitude - db.latitude) < 0.001
      )
    ),
  ];

  return {
    suggestions: allSuggestions.slice(0, 10).map((s) => ({
      name: s.name,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      city: s.city,
      district: s.district,
    })),
  };
}

/**
 * 10.2 获取协议内容
 * 入参：type（字符串，协议类型）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - 协议内容对象
 */
async function getProtocol({ type, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'get-protocol',
    params: { type },
    requestId,
    result: 'Fetching protocol',
  });

  const protocol = await commonDao.getProtocolByType(type, requestId);

  return {
    type: protocol.type,
    title: protocol.title,
    content: protocol.content,
    version: protocol.version,
    updatedAt: protocol.updated_at,
  };
}

/**
 * 10.3 上报事件日志
 * 入参：userId（字符串，用户ID）、eventType（字符串，事件类型）、eventData（对象，事件数据）、page（字符串，页面标识）、timestamp（字符串，时间戳）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - { success: boolean }
 */
async function reportEventLog({ userId, eventType, eventData, page, timestamp, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'report-event-log',
    params: { userId, eventType },
    requestId,
    result: 'Reporting event log',
  });

  await commonDao.createEventLog({
    userId,
    eventType,
    eventData,
    page,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  }, requestId);

  return { success: true };
}

/**
 * 10.4 获取配置信息
 * 入参：keys（数组，配置键名列表）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - 配置键值对对象
 */
async function getConfig({ keys, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'get-config',
    params: { keys },
    requestId,
    result: 'Fetching config',
  });

  const configs = await commonDao.getConfigs(keys, requestId);

  return {
    configs: configs.reduce((acc, config) => {
      acc[config.config_key] = {
        value: config.config_value,
        description: config.description,
      };
      return acc;
    }, {}),
  };
}

/**
 * 10.5 检测协议更新
 * 入参：type（字符串，协议类型）、version（字符串，当前版本）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - { needUpdate, latestVersion, forceUpdate }
 */
async function checkProtocolUpdate({ type, version, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'check-protocol-update',
    params: { type, version },
    requestId,
    result: 'Checking protocol update',
  });

  const protocol = await commonDao.getProtocolByType(type, requestId);

  const needUpdate = version < protocol.version;

  return {
    needUpdate,
    latestVersion: protocol.version,
    forceUpdate: protocol.force_update || false,
  };
}

/**
 * 10.6 上报错误日志
 * 入参：userId（字符串，用户ID）、errorType（字符串，错误类型）、errorMessage（字符串，错误消息）、errorStack（字符串，错误堆栈）、page（字符串，页面标识）、timestamp（字符串，时间戳）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - { success: boolean }
 */
async function reportErrorLog({ userId, errorType, errorMessage, errorStack, page, timestamp, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'report-error-log',
    params: { userId, errorType },
    requestId,
    result: 'Reporting error log',
  });

  await commonDao.createErrorLog({
    userId,
    errorType,
    errorMessage,
    errorStack,
    page,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  }, requestId);

  return { success: true };
}

/**
 * 10.7 上报性能日志
 * 入参：userId（字符串，用户ID）、metrics（对象，性能指标）、page（字符串，页面标识）、timestamp（字符串，时间戳）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - { success: boolean }
 */
async function reportPerformanceLog({ userId, metrics, page, timestamp, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'report-performance-log',
    params: { userId },
    requestId,
    result: 'Reporting performance log',
  });

  // 从 metrics 对象中提取字段
  const { operationType, pageLoadTime, apiResponseTime, requestUrl, deviceInfo } = metrics || {};

  await commonDao.createPerformanceLog({
    userId,
    operationType: operationType || page || 'page_load',
    durationMs: pageLoadTime || apiResponseTime || 0,
    requestUrl,
    deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
  }, requestId);

  return { success: true };
}

/**
 * 10.8 批量上报事件日志
 * 入参：userId（字符串，用户ID）、events（数组，事件列表）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - { success: boolean, count: number }
 */
async function reportEventLogsBatch({ userId, events, requestId }) {
  logger.info({
    module: 'common-service',
    operate: 'report-event-logs-batch',
    params: { userId, eventCount: events.length },
    requestId,
    result: 'Reporting event logs batch',
  });

  await commonDao.createEventLogsBatch(
    events.map((event) => ({
      userId,
      eventType: event.eventType,
      eventData: event.eventData,
      page: event.page,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    })),
    requestId
  );

  return { success: true, count: events.length };
}

module.exports = {
  getLocationSuggestions,
  getProtocol,
  reportEventLog,
  getConfig,
  checkProtocolUpdate,
  reportErrorLog,
  reportPerformanceLog,
  reportEventLogsBatch,
};
