/**
 * 文件功能：认证鉴权路由层
 * 关联业务：用户登录、用户注册
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
	registerUserController,
	checkNicknameController,
  passwordVerifyCodeController,
  resetPasswordController,
} = require('../controller/auth-controller');

const router = express.Router();

// 登录相关路由
router.post('/login/password', loginByPasswordController);
router.post('/login/social', loginBySocialController);
router.post('/sms/send', sendAuthSmsController);
router.get('/login/config', getLoginConfigController);
router.get('/demo-accounts', getDemoAccountsController);
router.get('/captcha/image', getCaptchaImageController);
router.post('/risk/behavior-verify', behaviorVerifyController);
router.post('/check-phone', checkPhoneRiskController);
router.post('/risk/device-score', deviceScoreController);
router.post('/password/sms', (req, res) => {
	req.body = { ...(req.body || {}), type: 'reset_pwd' };
	return sendAuthSmsController(req, res);
});
// 密码找回：校验验证码并签发临时重置令牌
router.post('/password/verify-code', passwordVerifyCodeController);
// 密码重置提交
router.post('/password/reset', resetPasswordController);
router.post('/oauth/bind', oauthBindController);

// 注册相关路由（验码见 POST /api/sms/verify）
router.post('/register', registerUserController);
router.get('/register/check-nickname', checkNicknameController);

module.exports = router;
