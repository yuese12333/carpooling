const express = require('express');
const router = express.Router();
const { listNotificationsController, clearNotificationsController } = require('../controller/notification-controller');

/**
 * GET /api/notifications  列表
 */
router.get('/', listNotificationsController);

/**
 * POST /api/notifications/clear  清除（支持 body.ids）
 */
router.post('/clear', clearNotificationsController);

module.exports = router;
