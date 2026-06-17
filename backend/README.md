# Carpooling 后端

基于 **Node.js + Express** 的拼车项目 API：开发可在内网本机/局域网运行，测试可部署到公网；前端通过 `EXPO_PUBLIC_API_URL` 切换地址。

**约定**：查询用 **GET**，其余业务操作用 **POST**；POST 请求体为 JSON（`Content-Type: application/json`）。详细规范见项目根目录 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。

---

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [已实现模块](#已实现模块)
- [数据库](#数据库)
- [环境变量](#环境变量)
- [开发 / 测试环境切换](#开发--测试环境切换)
- [打包与部署](#打包与部署)
- [目录结构](#目录结构)
- [测试](#测试)
- [架构与规范索引](#架构与规范索引)

---

## 环境要求

| 依赖 | 说明 |
|------|------|
| **Node.js** | 18.x 或 20.x（LTS） |
| **MySQL** | 5.7+ 或 8.0+ |
| **Redis** | 可选，短信验证码与风控缓存（未配置时部分能力降级） |

---

## 快速开始

在 **`backend/`** 目录执行：

```bash
npm install
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
```

1. 编辑 **`.env`**：至少配置 `DATABASE_URL`、`JWT_SECRET`、`JWT_REFRESH_SECRET`；短信联调需阿里云 AK/SK（见 [.env.example](.env.example)）。
2. 创建数据库并执行迁移：

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed          # 可选：填充演示数据
```

3. 启动：`npm run dev`（热重载）或 `npm start`（默认 `0.0.0.0:3000`）。
4. 探活：`curl http://localhost:3000/health` — 成功返回 `status: ok` 与 `db_connected: true`。

首次接入已有库请按 baseline 流程操作，见 [`docs/backend/Prisma开发规范.md`](../docs/backend/Prisma开发规范.md)。

---

## 已实现模块

所有业务 JSON 接口统一响应：`{ code, message, data, requestId }`（见 `src/utils/response.js`）。  
**完整路径、参数与联调状态**以 [`docs/api/接口汇总清单.md`](../docs/api/接口汇总清单.md) 为准（主参考，随代码更新）。

| 路由前缀 | 模块 | 说明 |
|----------|------|------|
| `/api/auth` | 认证 | 登录、注册、找回密码、Token 刷新、风控扩展 |
| `/api/sms` | 短信 | 注册场景发码/验码（阿里云） |
| `/api/users` | 用户 | 当前用户、实名状态、邀请与行程分享 |
| `/api/home` | 首页 | 用户信息、推荐行程、统计、未读状态 |
| `/api/rides` | 找车/发布 | 搜索、发布、详情、预订、路线规划 |
| `/api/trips` | 我的行程 | 列表、详情、取消、评价、联系人 |
| `/api/profile` | 个人中心 | 资料、车辆、地点、通知设置、登出 |
| `/api/payments` | 支付 | 余额、记录、支付方式、收据 |
| `/api/notifications` | 通知 | 列表、清除 |
| `/api/help` | 帮助中心 | 分类、问答 |
| `/api/ratings` | 评价 | 标签、统计、提交评价 |
| `/api/invite` | 邀请 | 邀请码、使用记录、统计 |
| `/api/emergency-contacts` | 紧急联系人 | CRUD、行程分享 |
| `/api/common` | 公共 | 协议、配置、地点建议、客户端日志 |
| `/api/upload` | 上传 | 单文件上传（multipart） |
| `/api/admin` | 管理后台 | 用户列表、状态与角色（需管理员 JWT） |

系统接口：`GET /health`（含 DB 连通性）、`GET /uploads/{filename}`（静态文件）。

### 认证与注册要点

- **注册**：`GET check-nickname` → `POST /api/sms/send` → `POST /api/sms/verify`（获 `tempToken`）→ `POST /api/auth/register`。
- **登录**：`GET /api/auth/login/config` → `POST /api/auth/login/password`。
- **找回密码**：`POST check-phone` → `POST password/sms` → `POST password/verify-code` → `POST password/reset`。
- 注册与登录共用 `auth_users` 表；密码 8～20 位且须同时包含字母与数字。

### 联调文档索引

| 文档 | 覆盖范围 |
|------|----------|
| [`docs/api/登录接口联调文档.md`](../docs/api/登录接口联调文档.md) | 登录配置、密码登录 |
| [`docs/api/用户注册接口联调文档.md`](../docs/api/用户注册接口联调文档.md) | 注册全流程 |
| [`docs/api/短信验证接口联调文档.md`](../docs/api/短信验证接口联调文档.md) | `/api/sms/*` |
| [`docs/api/文件上传接口联调文档.md`](../docs/api/文件上传接口联调文档.md) | `POST /api/upload` |
| [`docs/system/管理员系统设计文档.md`](../docs/system/管理员系统设计文档.md) | `/api/admin/*` |

### 运维接口

**`POST /api/users/init-schema`** — Prisma 迁移后 DB 连通检查（仅内网或 `x-schema-init-token`）。

**`POST /api/users/create`** — 已废弃（410），请用 `POST /api/auth/register`。

---

## 数据库

### 1. 创建库

```sql
CREATE DATABASE carpooling DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 迁移与种子

```bash
npm run prisma:migrate:dev -- --name <migration-name>   # 开发新迁移
npm run prisma:migrate:deploy                           # 生产/测试部署
npm run prisma:migrate:status
npm run prisma:seed                                     # 演示数据
```

共 **39** 张表，定义见 `prisma/schema.prisma` 与 [`docs/backend/数据库设计文档.md`](../docs/backend/数据库设计文档.md)。

### `auth_users` 核心字段

| 字段 | 说明 |
|------|------|
| user_id | 主键 |
| phone | 手机号，唯一 |
| password_hash | 密码哈希 |
| user_name / avatar_url | 展示信息 |
| role | `user` / `admin` |
| status | `active` / `disabled` |

---

## 环境变量

基于 **`.env.example`** 复制为 **`.env`**（勿提交仓库）。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Prisma MySQL 连接串 |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 鉴权签名（启动必填） |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` / `SECRET` | 阿里云短信 |
| `PORT` / `HOST` | 默认 `3000` / `0.0.0.0` |
| `REDIS_URL` | Redis（可选） |
| `SCHEMA_INIT_TOKEN` | 运维 `init-schema` 凭证 |
| `ALLOW_RETURN_VERIFY_CODE` | 生产联调时是否在响应中返回验证码（**勿用于正式环境**） |

完整列表以 **`.env.example`** 为准。

---

## 开发 / 测试环境切换

| 环境 | 后端 | 前端 `EXPO_PUBLIC_API_URL` 示例 |
|------|------|----------------------------------|
| 开发 | 本机 `npm run dev` | `http://localhost:3000` 或局域网 IP |
| 测试 | 公网服务器 | 测试域名或 IP（HTTPS 推荐） |

详见前端 [README「开发环境与测试环境」](../frontend/README.md#开发环境与测试环境内网--公网)。

---

## 打包与部署

测试环境推荐：`npm run build` → 上传 **`dist/`** → 服务器 `npm install --production` → 配置 `.env` → `npm start` 或 PM2。

详细步骤见 [`docs/backend/打包与上传服务器流程.md`](../docs/backend/打包与上传服务器流程.md)。

**公网建议**：Nginx/Caddy 反代 443 → 本进程；PM2/systemd 守护；探活用 `GET /health`。

---

## 目录结构

```
backend/
├── prisma/
│   ├── schema.prisma       # 数据库结构（唯一真相）
│   ├── migrations/         # 迁移文件（需提交 Git）
│   └── seed.js             # 种子数据
├── src/
│   ├── config/             # prisma.js, load-env.js
│   ├── router/             # 16 个业务路由模块
│   ├── controller/
│   ├── service/
│   ├── dao/
│   ├── utils/              # response, logger, jwt, redis 等
│   ├── middleware/         # auth, admin-auth, optional-auth, schema-init-guard
│   ├── constants/
│   └── index.js
├── __tests__/              # Jest 单元与集成测试
├── scripts/build.js        # npm run build → dist/
├── .env.example
├── package.json
└── README.md
```

---

## 测试

```bash
npm test                 # Jest + 覆盖率
npm run test:watch       # 监听模式
```

覆盖认证、行程发布/预订/搜索、行程取消/评价等业务链路。报告见 [`docs/tests/TEST_REPORT.md`](../docs/tests/TEST_REPORT.md)。

---

## 架构与规范索引

- **分层**：`router` → `controller` → `service` → `dao`，禁止跨层调用。  
- **响应**：统一 `code` / `message` / `data` / `requestId`。  
- **日志**：`utils/logger.js`，敏感字段脱敏。  
- **提交**：`<type>(<scope>): <subject>`，见 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。
