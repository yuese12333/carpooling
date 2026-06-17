/**
 * 文件功能：公共配置与日志路由层
 * 关联业务：协议内容、埋点日志、运行配置、错误上报、性能上报
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

const optionalAuthMiddleware = require('../middleware/optional-auth-middleware');

const {
  getLocationSuggestionsController,
  getProtocolController,
  reportEventLogController,
  getConfigController,
  checkProtocolUpdateController,
  reportErrorLogController,
  reportPerformanceLogController,
  reportEventLogsBatchController,
  getCancelReasonsController,
} = require('../controller/common-controller');

/**
 * 5.2 地理位置建议/自动补全
 * 路径：GET /api/common/location/suggestions
 */
router.get('/location/suggestions', getLocationSuggestionsController);

/**
 * 10.1 获取协议内容
 * 路径：GET /api/common/protocol
 */
router.get('/protocol', getProtocolController);

/**
 * 10.2 埋点日志上报
 * 路径：POST /api/logs/event
 */
router.post('/logs/event', optionalAuthMiddleware, reportEventLogController);

/**
 * 10.3 获取App运行配置
 * 路径：GET /api/common/config
 */
router.get('/config', getConfigController);

/**
 * 10.4 协议版本校验
 * 路径：GET /api/common/protocol/check
 */
router.get('/protocol/check', checkProtocolUpdateController);

/**
 * 10.5 前端异常/崩溃上报
 * 路径：POST /api/logs/error
 */
router.post('/logs/error', optionalAuthMiddleware, reportErrorLogController);

/**
 * 10.6 性能指标上报
 * 路径：POST /api/logs/perf
 */
router.post('/logs/perf', optionalAuthMiddleware, reportPerformanceLogController);

/**
 * 10.7 批量行为埋点上报
 * 路径：POST /api/logs/events/batch
 */
router.post('/logs/events/batch', optionalAuthMiddleware, reportEventLogsBatchController);

/**
 * 获取取消原因列表
 * 路径：GET /api/common/cancel-reasons
 */
router.get('/cancel-reasons', getCancelReasonsController);

module.exports = router;
