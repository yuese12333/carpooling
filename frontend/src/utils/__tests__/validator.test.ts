/**
 * @file validator.test.ts
 * @description validator 工具函数单元测试
 */

import {
  validatePhoneNumber,
  validatePassword,
  validateNickname,
  validateVerifyCode,
  validateConfirmPassword,
  calculatePasswordStrength,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  VERIFY_CODE_LENGTH,
} from '@/utils/validator';

describe('validatePhoneNumber', () => {
  test('空手机号返回错误', () => {
    expect(validatePhoneNumber('')).toBe('请输入手机号');
  });

  test('手机号过短返回错误', () => {
    expect(validatePhoneNumber('138001')).toBe('请输入正确的 11 位手机号');
  });

  test('手机号过长返回错误', () => {
    expect(validatePhoneNumber('138001380001')).toBe('请输入正确的 11 位手机号');
  });

  test('非数字返回错误', () => {
    expect(validatePhoneNumber('13800abcdef')).toBe('请输入正确的 11 位手机号');
  });

  test('无效开头返回错误', () => {
    expect(validatePhoneNumber('12800138000')).toBe('请输入正确的 11 位手机号');
  });

  test('有效手机号通过', () => {
    expect(validatePhoneNumber('13800138000')).toBe('');
  });

  test('不同有效前缀通过', () => {
    expect(validatePhoneNumber('15912345678')).toBe('');
    expect(validatePhoneNumber('18612345678')).toBe('');
    expect(validatePhoneNumber('17712345678')).toBe('');
  });
});

describe('validatePassword', () => {
  test('空密码返回错误', () => {
    expect(validatePassword('')).toBe('请输入密码');
  });

  test('密码过短返回错误', () => {
    expect(validatePassword('1234567')).toBe(`密码不能少于 ${MIN_PASSWORD_LENGTH} 位`);
  });

  test('密码过长返回错误', () => {
    const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
    expect(validatePassword(longPassword)).toBe(`密码不能超过 ${MAX_PASSWORD_LENGTH} 位`);
  });

  test('有效密码通过', () => {
    expect(validatePassword('password123')).toBe('');
  });

  test('最小长度密码通过', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBe('');
  });

  test('最大长度密码通过', () => {
    expect(validatePassword('a'.repeat(MAX_PASSWORD_LENGTH))).toBe('');
  });
});

describe('validateNickname', () => {
  test('空昵称返回错误', () => {
    expect(validateNickname('')).toBe('请输入昵称');
  });

  test('纯空格返回错误', () => {
    expect(validateNickname('   ')).toBe('请输入昵称');
  });

  test('昵称过短返回错误', () => {
    expect(validateNickname('一')).toBe('昵称至少需要 2 个字符');
  });

  test('有效昵称通过', () => {
    expect(validateNickname('测试用户')).toBe('');
  });

  test('两字符昵称通过', () => {
    expect(validateNickname('小明')).toBe('');
  });

  test('昵称前后空格被自动处理', () => {
    expect(validateNickname('  测试  ')).toBe('');
  });
});

describe('validateVerifyCode', () => {
  test('空验证码返回错误', () => {
    expect(validateVerifyCode('')).toBe(`请输入 ${VERIFY_CODE_LENGTH} 位数字验证码`);
  });

  test('验证码过短返回错误', () => {
    expect(validateVerifyCode('123')).toBe(`请输入 ${VERIFY_CODE_LENGTH} 位数字验证码`);
  });

  test('验证码过长返回错误', () => {
    expect(validateVerifyCode('1234567')).toBe(`请输入 ${VERIFY_CODE_LENGTH} 位数字验证码`);
  });

  test('非数字验证码返回错误', () => {
    expect(validateVerifyCode('abcdef')).toBe(`请输入 ${VERIFY_CODE_LENGTH} 位数字验证码`);
  });

  test('有效验证码通过', () => {
    expect(validateVerifyCode('123456')).toBe('');
  });
});

describe('validateConfirmPassword', () => {
  test('密码一致通过', () => {
    expect(validateConfirmPassword('password123', 'password123')).toBe('');
  });

  test('密码不一致返回错误', () => {
    expect(validateConfirmPassword('password123', 'password456')).toBe('两次输入的密码不一致');
  });

  test('空密码比较', () => {
    expect(validateConfirmPassword('', '')).toBe('');
  });
});

describe('calculatePasswordStrength', () => {
  test('空密码强度为 0', () => {
    expect(calculatePasswordStrength('')).toBe(0);
  });

  test('纯小写字母达到最小长度，强度为 25', () => {
    expect(calculatePasswordStrength('abcdefgh')).toBe(25);
  });

  test('包含大写字母，强度为 50', () => {
    expect(calculatePasswordStrength('Abcdefgh')).toBe(50);
  });

  test('包含大写和数字，强度为 75', () => {
    expect(calculatePasswordStrength('Abcdefg1')).toBe(75);
  });

  test('包含大写、数字和特殊字符，强度为 100', () => {
    expect(calculatePasswordStrength('Abcdefg1!')).toBe(100);
  });

  test('复杂密码强度为 100', () => {
    expect(calculatePasswordStrength('P@ssw0rd!')).toBe(100);
  });
});
