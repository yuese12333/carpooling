/**
 * @file auth-service.test.js
 * @description 认证服务测试 - 覆盖核心业务分支
 */

// Mock 依赖（必须在导入模块前）
jest.mock('../../src/dao/user-dao', () => ({
  findByPhone: jest.fn(),
  findByUserName: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  createAuthUser: jest.fn(),
  updateLoginInfo: jest.fn(),
  updateLastLoginInfo: jest.fn(),
}));

jest.mock('../../src/dao/oauth-dao', () => ({
  findOAuthByPhone: jest.fn(),
  createOAuthUser: jest.fn(),
}));

jest.mock('../../src/utils/sms-utils', () => ({
  sendSms: jest.fn(),
  generateSmsCode: jest.fn(() => '123456'),
}));

jest.mock('../../src/utils/password-utils', () => ({
  hash: jest.fn(() => '$2a$10$hashedPassword'),
  compare: jest.fn(),
}));

jest.mock('../../src/utils/jwt-utils', () => ({
  generateToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyToken: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  maskSensitive: jest.fn((data) => data),
}));

jest.mock('../../src/utils/redis-utils', () => ({
  setWithExpiry: jest.fn(),
  setExpire: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
}));

jest.mock('../../src/utils/risk-utils', () => ({
  checkSmsRisk: jest.fn(() => ({ allowed: true })),
}));

jest.mock('../../src/service/register-temp-token-service', () => ({
  consumeRegisterTempToken: jest.fn(() => ({ phone: '13800138000' })),
}));

const authService = require('../../src/service/auth-service');
const userDao = require('../../src/dao/user-dao');
const passwordUtils = require('../../src/utils/password-utils');
const jwtUtils = require('../../src/utils/jwt-utils');
const redisUtils = require('../../src/utils/redis-utils');

describe('Auth Service - loginByPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('登录 - 用户存在性分支', () => {
    test('用户不存在时抛出错误', async () => {
      userDao.findByPhone.mockResolvedValue(null);

      await expect(authService.loginByPassword({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      })).rejects.toThrow(/用户不存在/);
    });

    test('用户存在时继续验证密码', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      });
      passwordUtils.compare.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue('mock-token');
      jwtUtils.generateRefreshToken.mockReturnValue('mock-refresh-token');
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });

      await authService.loginByPassword({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      });

      expect(passwordUtils.compare).toHaveBeenCalled();
    });
  });

  describe('登录 - 密码验证分支', () => {
    test('密码正确时登录成功', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      });
      passwordUtils.compare.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue('mock-token');
      jwtUtils.generateRefreshToken.mockReturnValue('mock-refresh-token');
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });

      const result = await authService.loginByPassword({
        phone: '13800138000',
        password: 'correct_password',
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    test('密码错误时抛出错误', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      });
      passwordUtils.compare.mockResolvedValue(false);

      await expect(authService.loginByPassword({
        phone: '13800138000',
        password: 'wrong_password',
        requestId: 'test-request-id',
      })).rejects.toThrow(/密码错误/);
    });
  });

  describe('登录 - 账号状态分支', () => {
    test('账号被禁用时拒绝登录', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'disabled',
      });
      passwordUtils.compare.mockResolvedValue(true);

      await expect(authService.loginByPassword({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      })).rejects.toThrow();
    });
  });

  describe('登录 - Token 生成分支', () => {
    test('登录成功后生成 accessToken 和 refreshToken', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      });
      passwordUtils.compare.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue('access-token-123');
      jwtUtils.generateRefreshToken.mockReturnValue('refresh-token-456');
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });

      const result = await authService.loginByPassword({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      });

      expect(jwtUtils.generateToken).toHaveBeenCalled();
      expect(jwtUtils.generateRefreshToken).toHaveBeenCalled();
      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
    });

    test('记住我时登录成功', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        password_hash: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      });
      passwordUtils.compare.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue('access-token-123');
      jwtUtils.generateRefreshToken.mockReturnValue('refresh-token-456');
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });

      const result = await authService.loginByPassword({
        phone: '13800138000',
        password: 'password123',
        rememberMe: true,
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('token');
    });
  });
});

describe('Auth Service - registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('注册 - 手机号重复分支', () => {
    test('手机号已注册时拒绝注册', async () => {
      userDao.findByPhone.mockResolvedValue({
        user_id: 'existing_user',
        phone: '13800138000',
      });

      await expect(authService.registerUser({
        phone: '13800138000',
        password: 'password123',
        userName: 'New User',
        tempToken: 'valid-temp-token',
        requestId: 'test-request-id',
      })).rejects.toThrow(/已注册/);
    });

    test('手机号未被注册时继续注册流程', async () => {
      userDao.findByPhone.mockResolvedValue(null);
      userDao.createAuthUser.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        user_name: 'New User',
      });
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });
      jwtUtils.generateToken.mockReturnValue('mock-token');
      jwtUtils.generateRefreshToken.mockReturnValue('mock-refresh-token');

      await authService.registerUser({
        phone: '13800138000',
        password: 'password123',
        userName: 'New User',
        tempToken: 'valid-temp-token',
        requestId: 'test-request-id',
      });

      expect(userDao.createAuthUser).toHaveBeenCalled();
    });
  });

  describe('注册 - 成功场景', () => {
    test('注册成功返回用户信息和 token', async () => {
      userDao.findByPhone.mockResolvedValue(null);
      userDao.createAuthUser.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        user_name: 'New User',
      });
      userDao.updateLastLoginInfo.mockResolvedValue({ success: true });
      jwtUtils.generateToken.mockReturnValue('mock-token');
      jwtUtils.generateRefreshToken.mockReturnValue('mock-refresh-token');

      const result = await authService.registerUser({
        phone: '13800138000',
        password: 'password123',
        userName: 'New User',
        tempToken: 'valid-temp-token',
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});

describe('Auth Service - checkNickname', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('昵称检查 - 唯一性分支', () => {
    test('昵称未被占用时返回可用', async () => {
      userDao.findByUserName.mockResolvedValue(null);

      const result = await authService.checkNickname({
        nickname: 'uniqueName',
        requestId: 'test-request-id',
      });

      expect(result.isAvailable).toBe(true);
    });

    test('昵称已被占用时返回不可用', async () => {
      userDao.findByUserName.mockResolvedValue({
        user_id: 'user_123',
        user_name: 'existingName',
      });

      const result = await authService.checkNickname({
        nickname: 'existingName',
        requestId: 'test-request-id',
      });

      expect(result.isAvailable).toBe(false);
    });
  });
});

describe('Auth Service - refreshToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token 刷新 - 有效性分支', () => {
    test('有效的 refresh token 刷新成功', async () => {
      jwtUtils.verifyToken.mockReturnValue({ userId: 'user_123', type: 'refresh' });
      jwtUtils.generateToken.mockReturnValue('new-access-token');
      jwtUtils.generateRefreshToken.mockReturnValue('new-refresh-token');
      redisUtils.get.mockResolvedValue('stored-refresh-token');
      userDao.findById.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        status: 'active',
      });

      const result = await authService.refreshToken({
        refreshToken: 'valid-refresh-token',
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('token');
      expect(result.token).toBe('new-access-token');
    });

    test('无效的 refresh token 拒绝刷新', async () => {
      jwtUtils.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken({
        refreshToken: 'invalid-refresh-token',
        requestId: 'test-request-id',
      })).rejects.toThrow();
    });
  });
});
