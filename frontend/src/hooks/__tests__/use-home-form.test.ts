/**
 * @file use-home-form.test.ts
 * @description useHomeForm Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native';
import { useHomeForm } from '@/hooks/use-home-form';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

jest.mock('@/store/env-store', () => ({
  useEnvStore: jest.fn(() => ({
    isMockMode: true,
    toggleMockMode: jest.fn(),
  })),
}));

jest.mock('@/api/home-api', () => ({
  HomeService: {
    getUserInfo: jest.fn(),
    getRecommendRides: jest.fn(),
    getStatistics: jest.fn(),
    getUnreadStatus: jest.fn(),
  },
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
  push: jest.fn(),
};

const mockLocation = {
  requestForegroundPermissionsAsync: require('expo-location').requestForegroundPermissionsAsync,
  getCurrentPositionAsync: require('expo-location').getCurrentPositionAsync,
};

const mockHomeService = require('@/api/home-api').HomeService;

describe('useHomeForm Hook', () => {
  const mockRequestId = 'test-request-id-home-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('初始状态', () => {
    test('返回正确的初始状态', () => {
      // Mock 位置权限拒绝
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      // Mock API 响应
      mockHomeService.getUserInfo.mockResolvedValue({
        success: true,
        data: { name: '测试用户', phone: '138****8000' },
      });
      mockHomeService.getRecommendRides.mockResolvedValue({
        success: true,
        data: [],
      });
      mockHomeService.getStatistics.mockResolvedValue({
        success: true,
        data: { totalRides: 10, savedCarbon: 50, savedMoney: 100 },
      });
      mockHomeService.getUnreadStatus.mockResolvedValue({
        success: true,
        data: { hasUnread: false },
      });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      expect(result.current.fromLocation).toBe('');
      expect(result.current.toLocation).toBe('');
      expect(result.current.selectedDate).toBe('今天');
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('setFromLocation 方法', () => {
    test('更新出发地', () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      act(() => {
        result.current.setFromLocation('北京市朝阳区');
      });

      expect(result.current.fromLocation).toBe('北京市朝阳区');
    });
  });

  describe('setToLocation 方法', () => {
    test('更新目的地', () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      act(() => {
        result.current.setToLocation('北京市海淀区');
      });

      expect(result.current.toLocation).toBe('北京市海淀区');
    });
  });

  describe('setSelectedDate 方法', () => {
    test('更新选中日期', () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      act(() => {
        result.current.setSelectedDate('明天');
      });

      expect(result.current.selectedDate).toBe('明天');
    });
  });

  describe('handleSearch 方法', () => {
    test('出发地为空时显示提示', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      // 等待初始化完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setToLocation('目的地');
      });

      await act(async () => {
        result.current.handleSearch();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('目的地为空时显示提示', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setFromLocation('出发地');
      });

      await act(async () => {
        result.current.handleSearch();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('搜索成功跳转到找车页', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setFromLocation('北京');
        result.current.setToLocation('上海');
        result.current.setSelectedDate('今天');
      });

      await act(async () => {
        result.current.handleSearch();
      });

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/find-ride/find-ride',
        params: {
          from: '北京',
          to: '上海',
          date: '今天',
        },
      });
    });
  });

  describe('navigateTo 方法', () => {
    test('跳转到指定路径', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.navigateTo('/profile/profile');
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/profile/profile');
    });

    test('跳转到带参数的路径', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const pathWithParams = {
        pathname: '/ride/ride-detail',
        params: { id: '123' },
      };

      act(() => {
        result.current.navigateTo(pathWithParams);
      });

      expect(mockRouter.push).toHaveBeenCalledWith(pathWithParams);
    });
  });

  describe('数据加载', () => {
    test('位置权限 granted 时获取设备位置', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 39.9042,
          longitude: 116.4074,
        },
      });
      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: [] });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalled();
      expect(mockHomeService.getRecommendRides).toHaveBeenCalledWith(39.9042, 116.4074, mockRequestId);
    });

    test('成功加载所有数据', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const mockUserInfo = { name: '张三', phone: '138****0001' };
      const mockRides = [
        { id: '1', from: '北京', to: '上海', date: '2024-01-01' },
        { id: '2', from: '北京', to: '天津', date: '2024-01-02' },
      ];
      const mockStats = { totalRides: 20, savedCarbon: 100, savedMoney: 500 };

      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: mockUserInfo });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: mockRides });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: mockStats });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: true } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.userInfo).toEqual(mockUserInfo);
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.hasUnread).toBe(true);
      expect(result.current.featuredRides).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
    });

    test('API 失败时不更新状态', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      mockHomeService.getUserInfo.mockResolvedValue({ success: false, message: '未登录' });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: false });
      mockHomeService.getStatistics.mockResolvedValue({ success: false });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.userInfo).toBeNull();
      expect(result.current.stats).toBeNull();
      expect(result.current.hasUnread).toBe(false);
      expect(result.current.featuredRides).toEqual([]);
    });
  });

  describe('featuredRides 计算属性', () => {
    test('返回前三个推荐行程', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const mockRides = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
      ];

      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: mockRides });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.featuredRides).toHaveLength(3);
      expect(result.current.featuredRides[0].id).toBe('1');
      expect(result.current.featuredRides[2].id).toBe('3');
    });

    test('行程少于三个时返回全部', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const mockRides = [{ id: '1' }];

      mockHomeService.getUserInfo.mockResolvedValue({ success: true, data: null });
      mockHomeService.getRecommendRides.mockResolvedValue({ success: true, data: mockRides });
      mockHomeService.getStatistics.mockResolvedValue({ success: true, data: null });
      mockHomeService.getUnreadStatus.mockResolvedValue({ success: true, data: { hasUnread: false } });

      const { result } = renderHook(() => useHomeForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.featuredRides).toHaveLength(1);
    });
  });
});
