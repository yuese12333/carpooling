# Carpooling（前端）

基于 **React Native (Expo)** 的拼车应用项目。本目录为前端应用，以下命令均需在 **本目录（frontend）** 下执行。

## 环境配置

在开始开发前，请按以下步骤配置本地开发环境。本项目使用 **Expo**，无需单独安装 Android Studio、Xcode 或 JDK 即可用真机调试。

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

## 开发环境与测试环境（内网 / 公网）

前端需同时支持两种环境：

| 环境 | 后端位置 | 前端配置 |
|------|----------|----------|
| **开发环境** | 内网（本机或局域网），如 `http://localhost:3000` 或 `http://192.168.x.x:3000` | 在 `.env` 中设置 `EXPO_PUBLIC_API_URL` 为上述内网地址，或不设置（默认 `http://localhost:3000`） |
| **测试环境** | 公网服务器，如 `https://api-test.yourdomain.com` | 在 `.env` 中设置 `EXPO_PUBLIC_API_URL=https://api-test.yourdomain.com`，再启动或构建 |

操作步骤：

1. 在 frontend 目录复制 `.env.example` 为 `.env`：`cp .env.example .env`（Windows：`copy .env.example .env`）。
2. 开发时：`.env` 里使用内网地址（或删掉该行用默认本地）；运行 `npx expo start` 连内网后端。
3. 测公网时：修改 `.env` 中 `EXPO_PUBLIC_API_URL` 为测试公网地址，保存后重启 `npx expo start`（或重新构建）。

请求接口时使用 `config/api.ts` 中的 `API_BASE_URL` 作为根地址（由 `app.config.js` 根据 `EXPO_PUBLIC_API_URL` 注入）。

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

---

## 项目结构

```
carpooling/
├── pages/                  # 页面与路由（Expo Router 文件路由）
│   ├── _layout.tsx         # 根布局
│   ├── modal.tsx           # 模态页
│   └── (tabs)/             # 底部 Tab 分组
│       ├── _layout.tsx
│       ├── index.tsx       # 首页（Tab）
│       └── explore.tsx     # 探索页（Tab）
├── components/             # 可复用组件
│   ├── ui/                 # 基础 UI 组件
│   └── ...
├── config/                 # 配置与常量（主题、API 根地址等）
│   ├── api.ts              # API_BASE_URL（开发内网 / 测试公网）
│   └── theme.ts
├── hooks/                  # 自定义 Hooks
├── utils/                  # 工具类（建议统一放入）
├── router/                 # 路由配置（如需统一封装）
├── store/                  # 全局状态管理（如需引入）
├── assets/                 # 静态资源（图标、图片等）
├── scripts/                # 脚本（如 reset-project）
├── app.json                # Expo 配置
├── package.json
└── tsconfig.json
```

## 开发说明

（待补充）

## 许可证

（待补充）
