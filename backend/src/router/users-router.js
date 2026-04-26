/**
 * 文件功能：用户路由层
 * 关联业务：用户建表初始化、最小注册接口
 */
const express = require('express');
const {
  initCoreSchemaController,
  createUserController,
} = require('../controller/users-controller');
const { schemaInitGuard } = require('../middleware/schema-init-guard');

const router = express.Router();

router.post('/init-schema', schemaInitGuard, initCoreSchemaController);
router.post('/create', createUserController);

module.exports = router;
