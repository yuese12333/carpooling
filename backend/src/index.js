// 1) 环境变量 2) 其余模块（部分在加载时即读取 process.env）
require('./config/load-env');

const express = require('express');
const cors = require('cors');
const path = require('path');

const smsRouter = require('./router/sms-router');
const uploadRouter = require('./router/upload-router');
const authRouter = require('./router/auth-router');
const usersRouter = require('./router/users-router');
const adminRouter = require('./router/admin-router');
const homeRouter = require('./router/home-router');
const rideRouter = require('./router/ride-router');
const tripRouter = require('./router/trip-router');
const profileRouter = require('./router/profile-router');
const commonRouter = require('./router/common-router');
const notificationRouter = require('./router/notification-router');
const paymentsRouter = require('./router/payments-router');
const helpRouter = require('./router/help-router');
const prisma = require('./config/prisma');
const { logger } = require('./utils/logger');
const { createRequestId } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: true }));
app.use(express.json());

// 静态文件服务：将 uploads 目录暴露为可公网访问的资源
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查（包含数据库连通性）
app.get('/health', async (req, res) => {
  const requestId = createRequestId();

  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info({
      module: 'system-health',
      operate: 'health-check',
      requestId,
      result: 'Health check passed',
    });
    res.json({ status: 'ok', db_connected: true, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error({
      module: 'system-health',
      operate: 'health-check',
      requestId,
      error: error.message,
      errorType: 'DatabaseConnectionError',
    });
    res.status(500).json({
      status: 'error',
      db_connected: false,
      error: '数据库暂不可用',
    });
  }
});

// API 占位
app.post('/api', (req, res) => {
  res.json({ message: 'Carpooling API' });
});

app.use('/api/sms', smsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/home', homeRouter);
app.use('/api/rides', rideRouter);
app.use('/api/trips', tripRouter);
app.use('/api/profile', profileRouter);
app.use('/api/common', commonRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/help', helpRouter);

app.listen(Number(PORT), HOST, async () => {
  const requestId = `startup-${Date.now()}`;

  logger.info({
    module: 'server-bootstrap',
    operate: 'server-start',
    requestId,
    params: { host: HOST, port: Number(PORT) },
    result: 'Server started',
  });

  try {
    await prisma.$connect();
    logger.info({
      module: 'server-bootstrap',
      operate: 'database-connectivity-check',
      requestId,
      result: 'Prisma connected',
    });
  } catch (error) {
    logger.error({
      module: 'server-bootstrap',
      operate: 'database-connectivity-check',
      requestId,
      error: error.message,
      errorType: 'DatabaseConnectionError',
    });
    process.exit(1);
  }
});