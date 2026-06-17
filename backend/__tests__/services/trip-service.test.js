/**
 * @file trip-service.test.js
 * @description 行程服务测试 - 覆盖核心业务分支（状态流转、权限校验）
 */

// Mock 依赖（必须在导入模块前）
jest.mock('../../src/dao/trip-dao', () => ({
  getUserTrips: jest.fn(),
  getTripById: jest.fn(),
  updateTripStatus: jest.fn(),
  getTripWithDetails: jest.fn(),
  recordTripRating: jest.fn(),
  hasTripRating: jest.fn(),
  getUserTripTemplates: jest.fn(),
  getOrderByTripId: jest.fn(),
  listParticipantUserIdsByTrip: jest.fn(),
}));

jest.mock('../../src/dao/ride-dao', () => ({
  getRideById: jest.fn(),
}));

jest.mock('../../src/service/privacy-service', () => ({
  getProxyNumberForPair: jest.fn(),
}));

jest.mock('../../src/service/payments-service', () => ({
  issueRefund: jest.fn(),
}));

jest.mock('../../src/service/notification-service', () => ({
  createNotification: jest.fn(),
}));

jest.mock('../../src/config/prisma', () => ({
  cancelReason: {
    findMany: jest.fn(),
  },
  orderRating: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    aggregate: jest.fn(),
  },
  userProfile: {
    update: jest.fn(),
  },
  tripTemplate: {
    findMany: jest.fn(),
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const tripService = require('../../src/service/trip-service');
const tripDao = require('../../src/dao/trip-dao');
const prisma = require('../../src/config/prisma');

// ────────────────────────────────────────────────────────────
// 工具函数：构造指定状态的行程
// ────────────────────────────────────────────────────────────
const tripWith = (status, extra = {}) => ({
  trip_id: 'trip_001',
  user_id: 'user_001',
  ride_id: 'ride_001',
  status,
  role: 'passenger',
  ...extra,
});

const tripWithDetails = (status, extra = {}) => ({
  trip_id: 'trip_001',
  user_id: 'user_001',
  ride_id: 'ride_001',
  status,
  role: 'passenger',
  booked_seats: 2,
  ride: {
    driver_id: 'driver_001',
    from_text: '北京',
    to_text: '上海',
    price: 100,
    depart_at: new Date(),
    driver: {
      user_id: 'driver_001',
      user_name: '司机张三',
      avatar_url: 'https://example.com/avatar.png',
      phone: '13800138000',
      profile: { rating_avg: 4.8 },
    },
    vehicle: {
      vehicle_id: 'v_001',
      plate_number: '京A12345',
      brand: '丰田',
      model: '卡罗拉',
      color: '白色',
    },
    participants: [],
  },
  ...extra,
});

// ────────────────────────────────────────────────────────────
// 一、取消行程（cancelTrip）：状态流转与权限校验
// ────────────────────────────────────────────────────────────
describe('Trip Service - cancelTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('取消行程 - 行程存在性分支', () => {
    test('行程不存在时抛出 404 错误', async () => {
      tripDao.getTripById.mockResolvedValue(null);

      await expect(tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'nonexistent_trip',
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程不存在/);
    });
  });

  describe('取消行程 - 权限校验分支', () => {
    test('非行程所有者取消时拒绝', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending', { user_id: 'user_001' }));

      await expect(tripService.cancelTrip({
        userId: 'other_user', // 不同的用户
        tripId: 'trip_001',
        requestId: 'test-request-id',
      })).rejects.toThrow(/无权取消/);
    });

    test('行程所有者可以取消', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending', { user_id: 'user_001' }));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const result = await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        cancelReason: '临时有事',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
      expect(tripDao.updateTripStatus).toHaveBeenCalled();
    });
  });

  describe('取消行程 - 状态流转分支', () => {
    test('已取消的行程再次取消时拒绝', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('cancelled'));

      await expect(tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程已取消/);
    });

    test('待处理状态可取消', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const result = await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        cancelReason: '临时有事',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
    });

    test('进行中状态可取消', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('in_progress'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const result = await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        cancelReason: '临时有事',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('取消行程 - 退款处理分支', () => {
    test('有订单时尝试发起退款', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue({
        order_id: 'order_001',
        amount: 100,
      });
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const paymentsService = require('../../src/service/payments-service');
      paymentsService.issueRefund.mockResolvedValue({ success: true });

      await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      expect(paymentsService.issueRefund).toHaveBeenCalled();
    });

    test('无订单时跳过退款', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const paymentsService = require('../../src/service/payments-service');

      await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      expect(paymentsService.issueRefund).not.toHaveBeenCalled();
    });
  });

  describe('取消行程 - 通知处理分支', () => {
    test('有其他参与者时发送通知', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue(['user_002', 'user_003']);

      const notificationService = require('../../src/service/notification-service');
      notificationService.createNotification.mockResolvedValue({ success: true });

      await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      // 通知其他两个参与者
      expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    });

    test('无其他参与者时不发送通知', async () => {
      tripDao.getTripById.mockResolvedValue(tripWith('pending'));
      tripDao.updateTripStatus.mockResolvedValue({ success: true });
      tripDao.getOrderByTripId.mockResolvedValue(null);
      tripDao.listParticipantUserIdsByTrip.mockResolvedValue([]);

      const notificationService = require('../../src/service/notification-service');

      await tripService.cancelTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });
  });
});

// ────────────────────────────────────────────────────────────
// 二、评价行程（rateTrip）：状态校验与重复评价
// ────────────────────────────────────────────────────────────
describe('Trip Service - rateTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('评价行程 - 行程存在性分支', () => {
    test('行程不存在时抛出 404 错误', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(null);

      await expect(tripService.rateTrip({
        userId: 'user_001',
        tripId: 'nonexistent_trip',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程不存在/);
    });
  });

  describe('评价行程 - 权限校验分支', () => {
    test('非行程参与者评价时拒绝', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed', { user_id: 'user_001' }));

      await expect(tripService.rateTrip({
        userId: 'other_user',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/无权评价/);
    });
  });

  describe('评价行程 - 状态校验分支', () => {
    test('未完成的行程不能评价', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('pending'));

      await expect(tripService.rateTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/只能评价已完成的行程/);
    });

    test('已取消的行程不能评价', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('cancelled'));

      await expect(tripService.rateTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/只能评价已完成的行程/);
    });

    test('已完成的行程可以评价', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed'));
      tripDao.hasTripRating.mockResolvedValue(false);
      tripDao.recordTripRating.mockResolvedValue({ success: true });
      prisma.orderRating.findMany.mockResolvedValue([]);
      prisma.userProfile.update.mockResolvedValue({});

      const result = await tripService.rateTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        rating: 5,
        comment: '非常满意',
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('评价行程 - 重复评价分支', () => {
    test('已评价的行程不能再次评价', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed'));
      tripDao.hasTripRating.mockResolvedValue(true);

      await expect(tripService.rateTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程已评价/);
    });
  });

  describe('评价行程 - 评价对象分支', () => {
    test('乘客评价时找到司机作为评价对象', async () => {
      const trip = tripWithDetails('completed', { role: 'passenger' });
      tripDao.getTripWithDetails.mockResolvedValue(trip);
      tripDao.hasTripRating.mockResolvedValue(false);
      tripDao.recordTripRating.mockResolvedValue({ success: true });
      prisma.orderRating.findMany.mockResolvedValue([]);
      prisma.userProfile.update.mockResolvedValue({});

      await tripService.rateTrip({
        userId: 'user_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      });

      expect(tripDao.recordTripRating).toHaveBeenCalledWith(
        expect.objectContaining({ toUserId: 'driver_001' })
      );
    });

    test('司机评价时找到乘客作为评价对象', async () => {
      const trip = tripWithDetails('completed', {
        role: 'driver',
        user_id: 'driver_001',
      });
      trip.ride.participants = [{ user_id: 'passenger_001' }];
      tripDao.getTripWithDetails.mockResolvedValue(trip);
      tripDao.hasTripRating.mockResolvedValue(false);
      tripDao.recordTripRating.mockResolvedValue({ success: true });
      prisma.orderRating.findMany.mockResolvedValue([]);
      prisma.userProfile.update.mockResolvedValue({});

      await tripService.rateTrip({
        userId: 'driver_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      });

      expect(tripDao.recordTripRating).toHaveBeenCalledWith(
        expect.objectContaining({ toUserId: 'passenger_001' })
      );
    });

    test('找不到评价对象时拒绝', async () => {
      const trip = tripWithDetails('completed', {
        role: 'driver',
        user_id: 'driver_001',
      });
      trip.ride.participants = []; // 没有乘客
      tripDao.getTripWithDetails.mockResolvedValue(trip);

      await expect(tripService.rateTrip({
        userId: 'driver_001',
        tripId: 'trip_001',
        rating: 5,
        requestId: 'test-request-id',
      })).rejects.toThrow(/未找到可评价对象/);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 三、获取行程详情（getTripDetail）：权限校验
// ────────────────────────────────────────────────────────────
describe('Trip Service - getTripDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('行程详情 - 存在性分支', () => {
    test('行程不存在时抛出 404 错误', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(null);

      await expect(tripService.getTripDetail({
        userId: 'user_001',
        tripId: 'nonexistent_trip',
        requestId: 'test-request-id',
      })).rejects.toThrow(/行程不存在/);
    });
  });

  describe('行程详情 - 权限校验分支', () => {
    test('非行程参与者查看时拒绝', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed', { user_id: 'user_001' }));

      await expect(tripService.getTripDetail({
        userId: 'other_user',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      })).rejects.toThrow(/无权查看/);
    });

    test('行程参与者可以查看详情', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed'));

      const result = await tripService.getTripDetail({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('tripId');
      expect(result).toHaveProperty('status');
    });
  });

  describe('行程详情 - 返回数据完整性', () => {
    test('返回完整的行程信息', async () => {
      tripDao.getTripWithDetails.mockResolvedValue(tripWithDetails('completed'));

      const result = await tripService.getTripDetail({
        userId: 'user_001',
        tripId: 'trip_001',
        requestId: 'test-request-id',
      });

      expect(result).toHaveProperty('tripId', 'trip_001');
      expect(result).toHaveProperty('rideId');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('driver');
      expect(result).toHaveProperty('vehicle');
      expect(result).toHaveProperty('participants');
    });
  });
});

// ────────────────────────────────────────────────────────────
// 四、获取取消原因（getCancelReasons）：类型分支
// ────────────────────────────────────────────────────────────
describe('Trip Service - getCancelReasons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('取消原因 - 数据库读取分支', () => {
    test('数据库有数据时返回数据库结果', async () => {
      prisma.cancelReason.findMany.mockResolvedValue([
        { id: 1, reason: '临时有事' },
        { id: 2, reason: '行程变更' },
      ]);

      const result = await tripService.getCancelReasons({
        type: 'passenger',
        requestId: 'test-request-id',
      });

      expect(result.reasons).toHaveLength(2);
      expect(result.reasons[0]).toHaveProperty('reason', '临时有事');
    });

    test('数据库为空时返回默认原因', async () => {
      prisma.cancelReason.findMany.mockResolvedValue([]);

      const result = await tripService.getCancelReasons({
        type: 'passenger',
        requestId: 'test-request-id',
      });

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toHaveProperty('id');
      expect(result.reasons[0]).toHaveProperty('reason');
    });

    test('数据库错误时返回默认原因', async () => {
      prisma.cancelReason.findMany.mockRejectedValue(new Error('DB Error'));

      const result = await tripService.getCancelReasons({
        type: 'passenger',
        requestId: 'test-request-id',
      });

      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('取消原因 - 类型分支', () => {
    test('乘客类型返回乘客取消原因', async () => {
      prisma.cancelReason.findMany.mockResolvedValue([]);

      const result = await tripService.getCancelReasons({
        type: 'passenger',
        requestId: 'test-request-id',
      });

      expect(result.reasons.some(r => r.reason.includes('临时有事'))).toBe(true);
    });

    test('司机类型返回司机取消原因', async () => {
      prisma.cancelReason.findMany.mockResolvedValue([]);

      const result = await tripService.getCancelReasons({
        type: 'driver',
        requestId: 'test-request-id',
      });

      expect(result.reasons.some(r => r.reason.includes('车辆故障'))).toBe(true);
    });

    test('未知类型默认返回乘客原因', async () => {
      prisma.cancelReason.findMany.mockResolvedValue([]);

      const result = await tripService.getCancelReasons({
        type: 'unknown',
        requestId: 'test-request-id',
      });

      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 五、获取行程列表（getTripList）：状态过滤分支
// ────────────────────────────────────────────────────────────
describe('Trip Service - getTripList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('行程列表 - 数据返回分支', () => {
    test('有行程时返回列表', async () => {
      tripDao.getUserTrips.mockResolvedValue({
        trips: [{
          trip_id: 'trip_001',
          ride_id: 'ride_001',
          role: 'passenger',
          status: 'completed',
          ride: {
            from_text: '北京',
            to_text: '上海',
            depart_at: new Date(),
            price: 100,
            driver: { user_name: '司机张三' },
            vehicle: { brand: '丰田', model: '卡罗拉' },
          },
        }],
        total: 1,
      });

      const result = await tripService.getTripList({
        userId: 'user_001',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(result.trips).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    test('无行程时返回空列表', async () => {
      tripDao.getUserTrips.mockResolvedValue({ trips: [], total: 0 });

      const result = await tripService.getTripList({
        userId: 'user_001',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(result.trips).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('行程列表 - 状态过滤分支', () => {
    test('指定状态时按状态过滤', async () => {
      tripDao.getUserTrips.mockResolvedValue({ trips: [], total: 0 });

      await tripService.getTripList({
        userId: 'user_001',
        status: 'completed',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(tripDao.getUserTrips).toHaveBeenCalledWith(
        'user_001',
        'completed',
        1,
        10,
        'test-request-id'
      );
    });

    test('不指定状态时返回所有状态', async () => {
      tripDao.getUserTrips.mockResolvedValue({ trips: [], total: 0 });

      await tripService.getTripList({
        userId: 'user_001',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(tripDao.getUserTrips).toHaveBeenCalledWith(
        'user_001',
        undefined,
        1,
        10,
        'test-request-id'
      );
    });
  });
});
