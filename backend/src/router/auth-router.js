/**
 * 文件功能：认证鉴权路由层
 * 关联业务：用户登录
 * 说明：仅负责路径与请求方法映射，不承载业务逻辑
 */
const express = require('express');

const {
	loginByPasswordController,
	loginBySocialController,
	sendAuthSmsController,
	getLoginConfigController,
	getDemoAccountsController,
	getCaptchaImageController,
	behaviorVerifyController,
	checkPhoneRiskController,
	deviceScoreController,
	oauthBindController,
} = require('../controller/auth-controller');

const router = express.Router();

router.post('/login/password', loginByPasswordController);
router.post('/login/social', loginBySocialController);
router.post('/sms/send', sendAuthSmsController);
router.get('/login/config', getLoginConfigController);
router.get('/demo-accounts', getDemoAccountsController);
router.get('/captcha/image', getCaptchaImageController);
router.post('/risk/behavior-verify', behaviorVerifyController);
router.post('/risk/check-phone', checkPhoneRiskController);
router.post('/risk/device-score', deviceScoreController);
router.post('/oauth/bind', oauthBindController);

module.exports = router;
