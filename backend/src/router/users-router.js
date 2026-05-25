/**
 * 文件功能：用户路由层
 * 关联业务：数据库 schema 检查（Prisma 管理）
 */
const express = require('express');
const {
  createRequestId,
  buildFailureResponse,
} = require('../utils/response');
const { initCoreSchemaController } = require('../controller/users-controller');
const { schemaInitGuard } = require('../middleware/schema-init-guard');

const router = express.Router();

router.post('/init-schema', schemaInitGuard, initCoreSchemaController);

/** @deprecated 请使用 POST /api/auth/register，避免绕过注册校验流程 */
router.post('/create', (req, res) => {
  const requestId = req.headers['x-request-id'] || createRequestId();
  return res
    .status(410)
    .json(buildFailureResponse(410, '该接口已废弃，请使用 POST /api/auth/register', null, requestId));
});

module.exports = router;
