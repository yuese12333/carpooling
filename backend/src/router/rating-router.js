/**
 * 文件功能：评价路由层
 * 关联业务：行程评价
 */
const express = require('express');
const {
  getTagsController,
  submitRatingController,
  getOrderRatingsController,
  getUserRatingsController,
  getMyStatsController,
} = require('../controller/rating-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// 获取评价标签（公开）
router.get('/tags', getTagsController);

// 获取当前用户评分统计（需登录）
router.get('/stats', authMiddleware, getMyStatsController);

// 提交评价（需登录）
router.post('/', authMiddleware, submitRatingController);

// 获取订单评价（公开）
router.get('/order/:orderId', getOrderRatingsController);

// 获取用户评价（公开）
router.get('/user/:userId', getUserRatingsController);

module.exports = router;
