/**
 * 文件功能：认证鉴权控制层
 * 关联业务：用户密码登录
 * 说明：负责参数校验、调用 service、返回标准响应
 */
const { loginByPassword } = require('../service/auth-service');

const CHINA_MAINLAND_PHONE_REGEX = /^1\d{10}$/;

/**
 * 函数功能：处理“用户密码登录”接口请求
 * 入参：req/res（Express 请求与响应对象）
 * 出参：标准化 JSON 响应
 */
async function loginByPasswordController(req, res) {
  try {
    const { phone, password, rememberMe } = req.body || {};

    if (!phone || typeof phone !== 'string' || !CHINA_MAINLAND_PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确',
        data: null,
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        code: 400,
        message: '密码不能为空',
        data: null,
      });
    }

    if (rememberMe !== undefined && typeof rememberMe !== 'boolean') {
      return res.status(400).json({
        code: 400,
        message: 'rememberMe 必须为布尔值',
        data: null,
      });
    }

    const data = await loginByPassword({
      phone,
      password,
      rememberMe: Boolean(rememberMe),
      deviceInfo: {
        userAgent: req.get('user-agent') || '',
        deviceId: req.get('x-device-id') || '',
      },
    });

    return res.json({
      code: 200,
      message: 'success',
      data,
    });
  } catch (error) {
    const status = error?.statusCode || 500;
    const message =
      status === 401
        ? error?.message || '手机号或密码错误'
        : process.env.NODE_ENV === 'production'
          ? '登录失败'
          : error?.message || '登录失败';

    return res.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}

module.exports = {
  loginByPasswordController,
};
