# Carpooling（前端）

基于 **React Native (Expo)** 的拼车应用项目。本目录为前端应用，以下命令均需在 **本目录（frontend）** 下执行。

## 环境配置

在开始开发前，请按以下步骤配置本地开发环境。本项目使用 **Expo**，无需单独安装 Android Studio、Xcode 或 JDK 即可用真机调试。

> **首次克隆后**：在 `frontend/` 目录下执行 `copy .env.example .env`（Windows）或 `cp .env.example .env`（macOS/Linux），然后按需编辑 `.env`。

### 前置要求

- **操作系统**：Windows 10/11、macOS 或 Linux
- **网络**：可访问 npm 源（建议配置国内镜像以加速安装）

### 1. Node.js

- 安装 **Node.js 18.x 或 20.x**（推荐 LTS 版本）
- 建议使用 [nvm](https://github.com/nvm-sh/nvm)（macOS/Linux）或 [nvm-windows](https://github.com/coreybutler/nvm-windows)（Windows）管理多版本 Node

```bash
# 验证安装
node -v   # 应显示 v18.x 或 v20.x
npm -v
```

### 2. 包管理器（二选一）

- **npm**：随 Node.js 安装
- **Yarn** 或 **pnpm**（可选）：

```bash
# Yarn
npm install -g yarn

# pnpm
npm install -g pnpm
```

### 3. Expo Go（真机调试）

- 在手机上安装 **Expo Go**，用于扫码运行开发中的应用：
  - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
- 开发时电脑与手机需在同一局域网，或使用隧道模式（见下方「快速开始」）。

### 4. 推荐工具（可选）

- **Watchman**（监听文件变化）：  
  - Windows: [Watchman 安装说明](https://facebook.github.io/watchman/docs/install)  
  - macOS: `brew install watchman`
- **Git**：版本管理

### 5. 国内用户可选配置

若安装依赖较慢，可配置 npm 镜像：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或仅对当前项目使用 .npmrc
echo "registry=https://registry.npmmirror.com" > .npmrc
```

---

## 环境变量（`.env`）

| 变量 | 说明 | 示例 |
|------|------|------|
| `EXPO_PUBLIC_API_URL` | 后端 API 根地址（不含 `/api` 后缀，不以 `/` 结尾） | `http://localhost:3000` |
| `EXPO_PUBLIC_AMAP_API_KEY` | 高德地图 Android SDK Key | `8f73ea04...` |
| `EXPO_PUBLIC_AMAP_KEY_NAME` | 高德控制台 Key 名称 | `carpooling` |

所有 API 请求通过 `src/utils/request.ts` 统一发出，`baseURL` 自动拼接为 `${EXPO_PUBLIC_API_URL}/api`。**不要**在各 API 文件中自行创建 axios 实例或硬编码 URL。

切换开发内网与公网测试时，只需修改 `.env` 中的 `EXPO_PUBLIC_API_URL` 并重启 Expo 即可。

---

## 开发环境与测试环境（内网 / 公网）

前端通过 `.env` 中的 `EXPO_PUBLIC_API_URL` 切换后端地址：

| 场景 | `.env` 配置 |
|------|------------|
| **本地开发**（后端本机运行） | `EXPO_PUBLIC_API_URL=http://localhost:3000` |
| **局域网联调**（手机真机） | `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000` |
| **公网测试服务器** | `EXPO_PUBLIC_API_URL=http://1.15.45.125` |

修改 `.env` 后需重启 `npx expo start` 使环境变量生效。

---

## 快速开始

在 **frontend** 目录下执行：

```bash
# 安装依赖
npm install

# 启动开发服务器（Expo）
npx expo start
```

启动后：

- 用 **Expo Go** 扫描终端或浏览器中的二维码即可在真机预览
- 若同一 WiFi 下扫码失败，在终端按 `s` 切换为 **tunnel** 模式后再扫
- 按 `a` 在 Android 模拟器运行、按 `i` 在 iOS 模拟器运行（需本机已安装对应模拟器）
- 运行 Web：`npm run web`

### 高德地图 Android 自检（自定义原生模块）

- 路由 **`/map-test`**：验证高德 2D JAR、清单 Key、**定位**（`AmapLocation`）、**POI 搜索**（`AmapSearch`）与原生地图视图是否生效（源码见 `src/map-test.tsx`、`src/pages/map-test-page.tsx`）。
- **必须使用** `npx expo run:android` 安装到模拟器/真机；**Expo Go 不包含本项目的原生地图视图**，打开该页会提示未找到原生模块。
- 在 **`frontend/.env`** 配置 **`EXPO_PUBLIC_AMAP_API_KEY`**（构建时由 Gradle 读入；完整接入见 **`docs/高德地图Android_SDK接入与开发说明.md`**）。
- 搜索 SDK（`AMap_Search_*.jar`）与 **Volley**（`Volley.jar`）与 2D 地图官方 Demo 一致，放在 `android/app/libs/`，由 `fileTree` 引入。
- Android **登录页底部**提供「高德地图 SDK 测试页」入口。
- **业务开发与三 SDK 接入**：见仓库 **`docs/高德地图Android_SDK接入与开发说明.md`**。

---

## 项目结构

```
frontend/
├── components/             # 全局公共组件（与 src/ 同级，避免被 Expo Router 扫描为路由）
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── config/                 # 环境配置（与 src/ 同级）
│   └── api.ts              # 保留兼容，实际 baseURL 由 src/utils/request.ts 读取环境变量
├── src/                    # Expo Router 路由根目录
│   ├── pages/              # 业务页面（按模块拆分）
│   │   ├── index.tsx       # 应用入口，重定向至登录页并初始化链路追踪
│   │   ├── _layout.tsx     # 根布局（AuthProvider、Stack 路由、PortalHost）
│   │   ├── auth/           # 认证模块（login / register / forget-password）
│   │   ├── home/           # 首页
│   │   ├── find-ride/      # 找拼车
│   │   ├── offer-ride/     # 发布行程
│   │   └── trips/          # 我的行程
│   ├── hooks/              # 自定义 Hook（各页面业务逻辑）
│   ├── api/                # API 接口封装（各模块对应一个文件）
│   ├── store/              # 全局状态（Zustand env-store、AuthContext）
│   ├── router/             # 路由常量（paths.ts）
│   └── utils/              # 工具类（logger、request、validator 等）
├── assets/                 # 静态资源（图标、图片）
├── .env                    # 本地环境变量（不提交 Git）
├── .env.example            # 环境变量模板
├── app.json                # Expo 配置
├── package.json
└── tsconfig.json
```

## 开发说明

（待补充）

## 许可证

（待补充）
