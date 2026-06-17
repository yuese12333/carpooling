/**
 * @file use-login-form.test.ts
 * @description useLoginForm Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLoginForm } from '@/hooks/use-login-form';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/store/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/store/env-store', () => ({
  useEnvStore: {
    getState: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  maskSensitive: jest.fn((data) => data),
}));

jest.mock('@/utils/api-response', () => ({
  isAuthCredentialError: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
};

const mockLogin = jest.fn();

describe('useLoginForm Hook', () => {
  const mockRequestId = 'test-request-id-123';
  const isMockMode = false;

  beforeEach(() => {
    jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue(mockRouter);
    (require('@/store/auth-context').useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
    (require('@/store/env-store').useEnvStore.getState as jest.Mock).mockReturnValue({
      role: 'user',
    });
    (require('@/utils/api-response').isAuthCredentialError as jest.Mock).mockReturnValue(false);
  });

  describe('初始状态', () => {
    test('返回正确的初始状态', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      expect(result.current.state.phone).toBe('');
      expect(result.current.state.password).toBe('');
      expect(result.current.state.shouldRemember).toBe(false);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.errors).toEqual({
        phone: '',
        password: '',
        submission: '',
      });
    });
  });

  describe('setPhone 方法', () => {
    test('过滤非数字字符', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('138abc00138000');
      });

      expect(result.current.state.phone).toBe('13800138000');
    });

    test('清除手机号错误', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      // 先设置一个错误
      act(() => {
        result.current.actions.handleLogin();
      });

      // 然后修改手机号
      act(() => {
        result.current.actions.setPhone('13800138000');
      });

      expect(result.current.state.errors.phone).toBe('');
    });
  });

  describe('setPassword 方法', () => {
    test('更新密码值', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPassword('password123');
      });

      expect(result.current.state.password).toBe('password123');
    });

    test('清除密码错误', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      // 先设置一个错误
      act(() => {
        result.current.actions.handleLogin();
      });

      // 然后修改密码
      act(() => {
        result.current.actions.setPassword('password123');
      });

      expect(result.current.state.errors.password).toBe('');
    });
  });

  describe('setShouldRemember 方法', () => {
    test('切换记住我状态', () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setShouldRemember(true);
      });

      expect(result.current.state.shouldRemember).toBe(true);

      act(() => {
        result.current.actions.setShouldRemember(false);
      });

      expect(result.current.state.shouldRemember).toBe(false);
    });
  });

  describe('handleLogin 方法 - 校验失败', () => {
    test('手机号为空时显示错误', async () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(result.current.state.errors.phone).toBe('请输入手机号');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('手机号格式错误时显示错误', async () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('1234567890');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(result.current.state.errors.phone).toBe('请输入正确的 11 位手机号');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('密码为空时显示错误', async () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(result.current.state.errors.password).toBe('请输入密码');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('密码过短时显示错误', async () => {
      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('1234567');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(result.current.state.errors.password).toBe('密码不能少于 8 位');
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('handleLogin 方法 - 登录成功', () => {
    test('登录成功后跳转到首页', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(mockLogin).toHaveBeenCalledWith('13800138000', 'password123', false);
      expect(mockRouter.replace).toHaveBeenCalledWith('/home/home');
      expect(result.current.state.isLoading).toBe(false);
    });

    test('管理员登录成功后跳转到用户管理页', async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      (require('@/store/env-store').useEnvStore.getState as jest.Mock).mockReturnValue({
        role: 'admin',
      });

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/admin/users');
    });

    test('登录成功记录日志', async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      const logger = require('@/utils/logger').default;

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'use-login-form',
          operate: 'submit_login',
          requestId: mockRequestId,
          result: 'success',
        })
      );
    });
  });

  describe('handleLogin 方法 - 登录失败', () => {
    test('登录失败显示错误信息', async () => {
      mockLogin.mockRejectedValueOnce(new Error('用户名或密码错误'));

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(result.current.state.errors.submission).toBe('用户名或密码错误');
      expect(result.current.state.isLoading).toBe(false);
    });

    test('非凭据错误记录错误日志', async () => {
      mockLogin.mockRejectedValueOnce(new Error('网络错误'));
      (require('@/utils/api-response').isAuthCredentialError as jest.Mock).mockReturnValue(false);
      const logger = require('@/utils/logger').default;

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'use-login-form',
          operate: 'submit_login',
          error: '网络错误',
          errorType: 'AUTH_SUBMIT_FAILED',
        })
      );
    });

    test('凭据错误不记录错误日志', async () => {
      mockLogin.mockRejectedValueOnce(new Error('密码错误'));
      (require('@/utils/api-response').isAuthCredentialError as jest.Mock).mockReturnValue(true);
      const logger = require('@/utils/logger').default;

      const { result } = renderHook(() => useLoginForm(isMockMode, mockRequestId));

      act(() => {
        result.current.actions.setPhone('13800138000');
        result.current.actions.setPassword('password123');
      });

      await act(async () => {
        await result.current.actions.handleLogin();
      });

      expect(logger.error).not.toHaveBeenCalled();
    });
  });
});
