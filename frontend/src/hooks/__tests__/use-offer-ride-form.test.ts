/**
 * @file use-offer-ride-form.test.ts
 * @description useOfferRideForm Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native';
import { useOfferRideForm } from '@/hooks/use-offer-ride-form';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('date-fns', () => ({
  format: jest.fn((date, fmt) => {
    if (fmt === 'HH:mm') return '14:30';
    if (fmt === 'yyyy-MM-dd') return '2024-01-15';
    if (fmt === 'MM月dd日') return '01月15日';
    return 'formatted-date';
  }),
  isSameDay: jest.fn((date1, date2) => false),
  addDays: jest.fn((date, days) => new Date()),
}));

jest.mock('@/api/offer-ride-api', () => ({
  checkPublishPermission: jest.fn(),
  getPublishConfig: jest.fn(),
  publishRide: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRouter = {
  replace: jest.fn(),
};

const mockRideApi = require('@/api/offer-ride-api');

describe('useOfferRideForm Hook', () => {
  const mockRequestId = 'test-request-id-offer-ride-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue(mockRouter);

    // 默认 mock 权限检查通过
    mockRideApi.checkPublishPermission.mockResolvedValue({
      data: { canPublish: true },
    });

    mockRideApi.getPublishConfig.mockResolvedValue({
      code: 200,
      data: {
        presetTags: [
          { label: '准时出发', value: 'on_time' },
          { label: '可带宠物', value: 'pet_friendly' },
        ],
      },
    });
  });

  describe('初始状态', () => {
    test('返回正确的初始状态', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      expect(result.current.state.departureLocation).toBe('');
      expect(result.current.state.destinationLocation).toBe('');
      expect(result.current.state.availableSeats).toBe(2);
      expect(result.current.state.pricePerPerson).toBe('20');
      expect(result.current.state.additionalNotes).toBe('');
      expect(result.current.state.waypointStops).toEqual([]);
      expect(result.current.state.isPublishingSuccess).toBe(false);
      expect(result.current.state.isRecurringMode).toBe(false);
      expect(result.current.state.selectedTime).toBe('08:30');
      expect(result.current.state.isTimePickerVisible).toBe(false);
    });
  });

  describe('setDepartureLocation 方法', () => {
    test('更新出发地', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDepartureLocation('北京市朝阳区');
      });

      expect(result.current.state.departureLocation).toBe('北京市朝阳区');
    });
  });

  describe('setDestinationLocation 方法', () => {
    test('更新目的地', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDestinationLocation('北京市海淀区');
      });

      expect(result.current.state.destinationLocation).toBe('北京市海淀区');
    });
  });

  describe('setAvailableSeats 方法', () => {
    test('更新可用座位数', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setAvailableSeats(4);
      });

      expect(result.current.state.availableSeats).toBe(4);
    });
  });

  describe('setPricePerPerson 方法', () => {
    test('更新人均价格', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setPricePerPerson('50');
      });

      expect(result.current.state.pricePerPerson).toBe('50');
    });
  });

  describe('setAdditionalNotes 方法', () => {
    test('更新备注', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setAdditionalNotes('准时出发，请勿迟到');
      });

      expect(result.current.state.additionalNotes).toBe('准时出发，请勿迟到');
    });
  });

  describe('setIsRecurringMode 方法', () => {
    test('更新循环模式', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setIsRecurringMode(true);
      });

      expect(result.current.state.isRecurringMode).toBe(true);
    });
  });

  describe('时间选择器', () => {
    test('showTimePicker 显示选择器', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.showTimePicker();
      });

      expect(result.current.state.isTimePickerVisible).toBe(true);
    });

    test('hideTimePicker 隐藏选择器', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.showTimePicker();
        result.current.actions.hideTimePicker();
      });

      expect(result.current.state.isTimePickerVisible).toBe(false);
    });

    test('handleTimeConfirm 更新时间并隐藏选择器', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.showTimePicker();
        result.current.actions.handleTimeConfirm(new Date('2024-01-15T14:30:00'));
      });

      expect(result.current.state.selectedTime).toBe('14:30');
      expect(result.current.state.isTimePickerVisible).toBe(false);
    });
  });

  describe('途径点管理', () => {
    test('handleAddStop 添加途径点', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      // 先设置输入值
      act(() => {
        result.current.actions.setNewStopInput('国贸');
      });

      // 再调用添加方法
      act(() => {
        result.current.actions.handleAddStop();
      });

      expect(result.current.state.waypointStops).toContain('国贸');
      expect(result.current.state.newStopInput).toBe('');
    });

    test('handleAddStop 忽略空输入', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setNewStopInput('   ');
        result.current.actions.handleAddStop();
      });

      expect(result.current.state.waypointStops).toEqual([]);
    });

    test('handleRemoveStop 移除指定途径点', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      // 添加第一个途径点
      act(() => {
        result.current.actions.setNewStopInput('国贸');
      });
      act(() => {
        result.current.actions.handleAddStop();
      });

      // 添加第二个途径点
      act(() => {
        result.current.actions.setNewStopInput('望京');
      });
      act(() => {
        result.current.actions.handleAddStop();
      });

      expect(result.current.state.waypointStops).toEqual(['国贸', '望京']);

      act(() => {
        result.current.actions.handleRemoveStop(0);
      });

      expect(result.current.state.waypointStops).toEqual(['望京']);
    });

    test('handleRemoveStop 处理无效索引', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setNewStopInput('国贸');
      });
      act(() => {
        result.current.actions.handleAddStop();
      });

      // 移除超出范围的索引不应报错
      act(() => {
        result.current.actions.handleRemoveStop(99);
      });

      expect(result.current.state.waypointStops).toEqual(['国贸']);
    });
  });

  describe('appendNoteTag 方法', () => {
    test('追加标签到空备注', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.appendNoteTag('准时出发');
      });

      expect(result.current.state.additionalNotes).toBe('准时出发');
    });

    test('追加标签到已有备注', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setAdditionalNotes('准时出发');
        result.current.actions.appendNoteTag('可带宠物');
      });

      expect(result.current.state.additionalNotes).toBe('准时出发，可带宠物');
    });
  });

  describe('getDateLabel 方法', () => {
    test('返回格式化日期', () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      const label = result.current.actions.getDateLabel(new Date('2024-01-15'));

      expect(typeof label).toBe('string');
    });
  });

  describe('handlePublishRide 方法', () => {
    test('出发地为空时显示提示', async () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      await act(async () => {
        await result.current.actions.handlePublishRide();
      });

      expect(mockRideApi.publishRide).not.toHaveBeenCalled();
    });

    test('目的地为空时显示提示', async () => {
      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDepartureLocation('北京');
      });

      await act(async () => {
        await result.current.actions.handlePublishRide();
      });

      expect(mockRideApi.publishRide).not.toHaveBeenCalled();
    });

    test('发布成功后设置成功状态并跳转', async () => {
      jest.useFakeTimers();

      mockRideApi.publishRide.mockResolvedValue({
        code: 200,
        data: { rideId: 'ride-123' },
      });

      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDepartureLocation('北京朝阳');
        result.current.actions.setDestinationLocation('北京海淀');
      });

      await act(async () => {
        await result.current.actions.handlePublishRide();
      });

      expect(mockRideApi.publishRide).toHaveBeenCalled();
      expect(result.current.state.isPublishingSuccess).toBe(true);

      // 快进定时器触发跳转
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/trips/trips');

      jest.useRealTimers();
    });

    test('发布失败显示错误信息', async () => {
      mockRideApi.publishRide.mockResolvedValue({
        code: 500,
        message: '服务器内部错误',
      });

      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDepartureLocation('北京朝阳');
        result.current.actions.setDestinationLocation('北京海淀');
      });

      await act(async () => {
        await result.current.actions.handlePublishRide();
      });

      expect(result.current.state.isPublishingSuccess).toBe(false);
    });

    test('发布异常捕获并记录错误', async () => {
      mockRideApi.publishRide.mockRejectedValue(new Error('网络错误'));

      const { result } = renderHook(() => useOfferRideForm(mockRequestId));

      act(() => {
        result.current.actions.setDepartureLocation('北京朝阳');
        result.current.actions.setDestinationLocation('北京海淀');
      });

      await act(async () => {
        await result.current.actions.handlePublishRide();
      });

      expect(result.current.state.isPublishingSuccess).toBe(false);
    });
  });

  describe('初始化权限检查', () => {
    test('权限不足时显示提示', async () => {
      mockRideApi.checkPublishPermission.mockResolvedValue({
        data: { canPublish: false },
      });

      const { unmount } = renderHook(() => useOfferRideForm(mockRequestId));

      // 等待 useEffect 完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // 权限检查被调用
      expect(mockRideApi.checkPublishPermission).toHaveBeenCalledWith(mockRequestId);

      unmount();
    });

    test('初始化加载配置成功', async () => {
      const { result, unmount } = renderHook(() => useOfferRideForm(mockRequestId));

      // 等待 useEffect 完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockRideApi.getPublishConfig).toHaveBeenCalledWith(mockRequestId);
      expect(result.current.state.presetTags).toHaveLength(2);

      unmount();
    });

    test('初始化异常处理', async () => {
      mockRideApi.checkPublishPermission.mockRejectedValue(new Error('网络错误'));

      const { unmount } = renderHook(() => useOfferRideForm(mockRequestId));

      // 等待 useEffect 完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // 不应崩溃
      expect(mockRideApi.checkPublishPermission).toHaveBeenCalled();

      unmount();
    });
  });
});
