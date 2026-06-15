/**
 * 文件功能：公共功能数据访问层
 * 关联业务：地点建议、协议内容、事件日志、配置信息、协议检测、错误日志、性能日志
 * 说明：负责数据库操作、不包含业务逻辑
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 10.1 搜索地点
 */
async function searchLocations(keyword, city, requestId) {
  try {
    const locations = await prisma.userLocation.findMany({
      where: {
        is_deleted: false,
        OR: [
          { label: { contains: keyword } },
          { address: { contains: keyword } },
        ],
        ...(city && { address: { contains: city } }),
      },
      take: 10,
      orderBy: { updated_at: 'desc' },
    });

    return locations.map((loc) => ({
      name: loc.label,
      address: loc.address,
      latitude: loc.latitude ? parseFloat(loc.latitude) : null,
      longitude: loc.longitude ? parseFloat(loc.longitude) : null,
      city: city || '',
      district: '',
    }));
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'search-locations',
      params: { keyword, city },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.2 根据类型获取协议
 */
async function getProtocolByType(type, requestId) {
  try {
    const protocol = await prisma.protocol.findUnique({
      where: { type },
    });

    if (!protocol) {
      const error = new Error('协议不存在');
      error.statusCode = 404;
      throw error;
    }

    return {
      type: protocol.type,
      title: protocol.title,
      content: protocol.content,
      version: protocol.version,
      updated_at: protocol.updated_at,
      force_update: protocol.force_update,
    };
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'get-protocol-by-type',
      params: { type },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.3 创建事件日志
 */
async function createEventLog(logData, requestId) {
  try {
    const log = await prisma.eventLog.create({
      data: {
        user_id: logData.userId || null,
        event_type: logData.eventType,
        event_data: logData.eventData || null,
        device_info: logData.deviceInfo || null,
        ip_address: logData.ipAddress || null,
      },
    });

    logger.info({
      module: 'common-dao',
      operate: 'create-event-log',
      params: { userId: logData.userId, eventType: logData.eventType },
      requestId,
      result: 'Event log created',
    });

    return { success: true, id: log.id };
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'create-event-log',
      params: { userId: logData.userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.4 获取配置信息
 */
async function getConfigs(keys, requestId) {
  try {
    const whereClause = keys && keys.length > 0
      ? { config_key: { in: keys } }
      : {};

    const configs = await prisma.systemConfig.findMany({
      where: whereClause,
    });

    return configs.map((config) => ({
      config_key: config.config_key,
      config_value: config.config_value,
      description: config.description,
    }));
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'get-configs',
      params: { keys },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.6 创建错误日志
 */
async function createErrorLog(logData, requestId) {
  try {
    const log = await prisma.errorLog.create({
      data: {
        user_id: logData.userId || null,
        error_type: logData.errorType,
        error_message: logData.errorMessage,
        stack_trace: logData.stackTrace || null,
        request_url: logData.requestUrl || null,
        request_data: logData.requestData ? JSON.stringify(logData.requestData) : null,
        device_info: logData.deviceInfo || null,
        ip_address: logData.ipAddress || null,
      },
    });

    logger.info({
      module: 'common-dao',
      operate: 'create-error-log',
      params: { userId: logData.userId, errorType: logData.errorType },
      requestId,
      result: 'Error log created',
    });

    return { success: true, id: log.id };
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'create-error-log',
      params: { userId: logData.userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.7 创建性能日志
 */
async function createPerformanceLog(logData, requestId) {
  try {
    const log = await prisma.performanceLog.create({
      data: {
        user_id: logData.userId || null,
        operation_type: logData.operationType,
        duration_ms: logData.durationMs,
        request_url: logData.requestUrl || null,
        device_info: logData.deviceInfo || null,
      },
    });

    logger.info({
      module: 'common-dao',
      operate: 'create-performance-log',
      params: { userId: logData.userId, operationType: logData.operationType },
      requestId,
      result: 'Performance log created',
    });

    return { success: true, id: log.id };
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'create-performance-log',
      params: { userId: logData.userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 10.8 批量创建事件日志
 */
async function createEventLogsBatch(logs, requestId) {
  try {
    const result = await prisma.eventLog.createMany({
      data: logs.map((log) => ({
        user_id: log.userId || null,
        event_type: log.eventType,
        event_data: log.eventData || null,
        device_info: log.deviceInfo || null,
        ip_address: log.ipAddress || null,
      })),
    });

    logger.info({
      module: 'common-dao',
      operate: 'create-event-logs-batch',
      params: { count: logs.length },
      requestId,
      result: 'Event logs batch created',
    });

    return { success: true, count: result.count };
  } catch (error) {
    logger.error({
      module: 'common-dao',
      operate: 'create-event-logs-batch',
      params: { count: logs.length },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  searchLocations,
  getProtocolByType,
  createEventLog,
  getConfigs,
  createErrorLog,
  createPerformanceLog,
  createEventLogsBatch,
};
