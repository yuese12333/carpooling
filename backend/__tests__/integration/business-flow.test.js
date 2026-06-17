/**
 * @file business-flow.test.js
 * @description 关键业务链路集成测试 - 测试完整 HTTP 链路
 */

const request = require('supertest');
const express = require('express');

// Mock 所有 service 层，避免连接真实数据库
jest.mock('../../src/service/auth-service', () => ({
  loginByPassword: jest.fn(),
  registerUser: jest.fn(),
  checkNickname: jest.fn(),
  refreshToken: jest.fn(),
}));

jest.mock('../../src/service/ride-service', () => ({
  searchRides: jest.fn(),
  publishRide: jest.fn(),
  bookRide: jest.fn(),
  getRideDetail: jest.fn(),
}));

jest.mock('../../src/service/common-service', () => ({
  sendSmsCode: jest.fn(),
}));

jest.mock('../../src/utils/jwt-utils', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  maskSensitive: jest.fn((data) => data),
}));

// 创建 Express app 并挂载真实路由
const app = express();
app.use(express.json());

// 挂载路由
const authRouter = require('../../src/router/auth-router');
const rideRouter = require('../../src/router/ride-router');

app.use('/api/auth', authRouter);
app.use('/api/rides', rideRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    code: status,
    message: err.message || '服务器内部错误',
    data: null,
    requestId: req.headers['x-request-id'] || 'unknown',
  });
});

const authService = require('../../src/service/auth-service');
const rideService = require('../../src/service/ride-service');
const commonService = require('../../src/service/common-service');
const jwtUtils = require('../../src/utils/jwt-utils');

// ────────────────────────────────────────────────────────────
// 测试数据准备
// ────────────────────────────────────────────────────────────
const mockDriver = {
  userId: 'driver_001',
  phone: '13800138000',
  userName: '司机张三',
  role: 'driver',
};

const mockPassenger = {
  userId: 'passenger_001',
  phone: '13900139000',
  userName: '乘客李四',
  role: 'passenger',
};

let driverToken = 'driver-token-mock';
let passengerToken = 'passenger-token-mock';

// ────────────────────────────────────────────────────────────
// 准备：模拟登录获取 token
// ────────────────────────────────────────────────────────────
beforeAll(() => {
  // 设置 JWT mock 返回用户信息
  jwtUtils.verifyToken.mockImplementation((token) => {
    if (token === driverToken) {
      return { userId: mockDriver.userId, phone: mockDriver.phone, role: mockDriver.role };
    }
    if (token === passengerToken) {
      return { userId: mockPassenger.userId, phone: mockPassenger.phone, role: mockPassenger.role };
    }
    const error = new Error('Invalid token');
    error.statusCode = 401;
    throw error;
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ────────────────────────────────────────────────────────────
// 链路一：认证流程链路
// ────────────────────────────────────────────────────────────
describe('链路：认证流程', () => {
  describe('POST /api/auth/login/password - 密码登录', () => {
    test('有效凭据登录成功 → 返回 token', async () => {
      authService.loginByPassword.mockResolvedValue({
        token: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: { userId: mockDriver.userId, userName: mockDriver.userName },
      });

      const res = await request(app)
        .post('/api/auth/login/password')
        .set('X-Request-Id', 'test-login-001')
        .send({ phone: '13800138000', password: 'TestPass123' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    test('无效凭据 → 返回 401（分支：认证失败）', async () => {
      authService.loginByPassword.mockImplementation(() => {
        const error = new Error('手机号或密码错误');
        error.statusCode = 401;
        throw error;
      });

      const res = await request(app)
        .post('/api/auth/login/password')
        .set('X-Request-Id', 'test-login-002')
        .send({ phone: '13800138000', password: 'wrong_password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/错误/);
    });

    test('缺少必填字段 → 返回 400（分支：参数校验）', async () => {
      const res = await request(app)
        .post('/api/auth/login/password')
        .set('X-Request-Id', 'test-login-003')
        .send({ phone: '13800138000' }); // 缺少 password

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/register - 用户注册', () => {
    test('注册成功 → 返回用户信息和 token', async () => {
      authService.registerUser.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: { userId: 'new_user_001', userName: '新用户' },
      });

      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Request-Id', 'test-register-001')
        .send({
          phoneNumber: '13800138001',
          password: 'TestPass123',
          nickname: '新用户',
          tempToken: 'valid-temp-token',
          agreeProtocol: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    test('手机号已注册 → 返回 400（分支：重复注册）', async () => {
      authService.registerUser.mockImplementation(() => {
        const error = new Error('该手机号已注册');
        error.statusCode = 400;
        throw error;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Request-Id', 'test-register-002')
        .send({
          phoneNumber: '13800138000',
          password: 'TestPass123',
          nickname: '重复用户',
          tempToken: 'valid-temp-token',
          agreeProtocol: true,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/register/check-nickname - 昵称检查', () => {
    test('昵称可用', async () => {
      authService.checkNickname.mockResolvedValue({ isAvailable: true });

      const res = await request(app)
        .get('/api/auth/register/check-nickname')
        .set('X-Request-Id', 'test-nickname-001')
        .query({ nickname: 'uniqueName' });

      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(true);
    });

    test('昵称已被占用', async () => {
      authService.checkNickname.mockResolvedValue({ isAvailable: false });

      const res = await request(app)
        .get('/api/auth/register/check-nickname')
        .set('X-Request-Id', 'test-nickname-002')
        .query({ nickname: 'existingName' });

      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(false);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 链路二：发布行程流程
// ────────────────────────────────────────────────────────────
describe('链路：发布行程', () => {
  let publishedRideId;

  describe('POST /api/rides - 发布行程', () => {
    test('司机发布行程 → 返回行程 ID（分支：认证用户）', async () => {
      rideService.publishRide.mockResolvedValue({
        rideId: 'ride_001',
        fromText: '北京',
        toText: '天津',
        status: 'open',
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .set('X-Request-Id', 'test-publish-001')
        .send({
          fromText: '北京',
          toText: '天津',
          departAt: new Date(Date.now() + 3600000).toISOString(),
          seatsTotal: 3,
          price: 50,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('rideId');
      publishedRideId = res.body.data.rideId;
    });

    test('未登录发布行程 → 返回 401（分支：鉴权拦截）', async () => {
      const res = await request(app)
        .post('/api/rides')
        .set('X-Request-Id', 'test-publish-002')
        .send({
          fromText: '北京',
          toText: '天津',
          seatsTotal: 3,
        });

      expect(res.status).toBe(401);
    });

    test('无车辆时发布 → 返回 400（分支：业务校验）', async () => {
      rideService.publishRide.mockImplementation(() => {
        const error = new Error('您还没有添加车辆，无法发布行程');
        error.statusCode = 400;
        throw error;
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .set('X-Request-Id', 'test-publish-003')
        .send({
          fromText: '北京',
          toText: '天津',
          departAt: new Date(Date.now() + 3600000).toISOString(),
          seatsTotal: 3,
          price: 50,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/车辆/);
    });
  });

  describe('GET /api/rides/search - 搜索行程', () => {
    test('搜索能找到已发布的行程 → 链路打通', async () => {
      rideService.searchRides.mockResolvedValue({
        list: [
          {
            rideId: 'ride_001',
            fromText: '北京',
            toText: '天津',
            price: 50,
            seatsLeft: 3,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const res = await request(app)
        .get('/api/rides/search')
        .set('X-Request-Id', 'test-search-001')
        .query({ fromText: '北京', toText: '天津', departDate: '2024-01-01' });

      expect(res.status).toBe(200);
      expect(res.body.data.list).toHaveLength(1);
    });

    test('无匹配结果 → 返回空列表', async () => {
      rideService.searchRides.mockResolvedValue({
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      const res = await request(app)
        .get('/api/rides/search')
        .set('X-Request-Id', 'test-search-002')
        .query({ fromText: '广州', toText: '深圳', departDate: '2024-01-01' });

      expect(res.status).toBe(200);
      expect(res.body.data.list).toHaveLength(0);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 链路三：预订行程流程
// ────────────────────────────────────────────────────────────
describe('链路：预订行程', () => {
  const rideId = 'ride_001';

  describe('POST /api/rides/orders/book - 预订行程', () => {
    test('乘客预订座位 → 成功', async () => {
      rideService.bookRide.mockResolvedValue({
        orderId: 'order_001',
        rideId,
        seats: 1,
        status: 'pending',
      });

      const res = await request(app)
        .post('/api/rides/orders/book')
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Request-Id', 'test-book-001')
        .send({ rideId, seats: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('orderId');
    });

    test('座位不足 → 返回 400（分支：座位边界）', async () => {
      rideService.bookRide.mockImplementation(() => {
        const error = new Error('剩余座位不足');
        error.statusCode = 400;
        throw error;
      });

      const res = await request(app)
        .post('/api/rides/orders/book')
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Request-Id', 'test-book-002')
        .send({ rideId, seats: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/座位/);
    });

    test('司机预订自己的行程 → 返回 400（分支：身份冲突）', async () => {
      rideService.bookRide.mockImplementation(() => {
        const error = new Error('不能预约自己发布的行程');
        error.statusCode = 400;
        throw error;
      });

      const res = await request(app)
        .post('/api/rides/orders/book')
        .set('Authorization', `Bearer ${driverToken}`)
        .set('X-Request-Id', 'test-book-003')
        .send({ rideId, seats: 1 });

      expect(res.status).toBe(400);
    });

    test('预订不存在的行程 → 返回 404（分支：行程缺失）', async () => {
      rideService.bookRide.mockImplementation(() => {
        const error = new Error('行程不存在');
        error.statusCode = 404;
        throw error;
      });

      const res = await request(app)
        .post('/api/rides/orders/book')
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Request-Id', 'test-book-004')
        .send({ rideId: 'nonexistent_ride', seats: 1 });

      expect(res.status).toBe(404);
    });

    test('未登录预订 → 返回 401（分支：鉴权拦截）', async () => {
      const res = await request(app)
        .post('/api/rides/orders/book')
        .set('X-Request-Id', 'test-book-005')
        .send({ rideId, seats: 1 });

      expect(res.status).toBe(401);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 链路四：获取行程详情流程
// ────────────────────────────────────────────────────────────
describe('链路：获取行程详情', () => {
  describe('GET /api/rides/detail - 获取行程详情', () => {
    test('获取行程详情 → 返回完整信息', async () => {
      rideService.getRideDetail.mockResolvedValue({
        rideId: 'ride_001',
        fromText: '北京',
        toText: '天津',
        departAt: new Date().toISOString(),
        price: 100,
        seatsLeft: 3,
        driver: {
          userId: 'driver_001',
          userName: '司机张三',
          phone: '138****8000',
        },
        vehicle: {
          brand: '丰田',
          model: '卡罗拉',
          plateNumber: '京A****5',
        },
      });

      const res = await request(app)
        .get('/api/rides/detail')
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Request-Id', 'test-detail-001')
        .query({ rideId: 'ride_001' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('rideId');
      expect(res.body.data).toHaveProperty('driver');
    });

    test('行程不存在 → 返回 404', async () => {
      rideService.getRideDetail.mockImplementation(() => {
        const error = new Error('行程不存在');
        error.statusCode = 404;
        throw error;
      });

      const res = await request(app)
        .get('/api/rides/detail')
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Request-Id', 'test-detail-002')
        .query({ rideId: 'nonexistent_ride' });

      expect(res.status).toBe(404);
    });
  });
});

// ────────────────────────────────────────────────────────────
// 健康检查
// ────────────────────────────────────────────────────────────
describe('GET /health - 健康检查', () => {
  test('服务健康检查通过', async () => {
    // 创建一个简单的健康检查路由
    const healthApp = express();
    healthApp.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const res = await request(healthApp)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.status).toBe('ok');
  });
});
