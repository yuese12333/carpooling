/**
 * 文件功能：认证鉴权相关常量定义
 * 说明：集中管理正则表达式、配置值、风控阈值等
 */

'use strict';

// ============ 正则表达式 ============
const CHINA_MAINLAND_PHONE_REGEX = /^1\d{10}$/;
const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

// ============ 集合类型校验 ============
const SOCIAL_PLATFORM_SET = new Set(['wechat', 'qq', 'apple']);
const SMS_TYPE_SET = new Set(['login', 'register', 'reset_pwd']);
const CLIENT_PLATFORM_SET = new Set(['ios', 'android', 'web']);

// ============ Token 配置 ============
// 默认 token 过期时间（秒）
const TOKEN_EXPIRE_DEFAULT = 24 * 60 * 60; // 1 天
const TOKEN_EXPIRE_REMEMBER_ME = 7 * 24 * 60 * 60; // 7 天
const REFRESH_TOKEN_EXPIRE_DEFAULT = 7 * 24 * 60 * 60; // 7 天
const REFRESH_TOKEN_EXPIRE_REMEMBER_ME = 30 * 24 * 60 * 60; // 30 天

// ============ 验证码配置 ============
// 验证码长度
const SMS_CODE_LENGTH = 6;
// 验证码有效期（秒）
const SMS_CODE_EXPIRE = 5 * 60; // 5 分钟
// 图形验证码有效期（秒）
const CAPTCHA_EXPIRE = 5 * 60; // 5 分钟
// 图形验证码长度
const CAPTCHA_LENGTH = 4;
// 行为验证 challenge token 有效期（秒）
const CHALLENGE_TOKEN_EXPIRE = 10 * 60; // 10 分钟

// ============ 短信风控配置 ============
// 短信重发间隔（秒）
const SMS_RESEND_INTERVAL = 60;
// 短信发送次数阈值 - 高风险
const SMS_COUNT_THRESHOLD_HIGH = 10;
// 短信发送次数阈值 - 中风险
const SMS_COUNT_THRESHOLD_MEDIUM = 5;
// 短信发送统计周期（秒）
const SMS_COUNT_PERIOD = 24 * 60 * 60; // 24 小时

// ============ OAuth 绑定配置 ============
// OAuth 临时绑定有效期（秒）
const OAUTH_BIND_EXPIRE = 30 * 60; // 30 分钟

// ============ 输入长度限制 ============
const MAX_PASSWORD_LENGTH = 128;
const MAX_AUTH_CODE_LENGTH = 2048;
const MAX_SESSION_ID_LENGTH = 128;
const MAX_VERIFY_ID_LENGTH = 128;
const MAX_ACCESS_TOKEN_LENGTH = 2048;
const MAX_NICKNAME_LENGTH = 30;

// ============ 注册临时令牌 ============
const REGISTER_TEMP_EXPIRE = 10 * 60; // 10 分钟
// 临时重置令牌
const RESET_TEMP_EXPIRE = 10 * 60; // 10 分钟

// ============ Redis Key 前缀 ============
const REDIS_KEY_PREFIX = {
  SMS_LIMIT: 'sms_limit:', // 短信频率限制
  SMS_CODE: 'sms_code:', // 短信验证码
  SMS_TOTAL: 'sms_total:', // 短信发送总数
  CAPTCHA: 'captcha:', // 图形验证码
  CHALLENGE: 'challenge:', // 行为验证
  OAUTH_BIND: 'oauth_bind:', // OAuth 绑定
  REGISTER_TEMP: 'register_temp:', // 注册预校验临时令牌
  RESET_TEMP: 'reset_temp:', // 密码重置临时令牌
  REFRESH_TOKEN: 'refresh_token:', // 刷新令牌（用于撤销登录态）
};

// ============ 校验函数 ============
/**
 * 函数功能：校验中国大陆手机号
 * 入参：phone - 待校验的手机号
 * 出参：{ valid: boolean, error: string | null }
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: '手机号不能为空' };
  }
  if (!CHINA_MAINLAND_PHONE_REGEX.test(phone)) {
    return { valid: false, error: '手机号格式不正确' };
  }
  return { valid: true, error: null };
}

/**
 * 函数功能：校验 IPv4 地址
 * 入参：ip - 待校验的 IP 地址
 * 出参：{ valid: boolean, error: string | null }
 */
function validateIPv4(ip) {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP 不能为空' };
  }
  if (!IPV4_REGEX.test(ip)) {
    return { valid: false, error: 'IP 格式不合法' };
  }
  return { valid: true, error: null };
}

module.exports = {
  // 正则
  CHINA_MAINLAND_PHONE_REGEX,
  IPV4_REGEX,
  // 集合
  SOCIAL_PLATFORM_SET,
  SMS_TYPE_SET,
  CLIENT_PLATFORM_SET,
  // Token 配置
  TOKEN_EXPIRE_DEFAULT,
  TOKEN_EXPIRE_REMEMBER_ME,
  REFRESH_TOKEN_EXPIRE_DEFAULT,
  REFRESH_TOKEN_EXPIRE_REMEMBER_ME,
  // 验证码配置
  SMS_CODE_LENGTH,
  SMS_CODE_EXPIRE,
  CAPTCHA_EXPIRE,
  CAPTCHA_LENGTH,
  CHALLENGE_TOKEN_EXPIRE,
  // 短信风控
  SMS_RESEND_INTERVAL,
  SMS_COUNT_THRESHOLD_HIGH,
  SMS_COUNT_THRESHOLD_MEDIUM,
  SMS_COUNT_PERIOD,
  // OAuth 配置
  OAUTH_BIND_EXPIRE,
  // 输入限制
  MAX_PASSWORD_LENGTH,
  MAX_AUTH_CODE_LENGTH,
  MAX_SESSION_ID_LENGTH,
  MAX_VERIFY_ID_LENGTH,
  MAX_ACCESS_TOKEN_LENGTH,
  MAX_NICKNAME_LENGTH,
  RESET_TEMP_EXPIRE,
  REGISTER_TEMP_EXPIRE,
  // Redis Key 前缀
  REDIS_KEY_PREFIX,
  // 校验函数
  validatePhone,
  validateIPv4,
};
