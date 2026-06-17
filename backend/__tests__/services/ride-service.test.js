/**
 * @file ride-service.test.js
 * @description 行程服务测试 - 覆盖核心业务分支
 */

const rideDao = require('../../src/dao/ride-dao');

// Mock prisma
jest.mock('../../src/config/prisma', () => ({
  searchHistory: {
    create: jest.fn(() => Promise.resolve({})),
    findMany: jest.fn(() => Promise.resolve([])),
  },
  ride: {
    findMany: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve({})),
    update: jest.fn(() => Promise.resolve({})),
  },
  order: {
    create: jest.fn(() => Promise.resolve({})),
    findFirst: jest.fn(() => Promise.resolve(null)),
  },
}));

// Mock DAO
jest.mock('../../src/dao/ride-dao', () => ({
  searchRides: jest.fn(),
  getUserVehicles: jest.fn(),
  createRide: jest.fn(),
  getRideById: jest.fn(),
  createOrder: jest.fn(),
  getPublishConfig: jest.fn(),
  getLocationSuggestions: jest.fn(),
  getSearchMetadata: jest.fn(),
  getSearchPreferences: jest.fn(),
  checkPublishPermission: jest.fn(),
  getRideDetail: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const rideService = require('../../src/service/ride-service');

describe('Ride Service - publishRide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('发布行程 - 车辆校验分支', () => {
    test('无车辆且未指定 vehicleId 时拒绝发布', async () => {
      rideDao.getUserVehicles.mockResolvedValue([]);

      await expect(rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date(),
        seatsTotal: 4,
        price: 100,
        requestId: 'test-request-id',
      })).rejects.toThrow(/还没有添加车辆/);
    });

    test('无车辆但指定了 vehicleId 时允许发布', async () => {
      rideDao.getUserVehicles.mockResolvedValue([]);
      rideDao.createRide.mockResolvedValue({
        ride_id: 'ride_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
        seats_total: 4,
        price: 100,
        ride_status: 'open',
      });

      const result = await rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date(),
        seatsTotal: 4,
        price: 100,
        vehicleId: 'vehicle_001',
        requestId: 'test-request-id',
      });

      expect(result.rideId).toBe('ride_001');
    });

    test('有车辆时允许发布', async () => {
      rideDao.getUserVehicles.mockResolvedValue([{ vehicle_id: 'v_001' }]);
      rideDao.createRide.mockResolvedValue({
        ride_id: 'ride_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
        seats_total: 4,
        price: 100,
        ride_status: 'open',
      });

      const result = await rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date(),
        seatsTotal: 4,
        price: 100,
        requestId: 'test-request-id',
      });

      expect(result.rideId).toBe('ride_001');
      expect(rideDao.createRide).toHaveBeenCalled();
    });
  });

  describe('发布行程 - 成功场景', () => {
    test('成功发布行程并返回正确字段', async () => {
      rideDao.getUserVehicles.mockResolvedValue([{ vehicle_id: 'v_001' }]);
      rideDao.createRide.mockResolvedValue({
        ride_id: 'ride_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date('2024-01-01'),
        seats_total: 4,
        price: 100,
        ride_status: 'open',
      });

      const result = await rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date('2024-01-01'),
        seatsTotal: 4,
        price: 100,
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('rideId');
      expect(result).toHaveProperty('fromText', '北京');
      expect(result).toHaveProperty('toText', '上海');
      expect(result).toHaveProperty('status', 'open');
    });
  });
});

describe('Ride Service - bookRide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('预订行程 - 行程不存在分支', () => {
    test('行程不存在时抛出 404 错误', async () => {
      rideDao.getRideById.mockResolvedValue(null);

      await expect(rideService.bookRide({
        userId: 'user_001',
        rideId: 'non_existent_ride',
        seats: 2,
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程不存在/);
    });
  });

  describe('预订行程 - 座位边界分支', () => {
    test('座位充足时预订成功', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 4,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });
      rideDao.createOrder.mockResolvedValue({
        order_id: 'order_001',
        request_id: 'tp_001',
        order_status: 'pending',
        created_at: new Date(),
      });

      const result = await rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 2,
        requestId: 'test-request-id',
      });

      expect(result.orderId).toBe('order_001');
    });

    test('座位刚好够时预订成功（边界值）', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 2,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });
      rideDao.createOrder.mockResolvedValue({
        order_id: 'order_001',
        request_id: 'tp_001',
        order_status: 'pending',
        created_at: new Date(),
      });

      const result = await rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 2,
        requestId: 'test-request-id',
      });

      expect(result.orderId).toBe('order_001');
    });

    test('座位不足时拒绝预订', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 1,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });

      await expect(rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 2,
        requestId: 'test-request-id',
      })).rejects.toThrow(/剩余座位不足/);
    });

    test('没有剩余座位时拒绝预订', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 0,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });

      await expect(rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 1,
        requestId: 'test-request-id',
      })).rejects.toThrow(/剩余座位不足/);
    });
  });

  describe('预订行程 - 身份冲突分支', () => {
    test('司机不能预订自己发布的行程', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'user_001', // 同一个用户
        seats_left: 4,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });

      await expect(rideService.bookRide({
        userId: 'user_001', // 与 driver_id 相同
        rideId: 'ride_001',
        seats: 1,
        requestId: 'test-request-id',
      })).rejects.toThrow(/不能预约自己发布的行程/);
    });

    test('其他用户可以预订行程', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 4,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });
      rideDao.createOrder.mockResolvedValue({
        order_id: 'order_001',
        request_id: 'tp_001',
        order_status: 'pending',
        created_at: new Date(),
      });

      const result = await rideService.bookRide({
        userId: 'passenger_001', // 不同的用户
        rideId: 'ride_001',
        seats: 1,
        requestId: 'test-request-id',
      });

      expect(result.orderId).toBe('order_001');
    });
  });
});

describe('Ride Service - searchRides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('搜索行程 - 结果分支', () => {
    test('有匹配行程时返回列表', async () => {
      rideDao.searchRides.mockResolvedValue({
        rides: [
          {
            ride_id: 'ride_001',
            from_text: '北京',
            to_text: '上海',
            seats_left: 3,
            price: 100,
          },
        ],
        total: 1,
      });

      const result = await rideService.searchRides({
        fromText: '北京',
        toText: '上海',
        departDate: '2024-01-01',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    test('无匹配行程时返回空列表', async () => {
      rideDao.searchRides.mockResolvedValue({
        rides: [],
        total: 0,
      });

      const result = await rideService.searchRides({
        fromText: '北京',
        toText: '广州',
        departDate: '2024-01-01',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(result.list).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
