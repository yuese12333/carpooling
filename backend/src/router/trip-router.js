/**
 * 文件功能：行程管理路由层
 * 关联业务：行程列表、取消、详情、评价、复用
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

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
router.get('/list', getTripListController);

/**
 * 9.2 取消行程
 * 路径：POST /api/trips/cancel
 */
router.post('/cancel', cancelTripController);

/**
 * 9.3 获取行程详情
 * 路径：GET /api/trips/detail
 */
router.get('/detail', getTripDetailController);

/**
 * 9.4 评价行程
 * 路径：POST /api/trips/rate
 */
router.post('/rate', rateTripController);

/**
 * 9.5 再次预约/复用行程
 * 路径：GET /api/trips/template
 */
router.get('/template', getTripTemplateController);

/**
 * 9.6 获取联系人隐私信息
 * 路径：GET /api/trips/contact
 */
router.get('/contact', getContactInfoController);

/**
 * 9.7 获取取消原因枚举
 * 路径：GET /api/trips/cancel-reasons
 */
router.get('/cancel-reasons', getCancelReasonsController);

module.exports = router;
