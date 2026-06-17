/**
 * @file use-register-form.test.ts
 * @description useRegisterForm Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native';
import { useRegisterForm } from '@/hooks/use-register-form';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/api/auth', () => ({
  checkNickname: jest.fn(),
  sendSmsCode: jest.fn(),
  verifySmsCode: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRouter = {
  replace: jest.fn(),
};

const mockRegisterLocal = jest.fn();

describe('useRegisterForm Hook', () => {
  const mockRequestId = 'test-request-id-123';
  const isMockMode = false;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('初始状态', () => {
    test('返回正确的初始状态', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      expect(result.current.state.currentStep).toBe(1);
      expect(result.current.state.formData).toEqual({
        nickname: '',
        phoneNumber: '',
        verifyCode: '',
        password: '',
        confirmPassword: '',
        isAgreed: false,
      });
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.countdown).toBe(0);
      expect(result.current.state.fieldErrors).toEqual({});
      expect(result.current.state.passwordStrengthScore).toBe(0);
    });
  });

  describe('updateForm 方法', () => {
    test('更新表单字段值', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
      });

      expect(result.current.state.formData.nickname).toBe('测试用户');
    });

    test('更新时清除字段错误', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      // 设置一个错误
      act(() => {
        result.current.actions.setFieldErrors({ nickname: '昵称已存在' });
      });

      // 更新字段应清除错误
      act(() => {
        result.current.actions.updateForm('nickname', '新昵称');
      });

      expect(result.current.state.fieldErrors.nickname).toBe('');
    });
  });

  describe('密码强度计算', () => {
    test('空密码强度为 0', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));
      expect(result.current.state.passwordStrengthScore).toBe(0);
    });

    test('简单密码强度为 25', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'abcdefgh');
      });

      expect(result.current.state.passwordStrengthScore).toBe(25);
    });

    test('包含大写字母强度为 50', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'Abcdefgh');
      });

      expect(result.current.state.passwordStrengthScore).toBe(50);
    });

    test('包含大写和数字强度为 75', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'Abcdefg1');
      });

      expect(result.current.state.passwordStrengthScore).toBe(75);
    });

    test('复杂密码强度为 100', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'Abcdefg1!');
      });

      expect(result.current.state.passwordStrengthScore).toBe(100);
    });
  });

  describe('handleSendVerificationCode 方法', () => {
    test('手机号为空时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      await act(async () => {
        await result.current.actions.handleSendVerificationCode();
      });

      expect(result.current.state.fieldErrors.phoneNumber).toBe('请输入手机号');
    });

    test('手机号格式错误时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('phoneNumber', '1234567890');
      });

      await act(async () => {
        await result.current.actions.handleSendVerificationCode();
      });

      expect(result.current.state.fieldErrors.phoneNumber).toBe('请输入正确的 11 位手机号');
    });

    test('发送成功开始倒计时', async () => {
      const { sendSmsCode } = require('@/api/auth');
      sendSmsCode.mockResolvedValueOnce({ success: true, data: { success: true } });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('phoneNumber', '13800138000');
      });

      await act(async () => {
        await result.current.actions.handleSendVerificationCode();
      });

      expect(result.current.state.countdown).toBe(60);

      // 模拟倒计时
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.state.countdown).toBe(59);
    });

    test('发送失败显示错误', async () => {
      const { sendSmsCode } = require('@/api/auth');
      sendSmsCode.mockResolvedValueOnce({ success: false, message: '发送过于频繁' });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('phoneNumber', '13800138000');
      });

      await act(async () => {
        await result.current.actions.handleSendVerificationCode();
      });

      expect(result.current.state.fieldErrors.general).toBe('发送过于频繁');
      expect(result.current.state.countdown).toBe(0);
    });
  });

  describe('navigateToStepTwo 方法', () => {
    test('字段校验失败时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      await act(async () => {
        await result.current.actions.navigateToStepTwo();
      });

      expect(result.current.state.fieldErrors.nickname).toBe('请输入昵称');
      expect(result.current.state.fieldErrors.phoneNumber).toBe('请输入手机号');
    });

    test('昵称已被占用时显示错误', async () => {
      const { checkNickname } = require('@/api/auth');
      checkNickname.mockResolvedValueOnce({ success: false, message: '昵称已被占用' });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
        result.current.actions.updateForm('phoneNumber', '13800138000');
        result.current.actions.updateForm('verifyCode', '123456');
      });

      await act(async () => {
        await result.current.actions.navigateToStepTwo();
      });

      expect(result.current.state.fieldErrors.nickname).toBe('昵称已被占用');
      expect(result.current.state.currentStep).toBe(1);
    });

    test('验证码错误时显示错误', async () => {
      const { checkNickname, verifySmsCode } = require('@/api/auth');
      checkNickname.mockResolvedValueOnce({ success: true, data: { isAvailable: true } });
      verifySmsCode.mockResolvedValueOnce({ success: false, message: '验证码错误' });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
        result.current.actions.updateForm('phoneNumber', '13800138000');
        result.current.actions.updateForm('verifyCode', '123456');
      });

      await act(async () => {
        await result.current.actions.navigateToStepTwo();
      });

      expect(result.current.state.fieldErrors.verifyCode).toBe('验证码错误');
      expect(result.current.state.currentStep).toBe(1);
    });

    test('校验成功进入第二步', async () => {
      const { checkNickname, verifySmsCode } = require('@/api/auth');
      checkNickname.mockResolvedValueOnce({ success: true, data: { isAvailable: true } });
      verifySmsCode.mockResolvedValueOnce({
        success: true,
        data: { isValid: true, tempToken: 'temp-token-123' },
      });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
        result.current.actions.updateForm('phoneNumber', '13800138000');
        result.current.actions.updateForm('verifyCode', '123456');
      });

      await act(async () => {
        await result.current.actions.navigateToStepTwo();
      });

      expect(result.current.state.currentStep).toBe(2);
      expect(result.current.state.fieldErrors).toEqual({});
    });
  });

  describe('handleFinalRegistration 方法', () => {
    test('密码长度不足时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', '1234567');
        result.current.actions.updateForm('confirmPassword', '1234567');
        result.current.actions.updateForm('isAgreed', true);
      });

      await act(async () => {
        await result.current.actions.handleFinalRegistration();
      });

      expect(result.current.state.fieldErrors.password).toBe('密码长度不足');
    });

    test('密码不一致时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'password123');
        result.current.actions.updateForm('confirmPassword', 'password456');
        result.current.actions.updateForm('isAgreed', true);
      });

      await act(async () => {
        await result.current.actions.handleFinalRegistration();
      });

      expect(result.current.state.fieldErrors.confirmPassword).toBe('两次输入的密码不一致');
    });

    test('未同意协议时显示错误', async () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('password', 'password123');
        result.current.actions.updateForm('confirmPassword', 'password123');
        result.current.actions.updateForm('isAgreed', false);
      });

      await act(async () => {
        await result.current.actions.handleFinalRegistration();
      });

      expect(result.current.state.fieldErrors.isAgreed).toBe('请同意协议');
    });

    test('注册成功跳转首页', async () => {
      const { registerUser } = require('@/api/auth');
      registerUser.mockResolvedValueOnce({
        success: true,
        data: { accessToken: 'access-token-123' },
      });
      mockRegisterLocal.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
        result.current.actions.updateForm('phoneNumber', '13800138000');
        result.current.actions.updateForm('verifyCode', '123456');
        result.current.actions.updateForm('password', 'password123');
        result.current.actions.updateForm('confirmPassword', 'password123');
        result.current.actions.updateForm('isAgreed', true);
      });

      await act(async () => {
        await result.current.actions.handleFinalRegistration();
      });

      expect(mockRegisterLocal).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/home/home');
    });

    test('注册失败显示错误', async () => {
      const { registerUser } = require('@/api/auth');
      registerUser.mockRejectedValueOnce(new Error('注册失败'));

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('nickname', '测试用户');
        result.current.actions.updateForm('phoneNumber', '13800138000');
        result.current.actions.updateForm('verifyCode', '123456');
        result.current.actions.updateForm('password', 'password123');
        result.current.actions.updateForm('confirmPassword', 'password123');
        result.current.actions.updateForm('isAgreed', true);
      });

      await act(async () => {
        await result.current.actions.handleFinalRegistration();
      });

      expect(result.current.state.fieldErrors.general).toBe('注册失败');
    });
  });

  describe('setCurrentStep 方法', () => {
    test('可以切换步骤', () => {
      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      expect(result.current.state.currentStep).toBe(1);

      act(() => {
        result.current.actions.setCurrentStep(2);
      });

      expect(result.current.state.currentStep).toBe(2);
    });
  });

  describe('倒计时功能', () => {
    test('倒计时结束自动停止', async () => {
      const { sendSmsCode } = require('@/api/auth');
      sendSmsCode.mockResolvedValueOnce({ success: true, data: { success: true } });

      const { result } = renderHook(() => useRegisterForm(isMockMode, mockRegisterLocal, mockRequestId));

      act(() => {
        result.current.actions.updateForm('phoneNumber', '13800138000');
      });

      await act(async () => {
        await result.current.actions.handleSendVerificationCode();
      });

      expect(result.current.state.countdown).toBe(60);

      // 快进 60 秒
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.state.countdown).toBe(0);
    });
  });
});
