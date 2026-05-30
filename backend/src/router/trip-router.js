/**
 * 文件功能：行程管理路由层
 * 关联业务：行程列表、取消、详情、评价、复用
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const {
  getTripListController,
  cancelTripController,
  getTripDetailController,
  rateTripController,
  getTripTemplateController,
  getContactInfoController,
  getCancelReasonsController,
} = require('../controller/trip-controller');

/**
 * 9.1 获取行程列表
 * 路径：GET /api/trips/list
 */
router.get('/list', authMiddleware, getTripListController);

/**
 * 9.2 取消行程
 * 路径：POST /api/trips/cancel
 */
router.post('/cancel', authMiddleware, cancelTripController);

/**
 * 9.3 获取行程详情
 * 路径：GET /api/trips/detail
 */
router.get('/detail', authMiddleware, getTripDetailController);

/**
 * 9.4 评价行程
 * 路径：POST /api/trips/rate
 */
router.post('/rate', authMiddleware, rateTripController);

/**
 * 9.5 再次预约/复用行程
 * 路径：GET /api/trips/template
 */
router.get('/template', authMiddleware, getTripTemplateController);

/**
 * 9.6 获取联系人隐私信息
 * 路径：GET /api/trips/contact
 */
router.get('/contact', authMiddleware, getContactInfoController);

/**
 * 9.7 获取取消原因枚举
 * 路径：GET /api/trips/cancel-reasons
 */
router.get('/cancel-reasons', getCancelReasonsController);

/**
 * 参数路由：必须放在所有具体路径之后，避免拦截 /cancel-reasons 等路径
 */
router.get('/:tripId', authMiddleware, getTripDetailController);
router.post('/:tripId/cancel', authMiddleware, cancelTripController);
router.post('/:tripId/rate', authMiddleware, rateTripController);
router.get('/:tripId/contact', authMiddleware, getContactInfoController);

module.exports = router;
