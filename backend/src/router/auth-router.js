/**
 * 文件功能：认证鉴权路由层
 * 关联业务：用户登录
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');

const { loginByPasswordController } = require('../controller/auth-controller');

const router = express.Router();

router.post('/login/password', loginByPasswordController);

module.exports = router;
