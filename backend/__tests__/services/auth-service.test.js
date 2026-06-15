/**
 * 认证服务测试
 */
const authService = require('../../src/service/auth-service');
const authDao = require('../../src/dao/auth-dao');

jest.mock('../../src/dao/auth-dao');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSmsCode', () => {
    it('should send SMS code successfully', async () => {
      authDao.findUserByPhone.mockResolvedValue(null);
      authDao.createSmsCode.mockResolvedValue({ code: '123456' });

      const result = await authService.sendSmsCode({
        phone: '13800138000',
        type: 'register',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
      expect(authDao.createSmsCode).toHaveBeenCalled();
    });

    it('should fail if phone format is invalid', async () => {
      const result = await authService.sendSmsCode({
        phone: 'invalid-phone',
        type: 'register',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        user_id: 'user_123',
        phone: '13800138000',
        password: '$2a$10$hashedPassword',
        user_name: 'Test User',
        status: 'active',
      };

      authDao.findUserByPhone.mockResolvedValue(mockUser);
      authDao.updateLoginInfo.mockResolvedValue({ success: true });

      const result = await authService.login({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      });

      expect(authDao.findUserByPhone).toHaveBeenCalledWith('13800138000', 'test-request-id');
    });

    it('should fail with invalid phone', async () => {
      authDao.findUserByPhone.mockResolvedValue(null);

      await expect(authService.login({
        phone: '13800138000',
        password: 'password123',
        requestId: 'test-request-id',
      })).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      authDao.findUserByPhone.mockResolvedValue(null);
      authDao.verifySmsCode.mockResolvedValue({ success: true });
      authDao.createUser.mockResolvedValue({
        user_id: 'user_123',
        phone: '13800138000',
        user_name: 'New User',
      });

      const result = await authService.register({
        phone: '13800138000',
        password: 'password123',
        smsCode: '123456',
        userName: 'New User',
        requestId: 'test-request-id',
      });

      expect(authDao.findUserByPhone).toHaveBeenCalled();
    });
  });
});
