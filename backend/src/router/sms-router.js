/**
 * 文件功能：短信验证码路由层
 * 关联业务：短信验证码发送与校验
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');

const {
  sendVerifyCodeController,
  checkVerifyCodeController,
} = require('../controller/sms-controller');

const router = express.Router();

router.post('/send-verify-code', sendVerifyCodeController);
router.post('/check-verify-code', checkVerifyCodeController);

module.exports = router;

