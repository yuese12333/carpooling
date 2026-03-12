const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: true })); // 公网接入时允许前端跨域，生产环境建议用 NODE_ENV 或 ALLOWED_ORIGINS 限制
app.use(express.json());

// 所有接口仅接受 POST
// 健康检查
app.post('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 占位
app.post('/api', (req, res) => {
  res.json({ message: 'Carpooling API' });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
