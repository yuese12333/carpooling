# 日志使用说明（前后端统一）

目标：前后端日志字段一致、级别一致、`requestId` 可串联。  
实现：**前端使用 TypeScript logger**，**后端使用 JavaScript logger**。

---

## 1) 文件位置与语言

### 前端（TypeScript）

```
frontend/
└── src/
    └── utils/
        └── logger.ts
```

### 后端（JavaScript）

```
backend/
└── src/
    └── utils/
        └── logger.js
```

---

## 2) 统一日志格式

```text
[级别] [时间] [requestId:xxx] [module:xxx] [device:xxx]
[operate:xxx] [params:xxx] [result:xxx]          ← INFO/WARN
[error:xxx] [errorType:xxx]                      ← ERROR/FATAL
```

统一要求：
- 字段名一致：`module`、`operate`、`params`、`result`、`error`、`errorType`、`requestId`
- 级别一致：`debug / info / warn / error / fatal`
- `requestId` 一次请求只生成一次，贯穿前后端

---

## 3) 前端（TS）使用方式

### 引入

```typescript
import logger, { maskSensitive, generateRequestId } from '../utils/logger';
```

### 辅助工具

```typescript
const rid = generateRequestId();

const safeParams = maskSensitive({
  phone: '13812341234',   // -> 138****1234
  password: '123456',     // -> ******
});
```

### 记录日志

```typescript
logger.info({
  module: 'user-login',
  operate: '用户登录',
  params: maskSensitive({ phone: '13812341234' }),
  result: '登录成功',
  requestId: rid,
});

logger.error({
  module: 'user-login',
  operate: '用户登录',
  params: maskSensitive({ phone: '13812341234' }),
  error: '验证码错误',
  errorType: '业务参数异常',
  requestId: rid,
});
```

---

## 4) 后端（JS）使用方式

### 引入

```javascript
const logger = require('../utils/logger');
```

### 在接口中透传 requestId

```javascript
app.post('/api/login', async (req, res) => {
  const requestId = req.headers['x-request-id'] || `BE-${Date.now()}`;

  logger.info({
    module: 'user-login',
    operate: '接收登录请求',
    params: { phone: req.body.phone },
    result: '参数校验通过',
    requestId,
  });

  try {
    // ...业务逻辑
    logger.info({
      module: 'user-login',
      operate: '用户登录',
      result: '登录成功',
      requestId,
    });
    res.json({ ok: true, requestId });
  } catch (error) {
    logger.error({
      module: 'user-login',
      operate: '用户登录',
      error: error?.message || String(error),
      errorType: '服务异常',
      requestId,
    });
    res.status(500).json({ ok: false, requestId });
  }
});
```

---

## 5) 前后端联调建议

- 前端发请求时带上 `x-request-id`
- 后端优先使用该 `requestId`，未传才自生成
- 排查问题时先按 `requestId` 聚合，再看时间线

---

## 6) 注意事项

**必须记日志：**
- 网络请求发起与返回
- 登录/注册/下单/支付等关键路径
- 所有 `catch`（至少 `error`）

**不建议记日志：**
- 每次组件渲染
- 输入框每次字符变化
- 与排障无关的噪音信息

---

## 7) 快速参考

```text
logger.debug({ module, operate, params })
logger.info({ module, operate, params, result, requestId })
logger.warn({ module, operate, params, result, requestId })
logger.error({ module, operate, params, error, errorType, requestId })
logger.fatal({ module, operate, error, errorType, requestId })

maskSensitive({ phone, password, token })
generateRequestId()
```

