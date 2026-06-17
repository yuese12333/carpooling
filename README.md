# Carpooling

拼车项目仓库（前端 Expo + 后端 Node.js），小组协作开发。

## 技术栈

| 端 | 框架 | 数据库 | 其他 |
|---|------|--------|------|
| 前端 | React Native 0.81 + Expo 54 + Expo Router | - | TypeScript, NativeWind |
| 后端 | Node.js 18+ + Express 4 | MySQL 8 + Prisma 6 | JWT, Redis, 阿里云 SMS |

## 目录结构

| 目录 | 说明 |
|------|------|
| **frontend/** | 移动端前端，见 [frontend/README.md](frontend/README.md) |
| **backend/** | 后端 API，见 [backend/README.md](backend/README.md) |
| **docs/** | 项目文档索引，见 [docs/README.md](docs/README.md) |
| **CONTRIBUTING.md** | 协作编码规范（命名、日志、Git 等） |

## 快速启动

### 前端

```bash
cd frontend
copy .env.example .env    # Windows；macOS/Linux 用 cp
npm install
npx expo start
```

### 后端

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:deploy   # 首次需配置 DATABASE_URL 并创建库
npm run dev                     # 开发模式（热重载）
```

探活：`GET http://localhost:3000/health`

## 已实现功能

核心业务前后端均已实现并完成联调（关闭 Mock 后走真实 API）。完整接口清单见 [docs/api/接口汇总清单.md](docs/api/接口汇总清单.md)。

| 模块 | 主要能力 |
|------|----------|
| **认证** | 密码登录、注册、找回密码、Token 刷新 |
| **首页** | 用户信息、推荐行程、统计、未读消息 |
| **行程** | 搜索、发布、详情、预订 |
| **我的行程** | 列表、取消、评价、联系人、取消原因 |
| **个人中心** | 资料、车辆、常用地点、通知设置、登出 |
| **支付** | 余额、记录、支付方式、月度统计 |
| **通知 / 帮助** | 通知列表与清除、帮助分类与问答 |
| **评价 / 邀请 / 紧急联系人** | 行程评价、邀请码、紧急联系人管理 |
| **管理后台** | 用户列表、状态与角色管理 |
| **公共** | 协议、配置、地点建议、客户端日志上报 |
| **文件上传** | 头像/证件等图片上传 |

前端仍保留 **Mock 模式**（登录页右上角开关），可在无后端时独立演示 UI。

## 测试

| 端 | 命令 | 说明 |
|----|------|------|
| 前端 | `cd frontend && npm run test:ci` | Jest + Testing Library，含快照 |
| 后端 | `cd backend && npm test` | Jest + Supertest，含集成测试 |

最新测试结果与覆盖率见 [docs/tests/TEST_REPORT.md](docs/tests/TEST_REPORT.md)；测试规范见 [docs/tests/全量测试文档.md](docs/tests/全量测试文档.md)。

## 数据库

共 **39** 张表，由 Prisma 管理。完整设计见 [docs/backend/数据库设计文档.md](docs/backend/数据库设计文档.md)。

核心表：`auth_users`、`user_profiles`、`rides`、`ride_orders`、`vehicles`、`notifications` 等。

本地填充演示数据：`cd backend && npm run prisma:seed`

## 部署

```bash
cd backend
npm run build          # 生成 dist/
# 上传 dist/ 至服务器后：npm install --production && npm start
npx prisma migrate deploy
```

详细流程见 [docs/backend/打包与上传服务器流程.md](docs/backend/打包与上传服务器流程.md)。

## 文档导航

| 类型 | 入口 |
|------|------|
| 文档总索引 | [docs/README.md](docs/README.md) |
| 接口联调 | [docs/api/接口汇总清单.md](docs/api/接口汇总清单.md) |
| 架构设计 | [docs/design/系统架构设计.md](docs/design/系统架构设计.md) |
| 需求与计划 | [docs/project/](docs/project/) |
| 协作规范 | [CONTRIBUTING.md](CONTRIBUTING.md) |
