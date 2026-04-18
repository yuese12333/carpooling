/**
 * @file validator.ts
 * @description 通用格式校验工具库。
 * 提供手机号、密码等业务字段的正则校验能力，确保 UI 层数据输入的合法性。
 * 遵循规范：1.3.2 函数注释规范。
 */

/**
 * 校验手机号格式是否合法
 * @param {string} phone - 待校验的手机号字符串
 * @returns {string} 校验失败返回错误描述文字，通过则返回空字符串
 * @description 逻辑：必须符合中国大陆 11 位手机号规则（13-19 开头）
 */
export const validatePhoneNumber = (phone: string): string => {
  // 逻辑一致性保持：非空校验
  if (!phone) {
    return '请输入手机号';
  }

  // 正则逻辑：11位数字，首位为1，第二位为3-9
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(phone)) {
    return '请输入正确的 11 位手机号';
  }

  return '';
};

/**
 * 校验密码格式是否符合安全策略
 * @param {string} password - 待校验的原始密码字符串
 * @returns {string} 校验失败返回错误描述文字，通过则返回空字符串
 * @description 逻辑：当前业务基准要求密码长度不得少于 6 位
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return '请输入密码';
  }

  // 严禁在此记录密码原文日志（隐私保护）
  if (password.length < 6) {
    return '密码不能少于 6 位';
  }

  return '';
};