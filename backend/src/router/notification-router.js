const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');

const { listNotificationsController, clearNotificationsController } = require('../controller/notification-controller');

/**
 * GET /api/notifications  列表
 */
router.get('/', authMiddleware, listNotificationsController);

/**
 * POST /api/notifications/clear  清除（支持 body.ids）
 */
router.post('/clear', authMiddleware, clearNotificationsController);

module.exports = router;
