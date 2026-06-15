/**
 * 行程服务测试
 */
const rideService = require('../../src/service/ride-service');
const rideDao = require('../../src/dao/ride-dao');

jest.mock('../../src/dao/ride-dao');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Ride Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchRides', () => {
    it('should return rides list', async () => {
      const mockRides = {
        rides: [
          {
            ride_id: 'ride_001',
            from_text: '北京',
            to_text: '上海',
            depart_at: new Date(),
            seats_left: 3,
            price: 100,
            driver: { user_name: 'Driver 1' },
          },
        ],
        total: 1,
      };

      rideDao.searchRides.mockResolvedValue(mockRides);

      const result = await rideService.searchRides({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departDate: '2024-01-01',
        page: 1,
        pageSize: 10,
        requestId: 'test-request-id',
      });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(rideDao.searchRides).toHaveBeenCalled();
    });
  });

  describe('publishRide', () => {
    it('should publish a ride successfully', async () => {
      rideDao.getUserVehicles.mockResolvedValue([{ vehicle_id: 'v_001' }]);
      rideDao.createRide.mockResolvedValue({
        ride_id: 'ride_001',
        from_text: '北京',
        to_text: '上海',
        price: 100,
      });

      const result = await rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date(),
        seatsTotal: 4,
        price: 100,
        vehicleId: 'v_001',
        requestId: 'test-request-id',
      });

      expect(result.rideId).toBe('ride_001');
    });

    it('should fail if user has no vehicle', async () => {
      rideDao.getUserVehicles.mockResolvedValue([]);

      await expect(rideService.publishRide({
        userId: 'user_001',
        fromText: '北京',
        toText: '上海',
        departAt: new Date(),
        seatsTotal: 4,
        price: 100,
        requestId: 'test-request-id',
      })).rejects.toThrow('您还没有添加车辆');
    });
  });

  describe('bookRide', () => {
    it('should book a ride successfully', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 3,
        vehicle_id: 'v_001',
        from_text: '北京',
        to_text: '上海',
        depart_at: new Date(),
      });
      rideDao.createOrder.mockResolvedValue({
        order_id: 'order_001',
        request_id: 'tp_001',
      });

      const result = await rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 2,
        requestId: 'test-request-id',
      });

      expect(result.orderId).toBe('order_001');
    });

    it('should fail if not enough seats', async () => {
      rideDao.getRideById.mockResolvedValue({
        ride_id: 'ride_001',
        driver_id: 'driver_001',
        seats_left: 1,
      });

      await expect(rideService.bookRide({
        userId: 'user_001',
        rideId: 'ride_001',
        seats: 2,
        requestId: 'test-request-id',
      })).rejects.toThrow('剩余座位不足');
    });
  });
});
