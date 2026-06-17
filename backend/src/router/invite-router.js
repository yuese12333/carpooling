/**
 * 文件功能：邀请码路由层
 * 关联业务：邀请码管理
 */
const express = require('express');
const {
  getMyCodeController,
  useCodeController,
  getHistoryController,
  getStatsController,
} = require('../controller/invite-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// 所有接口都需要登录
router.use(authMiddleware);

// 获取我的邀请码
router.get('/my-code', getMyCodeController);

// 使用邀请码
router.post('/use', useCodeController);

// 获取邀请记录
router.get('/history', getHistoryController);

// 获取邀请统计
router.get('/stats', getStatsController);

module.exports = router;
