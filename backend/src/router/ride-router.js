/**
 * 文件功能：行程路由层
 * 关联业务：行程搜索、发布、详情
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

const {
  searchRidesController,
  getLocationSuggestionsController,
  getSearchMetadataController,
  getSearchPreferencesController,
  publishRideController,
  getPublishConfigController,
  routePlanController,
  checkPublishPermissionController,
  getRideDetailController,
  bookRideController,
  getDriverProfileController,
  privateContactController,
} = require('../controller/ride-controller');

/**
 * 5.1 行程搜索
 * 路径：GET /api/rides/search
 */
router.get('/search', searchRidesController);

/**
 * 5.2 地理位置建议/自动补全
 * 路径：GET /api/common/location/suggestions
 * 注意：这个接口应该放在common-router中，但为了保持与接口文档一致，这里保留占位
 */

/**
 * 5.3 获取搜索筛选元数据
 * 路径：GET /api/rides/search-metadata
 */
router.get('/search-metadata', getSearchMetadataController);

/**
 * 5.4 获取用户搜索习惯/推荐
 * 路径：GET /api/rides/search-preferences
 */
router.get('/search-preferences', getSearchPreferencesController);

/**
 * 6.1 发布拼车行程
 * 路径：POST /api/rides/publish
 */
router.post('/publish', publishRideController);

/**
 * 6.2 初始化发布配置加载
 * 路径：GET /api/rides/publish-config
 */
router.get('/publish-config', getPublishConfigController);

/**
 * 6.3 路径规划与耗时预估
 * 路径：POST /api/rides/route-plan
 */
router.post('/route-plan', routePlanController);

/**
 * 6.4 发布权限与信用校验
 * 路径：GET /api/rides/publish-permission
 */
router.get('/publish-permission', checkPublishPermissionController);

/**
 * 7.1 获取行程详情
 * 路径：GET /api/rides/detail
 */
router.get('/detail', getRideDetailController);

/**
 * 7.2 提交拼车预约
 * 路径：POST /api/orders/book
 */
router.post('/orders/book', bookRideController);

/**
 * 7.3 司机评价与车辆详情查询
 * 路径：GET /api/rides/driver-profile
 */
router.get('/driver-profile', getDriverProfileController);

/**
 * 7.4 隐私通讯接入
 * 路径：POST /api/orders/private-contact
 */
router.post('/orders/private-contact', privateContactController);

module.exports = router;
