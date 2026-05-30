/**
 * 文件功能：用户中心路由层
 * 关联业务：用户资料、车辆信息、勋章、常用地点、支付方式、通知设置、退出登录、版本检测
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const {
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
} = require('../controller/profile-controller');

/**
 * 8.1 获取用户信息
 * 路径：GET /api/profile/info
 */
router.get('/info', authMiddleware, getProfileInfoController);

/**
 * 8.2 更新用户资料
 * 路径：POST /api/profile/update
 */
router.post('/update', authMiddleware, updateProfileController);

/**
 * 8.3 获取车辆详情
 * 路径：GET /api/profile/car
 */
router.get('/car', authMiddleware, getVehicleController);

/**
 * 8.4 更新车辆信息
 * 路径：POST /api/profile/car/update
 */
router.post('/car/update', authMiddleware, updateVehicleController);

/**
 * 8.5 获取成就勋章列表
 * 路径：GET /api/profile/badges
 */
router.get('/badges', authMiddleware, getBadgesController);

/**
 * 8.6 获取常用地点
 * 路径：GET /api/profile/frequent-locations
 */
router.get('/frequent-locations', authMiddleware, getFrequentLocationsController);

/**
 * 8.7 更新常用地点
 * 路径：POST /api/profile/frequent-locations/update
 */
router.post('/frequent-locations/update', authMiddleware, updateFrequentLocationsController);

/**
 * 8.8 获取支付方式状态
 * 路径：GET /api/profile/payment-methods
 */
router.get('/payment-methods', authMiddleware, getPaymentMethodsController);

/**
 * 8.9 获取通知设置
 * 路径：GET /api/profile/notification-settings
 */
router.get('/notification-settings', authMiddleware, getNotificationSettingsController);

/**
 * 8.10 更新通知设置
 * 路径：POST /api/profile/notification-settings/update
 */
router.post('/notification-settings/update', authMiddleware, updateNotificationSettingsController);

/**
 * 8.11 退出登录
 * 路径：POST /api/profile/logout
 */
router.post('/logout', authMiddleware, logoutController);

/**
 * 8.12 版本检测
 * 路径：GET /api/profile/version/check
 */
router.get('/version/check', checkVersionController);

module.exports = router;
