/**
 * @file env-store.test.ts
 * @description useEnvStore 单元测试
 */

import { act } from '@testing-library/react-native';
import { useEnvStore } from '@/store/env-store';

// Mock logger
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useEnvStore', () => {
  // 每个测试前重置 store
  beforeEach(() => {
    act(() => {
      useEnvStore.setState({
        isMockMode: true,
        currentRequestId: '',
        token: '',
        refreshToken: '',
        role: 'user',
      });
    });
  });

  describe('初始状态', () => {
    test('默认开启 Mock 模式', () => {
      expect(useEnvStore.getState().isMockMode).toBe(true);
    });

    test('默认 requestId 为空', () => {
      expect(useEnvStore.getState().currentRequestId).toBe('');
    });

    test('默认 token 为空', () => {
      expect(useEnvStore.getState().token).toBe('');
    });

    test('默认 refreshToken 为空', () => {
      expect(useEnvStore.getState().refreshToken).toBe('');
    });

    test('默认 role 为 user', () => {
      expect(useEnvStore.getState().role).toBe('user');
    });
  });

  describe('toggleMockMode', () => {
    test('切换到 false', () => {
      act(() => {
        useEnvStore.getState().toggleMockMode(false);
      });

      expect(useEnvStore.getState().isMockMode).toBe(false);
    });

    test('切换到 true', () => {
      // 先设为 false
      act(() => {
        useEnvStore.setState({ isMockMode: false });
      });

      act(() => {
        useEnvStore.getState().toggleMockMode(true);
      });

      expect(useEnvStore.getState().isMockMode).toBe(true);
    });

    test('切换时记录日志', () => {
      const logger = require('@/utils/logger').default;

      act(() => {
        useEnvStore.getState().toggleMockMode(false);
      });

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'env-store',
          operate: 'toggle_mock_mode',
          params: { from: true, to: false },
          result: 'success',
        })
      );
    });
  });

  describe('setCurrentRequestId', () => {
    test('设置有效的 requestId', () => {
      act(() => {
        useEnvStore.getState().setCurrentRequestId('test-request-id-123');
      });

      expect(useEnvStore.getState().currentRequestId).toBe('test-request-id-123');
    });

    test('拒绝空字符串', () => {
      const logger = require('@/utils/logger').default;

      act(() => {
        useEnvStore.getState().setCurrentRequestId('');
      });

      expect(useEnvStore.getState().currentRequestId).toBe('');
      expect(logger.warn).toHaveBeenCalled();
    });

    test('拒绝 null/undefined', () => {
      const logger = require('@/utils/logger').default;

      act(() => {
        useEnvStore.getState().setCurrentRequestId(null as any);
      });

      expect(logger.warn).toHaveBeenCalled();
    });

    test('拒绝非字符串类型', () => {
      const logger = require('@/utils/logger').default;

      act(() => {
        useEnvStore.getState().setCurrentRequestId(123 as any);
      });

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('setToken', () => {
    test('设置有效 token', () => {
      act(() => {
        useEnvStore.getState().setToken('access-token-123');
      });

      expect(useEnvStore.getState().token).toBe('access-token-123');
    });

    test('设置空字符串', () => {
      // 先设置一个 token
      act(() => {
        useEnvStore.setState({ token: 'existing-token' });
      });

      act(() => {
        useEnvStore.getState().setToken('');
      });

      expect(useEnvStore.getState().token).toBe('');
    });

    test('非字符串转为空字符串', () => {
      act(() => {
        useEnvStore.getState().setToken(123 as any);
      });

      expect(useEnvStore.getState().token).toBe('');
    });
  });

  describe('setRefreshToken', () => {
    test('设置有效 refreshToken', () => {
      act(() => {
        useEnvStore.getState().setRefreshToken('refresh-token-456');
      });

      expect(useEnvStore.getState().refreshToken).toBe('refresh-token-456');
    });

    test('设置空字符串', () => {
      act(() => {
        useEnvStore.setState({ refreshToken: 'existing-refresh-token' });
      });

      act(() => {
        useEnvStore.getState().setRefreshToken('');
      });

      expect(useEnvStore.getState().refreshToken).toBe('');
    });

    test('非字符串转为空字符串', () => {
      act(() => {
        useEnvStore.getState().setRefreshToken({} as any);
      });

      expect(useEnvStore.getState().refreshToken).toBe('');
    });
  });

  describe('setRole', () => {
    test('设置有效角色', () => {
      act(() => {
        useEnvStore.getState().setRole('admin');
      });

      expect(useEnvStore.getState().role).toBe('admin');
    });

    test('设置带空格的角色自动 trim', () => {
      act(() => {
        useEnvStore.getState().setRole('  admin  ');
      });

      expect(useEnvStore.getState().role).toBe('admin');
    });

    test('空字符串回退到 user', () => {
      act(() => {
        useEnvStore.getState().setRole('');
      });

      expect(useEnvStore.getState().role).toBe('user');
    });

    test('纯空格回退到 user', () => {
      act(() => {
        useEnvStore.getState().setRole('   ');
      });

      expect(useEnvStore.getState().role).toBe('user');
    });

    test('非字符串回退到 user', () => {
      act(() => {
        useEnvStore.getState().setRole(123 as any);
      });

      expect(useEnvStore.getState().role).toBe('user');
    });
  });

  describe('状态持久性', () => {
    test('多次设置保持状态', () => {
      act(() => {
        useEnvStore.getState().setCurrentRequestId('req-1');
        useEnvStore.getState().setToken('token-1');
        useEnvStore.getState().setRefreshToken('refresh-1');
        useEnvStore.getState().setRole('admin');
      });

      const state = useEnvStore.getState();
      expect(state.currentRequestId).toBe('req-1');
      expect(state.token).toBe('token-1');
      expect(state.refreshToken).toBe('refresh-1');
      expect(state.role).toBe('admin');
    });
  });
});
