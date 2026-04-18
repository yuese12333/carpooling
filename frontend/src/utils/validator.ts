/**
 * @file validator.ts
 * @description 通用格式校验工具库。
 * 遵循规范：1.3.2 函数注释规范。
 */

import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

// --- 常量定义 ---

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 20;
export const VERIFY_CODE_LENGTH = 6;

// --- 内部辅助函数 ---

/**
 * 获取当前链路追踪 ID
 */
const getContextRequestId = (): string => useEnvStore.getState().currentRequestId || 'internal-auto-gen';

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
 * @description 严禁在此处记录或打印 password 原文。
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return '请输入密码';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `密码不能少于 ${MIN_PASSWORD_LENGTH} 位`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `密码不能超过 ${MAX_PASSWORD_LENGTH} 位`;
  }

  return '';
};

/**
 * 校验昵称合法性
 * @param {string} nickname - 用户输入的昵称
 * @returns {string} 错误信息，通过则返回空字符串
 */
export const validateNickname = (nickname: string): string => {
  const trimmedNickname = nickname.trim();
  if (!trimmedNickname) {
    return "请输入昵称";
  }
  if (trimmedNickname.length < 2) {
    return "昵称至少需要 2 个字符";
  }
  return "";
};

/**
 * 校验验证码格式
 * @param {string} code - 6位数字验证码
 * @returns {string} 错误信息，通过则返回空字符串
 */
export const validateVerifyCode = (code: string): string => {
  const digitReg = /^\d+$/;
  if (!code || code.length !== VERIFY_CODE_LENGTH || !digitReg.test(code)) {
    return `请输入 ${VERIFY_CODE_LENGTH} 位数字验证码`;
  }
  return "";
};

/**
 * 校验两次密码输入是否一致
 * @param {string} p1 - 密码
 * @param {string} p2 - 确认密码
 * @returns {string} 错误信息，一致则返回空字符串
 */
export const validateConfirmPassword = (p1: string, p2: string): string => {
  if (p1 !== p2) {
    return "两次输入的密码不一致";
  }
  return "";
};

/**
 * 计算密码强度分值 (0-100)
 * @param {string} password - 待评估的密码字符串（不记录日志）
 * @returns {number} 强度分值
 * @description 基于长度、大写字母、数字及特殊字符四个维度评估。
 */
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // 维度 1: 基础长度
  if (password.length >= MIN_PASSWORD_LENGTH) score += 25;

  // 维度 2: 包含大写字母
  if (/[A-Z]/.test(password)) score += 25;

  // 维度 3: 包含数字
  if (/[0-9]/.test(password)) score += 25;

  // 维度 4: 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  // 关键节点审计（仅记录结果，严禁记录 params.password）
  if (score > 0) {
    logger.info({
      module: 'utils-validator',
      operate: 'calculatePasswordStrength',
      params: { passwordLength: password.length },
      result: `Score: ${score}`,
      requestId: getContextRequestId()
    });
  }

  return score;
};