/**
 * 文件功能：首页路由层
 * 关联业务：首页用户信息、推荐行程、系统统计、未读通知
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const {
  getUserInfoController,
  getRecommendRidesController,
  getStatisticsController,
  getUnreadStatusController,
} = require('../controller/home-controller');

/**
 * 4.1 获取当前用户信息
 * 路径：GET /api/home/user-info
 */
router.get('/user-info', authMiddleware, getUserInfoController);

/**
 * 4.2 获取推荐行程列表
 * 路径：GET /api/home/rides/recommend
 */
router.get('/rides/recommend', authMiddleware, getRecommendRidesController);

/**
 * 4.3 获取系统统计数据
 * 路径：GET /api/home/statistics
 */
router.get('/statistics', getStatisticsController);

/**
 * 4.4 获取未读通知状态
 * 路径：GET /api/home/notifications/unread-status
 */
router.get('/notifications/unread-status', authMiddleware, getUnreadStatusController);

module.exports = router;
