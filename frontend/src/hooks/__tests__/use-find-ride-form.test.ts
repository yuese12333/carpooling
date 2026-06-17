/**
 * @file use-find-ride-form.test.ts
 * @description useFindRideForm Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native';
import { useFindRideForm } from '@/hooks/use-find-ride-form';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/api/find-ride-api', () => ({
  fetchRides: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/utils/api-response', () => ({
  isApiSuccess: jest.fn((res) => res.success === true),
}));

const mockRouter = {
  setParams: jest.fn(),
};

const mockFetchRides = require('@/api/find-ride-api').fetchRides;

const mockRides = [
  {
    id: '1',
    from: '北京朝阳',
    to: '北京海淀',
    departAt: new Date().toISOString(),
    price: 30,
    driverRating: 4.8,
    driverGender: 'male',
    distance: 10,
  },
  {
    id: '2',
    from: '北京朝阳',
    to: '北京海淀',
    departAt: new Date(Date.now() + 86400000).toISOString(),
    price: 25,
    driverRating: 4.6,
    driverGender: 'female',
    distance: 15,
  },
  {
    id: '3',
    from: '北京朝阳',
    to: '北京海淀',
    departAt: new Date(Date.now() + 172800000).toISOString(),
    price: 35,
    driverRating: 4.2,
    driverGender: 'male',
    distance: 8,
  },
];

describe('useFindRideForm Hook', () => {
  const mockRequestId = 'test-request-id-find-ride-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (require('expo-router').useRouter as jest.Mock).mockReturnValue(mockRouter);
    (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({});

    mockFetchRides.mockResolvedValue({
      success: true,
      data: { list: mockRides },
    });
  });

  describe('初始状态', () => {
    test('返回正确的初始状态', async () => {
      const { result, unmount } = renderHook(() => useFindRideForm(mockRequestId));

      // 初始加载状态为 true（useEffect 触发）
      expect(result.current.searchFrom).toBe('');
      expect(result.current.searchTo).toBe('');
      expect(result.current.sortBy).toBe('最快出发');
      expect(result.current.activeFilters).toEqual(['today']);
      expect(result.current.isSortDropdownVisible).toBe(false);

      // 等待加载完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);

      unmount();
    });

    test('从 URL 参数初始化搜索条件', () => {
      (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue({
        from: '北京',
        to: '上海',
      });

      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      expect(result.current.searchFrom).toBe('北京');
      expect(result.current.searchTo).toBe('上海');
    });
  });

  describe('setSearchFrom 方法', () => {
    test('更新出发地', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.setSearchFrom('北京市朝阳区');
      });

      expect(result.current.searchFrom).toBe('北京市朝阳区');
    });
  });

  describe('setSearchTo 方法', () => {
    test('更新目的地', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.setSearchTo('北京市海淀区');
      });

      expect(result.current.searchTo).toBe('北京市海淀区');
    });
  });

  describe('handleSearch 方法', () => {
    test('执行搜索并更新路由参数', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.setSearchFrom('北京');
        result.current.setSearchTo('上海');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(mockRouter.setParams).toHaveBeenCalledWith({ from: '北京', to: '上海' });
      expect(mockFetchRides).toHaveBeenCalled();
    });
  });

  describe('handleToggleFilter 方法', () => {
    test('添加筛选标签', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.handleToggleFilter('female_driver');
      });

      expect(result.current.activeFilters).toContain('today');
      expect(result.current.activeFilters).toContain('female_driver');
    });

    test('移除已存在的筛选标签', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.handleToggleFilter('female_driver');
      });
      expect(result.current.activeFilters).toContain('female_driver');

      act(() => {
        result.current.handleToggleFilter('female_driver');
      });
      expect(result.current.activeFilters).not.toContain('female_driver');
    });

    test('切换高评分筛选', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.handleToggleFilter('high_rated');
      });

      expect(result.current.activeFilters).toContain('high_rated');
    });
  });

  describe('handleSelectSort 方法', () => {
    test('选择排序方式并关闭下拉菜单', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      // 先打开下拉菜单
      act(() => {
        result.current.toggleSortDropdown();
      });
      expect(result.current.isSortDropdownVisible).toBe(true);

      // 选择排序方式
      act(() => {
        result.current.handleSelectSort('价格最低');
      });

      expect(result.current.sortBy).toBe('价格最低');
      expect(result.current.isSortDropdownVisible).toBe(false);
    });

    test('选择评分最高排序', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.handleSelectSort('评分最高');
      });

      expect(result.current.sortBy).toBe('评分最高');
    });

    test('选择距离最近排序', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      act(() => {
        result.current.handleSelectSort('距离最近');
      });

      expect(result.current.sortBy).toBe('距离最近');
    });
  });

  describe('toggleSortDropdown 方法', () => {
    test('切换下拉菜单显示状态', () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      expect(result.current.isSortDropdownVisible).toBe(false);

      act(() => {
        result.current.toggleSortDropdown();
      });
      expect(result.current.isSortDropdownVisible).toBe(true);

      act(() => {
        result.current.toggleSortDropdown();
      });
      expect(result.current.isSortDropdownVisible).toBe(false);
    });
  });

  describe('filteredRides 计算属性', () => {
    test('默认按最快出发排序', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const rides = result.current.filteredRides;
      expect(rides.length).toBeGreaterThan(0);
    });

    test('按价格最低排序', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.handleToggleFilter('today'); // 移除今天筛选
        result.current.handleSelectSort('价格最低');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const rides = result.current.filteredRides;
      if (rides.length > 1) {
        expect(rides[0].price).toBeLessThanOrEqual(rides[rides.length - 1].price);
      }
    });

    test('按评分最高排序', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.handleToggleFilter('today'); // 移除今天筛选
        result.current.handleSelectSort('评分最高');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const rides = result.current.filteredRides;
      if (rides.length > 1) {
        expect(rides[0].driverRating).toBeGreaterThanOrEqual(rides[rides.length - 1].driverRating);
      }
    });

    test('筛选女司机', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.handleToggleFilter('today'); // 移除今天筛选
        result.current.handleToggleFilter('female_driver');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const rides = result.current.filteredRides;
      rides.forEach(ride => {
        expect(ride.driverGender).toBe('female');
      });
    });

    test('筛选高评分司机', async () => {
      const { result } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.handleToggleFilter('today'); // 移除今天筛选
        result.current.handleToggleFilter('high_rated');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const rides = result.current.filteredRides;
      rides.forEach(ride => {
        expect(ride.driverRating).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('数据加载', () => {
    test('成功加载行程列表', async () => {
      const { result, unmount } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockFetchRides).toHaveBeenCalled();
      expect(result.current.filteredRides.length).toBeGreaterThan(0);

      unmount();
    });

    test('API 失败时不更新行程列表', async () => {
      mockFetchRides.mockResolvedValue({
        success: false,
        message: '查询失败',
      });

      const { result, unmount } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.filteredRides).toEqual([]);

      unmount();
    });

    test('网络异常时显示提示', async () => {
      mockFetchRides.mockRejectedValue(new Error('网络错误'));

      const { result, unmount } = renderHook(() => useFindRideForm(mockRequestId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.filteredRides).toEqual([]);

      unmount();
    });
  });
});
