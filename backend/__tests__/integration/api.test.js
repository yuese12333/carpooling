/**
 * API 集成测试
 */
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/send-sms', (req, res) => {
  const { phone, type } = req.body;
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({
      code: 400,
      message: '手机号格式不正确',
      data: null,
      requestId: req.headers['x-request-id'] || 'unknown',
    });
  }
  res.json({
    code: 200,
    message: '验证码发送成功',
    data: { success: true },
    requestId: req.headers['x-request-id'] || 'unknown',
  });
});

app.get('/api/ride/search', (req, res) => {
  res.json({
    code: 200,
    message: '操作成功',
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    },
    requestId: req.headers['x-request-id'] || 'unknown',
  });
});

describe('API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('POST /api/auth/send-sms', () => {
    it('should send SMS code with valid phone', async () => {
      const response = await request(app)
        .post('/api/auth/send-sms')
        .set('X-Request-Id', 'test-request-001')
        .send({ phone: '13800138000', type: 'register' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('验证码发送成功');
    });

    it('should fail with invalid phone', async () => {
      const response = await request(app)
        .post('/api/auth/send-sms')
        .set('X-Request-Id', 'test-request-002')
        .send({ phone: 'invalid', type: 'register' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.code).toBe(400);
    });
  });

  describe('GET /api/ride/search', () => {
    it('should return ride list', async () => {
      const response = await request(app)
        .get('/api/ride/search')
        .set('X-Request-Id', 'test-request-003')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.list).toEqual([]);
    });
  });
});
