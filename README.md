# Carpooling

拼车项目仓库（前端 Expo + 后端 Node.js），小组协作开发。

## 技术栈

| 端 | 框架 | 数据库 | 其他 |
|---|------|--------|------|
| 前端 | React Native + Expo Router | - | TypeScript, Tailwind CSS |
| 后端 | Node.js + Express | MySQL + Prisma | JWT, 阿里云 SMS |

## 目录结构

| 目录 | 说明 |
|------|------|
| **frontend/** | 移动端前端（React Native + Expo），见 [frontend/README.md](frontend/README.md) |
| **backend/** | 后端 API（Node.js + Express），部署到公网服务器供前端调用，见 [backend/README.md](backend/README.md) |
| **docs/** | 项目各类文档存放目录，索引见 [docs/README.md](docs/README.md) |

## 快速启动

### 前端
```bash
cd frontend
npm install
npx expo start
```

### 后端
```bash
cd backend
npm install
npx prisma generate  # 生成 Prisma Client
npm run dev          # 开发模式（热重载）
# 或
npm start            # 生产模式
```

## 已实现功能

### 认证模块
- 手机号 + 密码登录
- 短信验证码登录/注册
- 找回密码
- JWT Token 认证

### 首页模块
- 用户信息展示
- 推荐行程列表
- 系统统计展示
- 未读消息提醒

### 行程模块
- 行程搜索（支持筛选、排序）
- 发布行程
- 行程详情
- 预订行程
- 我的行程列表
- 行程评价

### 个人中心
- 用户资料编辑
- 车辆管理
- 常用地点
- 支付方式/记录
- 通知设置
- 帮助中心
- 邀请好友

### 管理员
- 管理员登录
- 用户管理

## Mock 模式

前端支持 Mock 模式，可在登录页面右上角切换：
- **Mock 模式**：使用本地模拟数据，无需后端服务
- **正式模式**：调用真实后端 API

## 数据库表结构

项目包含 31+ 张数据库表，完整设计见 [docs/backend/数据库设计文档.md](docs/backend/数据库设计文档.md)。

核心表：
- `auth_users` - 用户认证
- `user_profiles` - 用户档案
- `rides` - 行程
- `ride_orders` - 订单
- `vehicles` - 车辆
- `notifications` - 通知

## 部署

后端部署到服务器后，需执行数据库迁移：
```bash
npx prisma migrate deploy
```

详细部署流程见 [docs/backend/打包与上传服务器流程.md](docs/backend/打包与上传服务器流程.md)。

## 协作规范

推送前检查、分支与 PR 约定、新成员上手步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。
