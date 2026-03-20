# Carpooling 后端

基于 **Node.js + Express** 的拼车项目后端 API。支持两种用法：**开发环境跑在内网**（本机或局域网），**测试环境部署在公网服务器**；前端通过配置切换请求地址，二者都会用到。

### 接口约定

后端接口遵循 `CONTRIBUTING.md` 约定：

- **查询类接口**使用 **GET**
- **新增/修改/删除类接口**使用 **POST**

当接口为 POST 时，请求体使用 JSON，并确保 `Content-Type: application/json`。

说明：当前 `src/index.js` 作为占位实现，具体接口方法可能会随后续迭代逐步对齐该约定。

## 环境要求

- **Node.js** 18.x 或 20.x（LTS）

## 快速开始（本地 / 内网）

在 **backend** 目录下执行：

```bash
npm install
npm start    # 或 npm run dev
```

默认监听 `0.0.0.0:3000`，本机访问 `http://localhost:3000`。开发时前端用内网地址（如 `http://localhost:3000` 或 `http://你的本机IP:3000`）即可。

---

## 开发环境 vs 测试环境

| 环境 | 后端运行位置 | 前端 API 配置 |
|------|----------------|----------------|
| **开发环境** | 内网：本机或局域网一台机器跑 `npm start` | 前端 `.env` 中 `EXPO_PUBLIC_API_URL` 设为该内网地址（如 `http://192.168.1.100:3000`） |
| **测试环境** | 公网：后端部署到公网服务器（见下方「公网部署」） | 前端 `.env` 中 `EXPO_PUBLIC_API_URL` 设为公网 API 地址（如 `https://api-test.yourdomain.com`） |

同一套后端代码，开发时在内网跑、测试时在公网跑；前端通过 `EXPO_PUBLIC_API_URL` 切换，两种环境都要用。

---

## 打包 dist 与上传服务器流程

测试环境后端部署在**腾讯云服务器**，**由陈柯上传并部署**。推荐流程：本地打包生成 `dist/` → 陈柯将 dist 上传到腾讯云服务器 → 在服务器安装依赖并启动。详细步骤见 [docx/后端打包与上传服务器流程.md](../docx/后端打包与上传服务器流程.md)。

### 1. 本地打包

在 **backend** 目录执行：

```bash
npm run build
```

会在当前目录下生成 **dist/** 文件夹，内含：

- `src/`（源码）
- `package.json`
- `package-lock.json`（若有）

**不包含** `node_modules` 和 `.env`，需在服务器上安装依赖并单独配置环境变量。

### 2. 上传到腾讯云服务器（由陈柯操作）

在本地得到 **dist** 后，直接查看服务器上的目标部署目录（如 `/var/www/carpooling-api`），将本机 `backend/dist` 中的全部内容通过文件传输（拖拽或复制）上传到该目录即可。

上传后，服务器上的目录结构应类似：

```
/var/www/carpooling-api/
├── src/
│   └── index.js
├── package.json
└── package-lock.json
```

### 3. 在服务器上安装依赖并启动

登录服务器后，在部署目录执行：

```bash
cd /var/www/carpooling-api
npm install --production
```

（可选）配置环境变量：新建 `.env` 或导出 `PORT`、`HOST`、`NODE_ENV` 等。

启动方式任选其一：

- 直接运行：`npm start`
- 使用 PM2（推荐）：`pm2 start src/index.js --name carpooling-api`，便于守护进程与重启

### 4. 流程小结

| 步骤 | 位置 | 操作 |
|------|------|------|
| 1 | 本机 backend | `npm run build` 生成 dist/ |
| 2 | 本机 → 腾讯云服务器（由陈柯上传） | 在服务器上打开部署目录，将 dist 内容通过文件传输上传 |
| 3 | 服务器部署目录 | `npm install --production` |
| 4 | 服务器 | 配置 .env 或环境变量后 `npm start` 或 `pm2 start ...` |

---

## 公网部署（测试环境）

测试环境将后端部署到公网服务器，供 App / Web 通过 HTTPS 访问。部署时注意以下配置与建议。

### 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | 服务监听端口 | `3000` |
| `HOST` | 监听地址（服务器上建议 `0.0.0.0`） | `0.0.0.0` |
| `NODE_ENV` | `production` 时可用于收紧 CORS、日志等 | - |

在服务器上可通过系统环境变量或 `.env`（配合 `dotenv`）配置。

### 部署方式建议

1. **反向代理 + HTTPS**  
   使用 Nginx / Caddy 等反向代理到本进程（如 `http://127.0.0.1:3000`），由代理提供 HTTPS 和域名，例如：
   - `https://api.yourdomain.com` → `http://127.0.0.1:3000`

2. **进程管理**  
   使用 **PM2**、**systemd** 等保持进程常驻与崩溃重启：
   ```bash
   pm2 start src/index.js --name carpooling-api
   ```

3. **安全**  
   - 仅对外暴露 80/443，不直接暴露 3000 端口。  
   - 生产环境建议根据 `NODE_ENV` 或 `ALLOWED_ORIGINS` 限制 CORS 来源（当前为允许所有来源，便于接入）。

### 前端配置 API 地址

- **开发环境**：前端 `.env` 中 `EXPO_PUBLIC_API_URL` 设为内网地址（如 `http://localhost:3000` 或 `http://192.168.x.x:3000`）。
- **测试环境**：前端 `.env` 中 `EXPO_PUBLIC_API_URL` 设为公网 API 地址（如 `https://api-test.yourdomain.com`）。

详见前端 [README 的「开发环境与测试环境」小节](../frontend/README.md#开发环境与测试环境内网--公网)。

---

## 环境变量汇总（可选）

如需用 `.env` 文件，可在 backend 目录安装 `dotenv` 并在入口最顶部加载：

```bash
npm install dotenv
```

```js
require('dotenv').config();
```

---

## 目录结构

```
backend/
├── src/
│   ├── router/        # 路由层（仅限定路径与请求方法，不写业务逻辑）
│   ├── controller/    # 控制层（接收参数、校验、调用 service 并返回标准响应）
│   ├── service/       # 业务逻辑层（核心业务规则、异常处理）
│   ├── dao/            # 数据访问层（数据库增删改查）
│   ├── middleware/    # 中间件（鉴权、日志、错误捕获）
│   ├── utils/         # 工具层（参数校验、响应封装、脱敏等）
│   └── index.js       # 入口（当前阶段临时集中在此文件；后续建议拆分）
├── scripts/
│   └── build.js       # 打包脚本，npm run build 生成 dist/
├── dist/           # npm run build 生成，用于上传服务器（已加入 .gitignore）
├── package.json
└── README.md
```

说明：当前阶段仅为快速跑通流程，`src/index.js` 里集中了路由与接口占位实现；当接口数量增加时，建议按上面分层逐步拆分到对应目录（与 `CONTRIBUTING.md` 一致）。

## 开发说明

（待补充）
