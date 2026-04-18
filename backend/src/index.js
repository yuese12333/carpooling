const express = require('express');
const cors = require('cors');
const path = require('path');

// 加载 backend/.env（用于 AK/SK 等敏感配置）
require('dotenv').config();

const smsRouter = require('./router/sms-router');
const uploadRouter = require('./router/upload-router');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: true })); // 公网接入时允许前端跨域，生产环境建议用 NODE_ENV 或 ALLOWED_ORIGINS 限制
app.use(express.json());

// 静态文件服务：将 uploads 目录暴露为可公网访问的资源
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.post('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 占位
app.post('/api', (req, res) => {
  res.json({ message: 'Carpooling API' });
});

app.use('/api/sms', smsRouter);
app.use('/api/upload', uploadRouter);

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
