const express = require('express');
const cors = require('cors');

// 加载 backend/.env（用于 AK/SK 等敏感配置）
require('dotenv').config();

const smsRouter = require('./router/sms-router');
const usersRouter = require('./router/users-router');
const pool = require('./config/db');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: true }));
app.use(express.json());

// 健康检查（包含数据库连通性）
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db_connected: true, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error({
      module: 'system-health',
      operate: 'health-check',
      error: error.message,
      errorType: 'DatabaseConnectionError',
    });
    res.status(500).json({ status: 'error', db_connected: false, error: error.message });
  }
});

// API 占位
app.post('/api', (req, res) => {
  res.json({ message: 'Carpooling API' });
});

app.use('/api/sms', smsRouter);
app.use('/api/users', usersRouter);

app.listen(Number(PORT), HOST, async () => {
  logger.info({
    module: 'server-bootstrap',
    operate: 'server-start',
    params: { host: HOST, port: Number(PORT) },
    result: 'Server started',
  });

  try {
    const connection = await pool.getConnection();
    connection.release();
    logger.info({
      module: 'server-bootstrap',
      operate: 'database-connectivity-check',
      result: 'MySQL connection established',
    });
  } catch (error) {
    logger.error({
      module: 'server-bootstrap',
      operate: 'database-connectivity-check',
      error: error.message,
      errorType: 'DatabaseConnectionError',
    });
  }
});