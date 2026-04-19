# Carpooling 后端

基于 **Node.js + Express** 的拼车项目 API：开发可在内网本机/局域网运行，测试可部署到公网；前端通过 `EXPO_PUBLIC_API_URL` 切换地址。

**约定**：查询用 **GET**，其余业务操作用 **POST**；POST 请求体为 JSON（`Content-Type: application/json`）。详细规范见项目根目录 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。

---

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [已实现接口](#已实现接口)
- [数据库](#数据库)
- [环境变量](#环境变量)
- [开发 / 测试环境切换](#开发--测试环境切换)
- [打包与部署](#打包与部署)
- [目录结构](#目录结构)
- [架构与规范索引](#架构与规范索引)

---

## 环境要求

| 依赖 | 说明 |
|------|------|
| **Node.js** | 18.x 或 20.x（LTS） |
| **MySQL** | 5.7+ 或 8.0+（用户等持久化数据） |

---

## 快速开始

在 **`backend/`** 目录执行：

```bash
npm install
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
```

1. 编辑 **`.env`**：至少配置 [环境变量](#环境变量) 中的阿里云 AK/SK 与 `DB_*`（并先在 MySQL 中 [创建数据库](#数据库)）。  
2. 启动：`npm start` 或 `npm run dev`（监听默认 `0.0.0.0:3000`）。  
3. 探活：`curl http://localhost:3000/health` — 成功时返回 `status: ok` 与 `db_connected: true`；数据库不可用时 HTTP 500，正文为固定文案「数据库暂不可用」（不返回数据库内部错误信息）。  
4. 建表（联调/首次）：`curl -X POST http://localhost:3000/api/users/init-schema`  
5. 短信联调说明见 [`docx/短信验证接口联调文档.md`](../docx/短信验证接口联调文档.md)。

---

## 已实现接口

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1 | POST | `/api/sms/send-verify-code` | 发送短信验证码 |
| 2 | POST | `/api/sms/check-verify-code` | 校验短信验证码 |
| 3 | POST | `/api/users/init-schema` | 初始化 `users` 表（`CREATE TABLE IF NOT EXISTS`） |
| 4 | POST | `/api/users/create` | 创建用户（联调/最小用户数据） |

### 用户接口补充

**`POST /api/users/init-schema`**  
无请求体。成功示例：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { "initialized": true },
  "requestId": "RN-xxx"
}
```

**`POST /api/users/create`**  

请求体：

```json
{
  "phone": "13812341234",
  "nickname": "张三"
}
```

校验：`phone` 为字符串、11 位数字且以 `1` 开头；`nickname` 为字符串、长度 1～50。  
HTTP **201** 创建成功，响应 `code` 仍为 200 包装体；手机号已存在时 **409**，`data.reason` 为 `PHONE_ALREADY_EXISTS`。

---

## 数据库

### 1. 创建库

```sql
CREATE DATABASE carpooling DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置连接

在 **`.env`** 中设置 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`、`DB_CONNECTION_LIMIT`（见 [.env.example](.env.example)）。

### 3. 初始化表结构

服务启动后调用 **`POST /api/users/init-schema`**（或用 Postman/Apifox）。生产环境建议由迁移脚本或受控运维执行，勿长期依赖公网任意访问该接口。

### `users` 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT UNSIGNED | 主键，自增 |
| phone | VARCHAR(20) | 手机号，唯一 |
| nickname | VARCHAR(50) | 昵称 |
| created_at / updated_at | TIMESTAMP | 创建 / 更新时间 |

---

## 环境变量

基于 **`.env.example`** 复制为 **`.env`**（已被 `.gitignore` 忽略，勿提交）。

**常用必填（按功能）**

| 变量 | 说明 |
|------|------|
| `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 阿里云短信相关能力 |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL |
| `PORT` / `HOST` | 服务监听，默认 `3000` / `0.0.0.0` |

**可选**

| 变量 | 说明 |
|------|------|
| `DB_CONNECTION_LIMIT` | 连接池上限，默认 `10` |
| `NODE_ENV` | 如 `production`；影响日志级别等 |
| `ALLOW_RETURN_VERIFY_CODE` | 仅 `NODE_ENV=production` 时读取；`true` 时在发送验证码成功响应中带回 `verifyCode`（**仅联调，生产勿开**） |

敏感配置可向内网负责人索取；完整字段表以 **`.env.example`** 为准。

---

## 开发 / 测试环境切换

| 环境 | 后端 | 前端 `EXPO_PUBLIC_API_URL` 示例 |
|------|------|----------------------------------|
| 开发 | 本机或局域网 `npm start` | `http://localhost:3000` 或 `http://192.168.x.x:3000` |
| 测试 | 公网服务器（HTTPS 域名） | `https://api-test.example.com` |

详见前端 [README「开发环境与测试环境」](../frontend/README.md#开发环境与测试环境内网--公网)。

---

## 打包与部署

测试环境部署在**腾讯云**时，推荐流程：本机 **`npm run build`** 生成 **`dist/`** → 上传至服务器目录 → 服务器 **`npm install --production`** → 配置环境变量 → **`npm start`** 或 PM2。详细步骤见 [`docx/后端打包与上传服务器流程.md`](../docx/后端打包与上传服务器流程.md)。

**dist 内容**：含 `src/`、`package.json`、`package-lock.json`；不含 `node_modules`、`.env`，需在目标机单独安装依赖并配置变量。

**公网建议**

- 仅对外暴露 **80/443**，反代到本进程（如 `http://127.0.0.1:3000`），由 Nginx/Caddy 提供 HTTPS。  
- 使用 PM2 或 systemd 守护进程。  
- 生产环境按需收紧 **CORS**（当前开发期多为 `origin: true`）。  
- 探活使用 **`GET /health`**。

---

## 目录结构

```
backend/
├── src/
│   ├── config/          # db.js 等
│   ├── router/          # sms-router.js, users-router.js
│   ├── controller/      # sms-controller.js, users-controller.js
│   ├── service/         # aliyun-sms-service.js, users-service.js
│   ├── dao/             # users-dao.js
│   ├── utils/           # response.js, logger.js
│   ├── middleware/      # 预留
│   ├── constants/       # 预留
│   └── index.js
├── scripts/build.js     # npm run build → dist/
├── .env.example
├── package.json
└── README.md
```

---

## 架构与规范索引

- **分层**：`router` → `controller`（参数与响应）→ `service`（业务）→ `dao`（SQL），避免跨层混写业务。  
- **响应**：统一 `code` / `message` / `data` / `requestId`（见 `utils/response.js`）。  
- **日志**：统一 `utils/logger.js`，敏感字段脱敏；异常需打日志并返回标准错误体。  
- **提交信息**：`<type>(<scope>): <subject>`，见 `CONTRIBUTING.md` §4.2。

更多命名、接口方法、日志级别、Git 与 PR 规则以 **[`CONTRIBUTING.md`](../CONTRIBUTING.md)** 为准。