/**
 * 文件功能：用户路由层
 * 关联业务：数据库 schema 检查（Prisma 管理）
 */
const express = require('express');
const {
  createRequestId,
  buildFailureResponse,
} = require('../utils/response');
const { initCoreSchemaController, getMeController } = require('../controller/users-controller');
const { schemaInitGuard } = require('../middleware/schema-init-guard');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

router.post('/init-schema', schemaInitGuard, initCoreSchemaController);

/**
 * 获取当前用户信息
 * GET /api/users/me
 */
router.get('/me', authMiddleware, getMeController);

/** GET /api/users/me/auth-status */
router.get('/me/auth-status', authMiddleware, async (req, res, next) => {
  // delegate to controller
  return require('../controller/users-controller').getAuthStatusController(req, res, next);
});

/** GET /api/users/me/invite */
router.get('/me/invite', authMiddleware, async (req, res, next) => {
  return require('../controller/users-controller').getInviteController(req, res, next);
});

/** POST /api/users/me/track-share */
router.post('/me/track-share', authMiddleware, async (req, res, next) => {
  return require('../controller/users-controller').trackShareController(req, res, next);
});

/** POST /api/users/me/auth/verify */
router.post('/me/auth/verify', authMiddleware, async (req, res, next) => {
  return require('../controller/users-controller').submitAuthVerifyController(req, res, next);
});

/** @deprecated 请使用 POST /api/auth/register，避免绕过注册校验流程 */
router.post('/create', (req, res) => {
  const requestId = req.headers['x-request-id'] || createRequestId();
  return res
    .status(410)
    .json(buildFailureResponse(410, '该接口已废弃，请使用 POST /api/auth/register', null, requestId));
});

module.exports = router;
