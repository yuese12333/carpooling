# 高德地图 Android 2D SDK 接入说明

本文说明本仓库 **`frontend/android`** 中已接入的 **高德 2D 地图 SDK** 来源、配置方式与扩展方式。

---

## 1. SDK 来源与版本

- **纳入版本控制（远程仓库）的 SDK**：仅 **`frontend/android/app/libs/Amap_2DMap_V6.0.0_20191106.jar`**。协作方拉代码后**不依赖**任何本机独占目录即可编译。
- **`AMap_Android_SDK_All/`**（仓库根目录旁或本机任意路径）：为从官网下载的 **SDK 全量包解压目录**，**仅暂时放在本地作对照与拷贝来源**，**不提交 Git、不上传远程**；他人环境可能没有该文件夹，文档与构建脚本也**不得假设**其存在。
- 若你本机有该目录，可参考其中路径：`AMap2DMap/`（2D 地图 JAR）、`AMap2DMap_DemoDocs/.../AMap2DDemo/`（官方 2D Demo；其 `app/libs` 另含 **定位**、**搜索** 等独立 JAR，本阶段工程内仅接入 **2D 地图** 核心包）。
- 需要更新 JAR 或对照 Demo 时：到 [高德开放平台](https://lbs.amap.com/) 重新下载 SDK，在本地解压后拷贝至 **`frontend/android/app/libs/`**，并更新本文档中的文件名/版本说明（如有变更）。

---

## 2. Gradle 配置

- **`frontend/android/app/build.gradle`**
  - `dependencies` 中通过 `implementation fileTree(dir: "libs", include: ["*.jar"])` 引入 `app/libs` 下 JAR。
  - **API Key** 通过 **`manifestPlaceholders`** 注入清单中的 `com.amap.api.v2.apikey`，不在仓库中写死密钥。
  - 构建时会读取 **`frontend/.env`** 中的 **`EXPO_PUBLIC_AMAP_API_KEY`**，与前端 JS 使用同一变量（**`.env` 须已加入 `.gitignore`，勿提交**）。

---

## 3. API Key 配置（必做）

高德控制台申请的 Key 需与 **Android 包名**、**SHA1** 绑定；本应用包名为 **`com.anonymous.carpooling`**（见 `app.config.js` / `applicationId`）。

**推荐（与前端一致）**：在 **`frontend/.env`** 配置：

```env
EXPO_PUBLIC_AMAP_API_KEY=你的Key
```

Android 打包/编译时 Gradle 会解析该文件并注入原生清单。

**覆盖优先级**（从高到低，便于 CI 或本机临时覆盖）：

| 方式 | 说明 |
|------|------|
| **环境变量** | `AMAP_API_KEY=你的Key` |
| **`frontend/.env`** | `EXPO_PUBLIC_AMAP_API_KEY`（主路径） |
| **`local.properties`** | `frontend/android/local.properties` 中 `amap.api.key=你的Key`（可选兜底） |
| **Gradle 属性** | `AMAP_API_KEY`（勿在提交到 Git 的 `gradle.properties` 中写真实密钥） |

控制台需为同一 Key 勾选适配 **Android SDK** 的服务类型；JS 与原生共用 **`EXPO_PUBLIC_AMAP_API_KEY`** 时，保证控制台包名与签名与当前应用一致即可。

---

## 4. AndroidManifest 与权限

- 已在 **`frontend/android/app/src/main/AndroidManifest.xml`** 的 `<application>` 内声明：
  - `<meta-data android:name="com.amap.api.v2.apikey" android:value="${AMAP_API_KEY}"/>`
- 已增加地图/网络常用权限：`ACCESS_NETWORK_STATE`、`ACCESS_WIFI_STATE`、`CHANGE_WIFI_STATE`、`ACCESS_COARSE_LOCATION`、`ACCESS_FINE_LOCATION`（定位需在运行时向用户申请，可配合 `expo-location` 或原生逻辑）。

---

## 5. 混淆（Release）

- **`frontend/android/app/proguard-rules.pro`** 中已增加高德相关 `-keep`，避免 Release 开启混淆后地图异常。

---

## 6. 在界面中显示地图（后续开发）

当前步骤仅完成 **原生依赖与 Key 通道**；要在 App 内显示地图，还需其一：

- **原生**：编写 **MapView** 的 Activity/Fragment 或 **Fabric 视图**，再通过 **Turbo Module / 旧桥接** 暴露给 React Native；或  
- **社区方案**：评估维护中的 RN 高德封装（需注意与当前 Expo / New Architecture 的兼容性）。

### 6.1 仓库内自检示例（验证 JAR + Key + 原生注册）

- **路由**：`/map-test`（源码：`frontend/src/map-test.tsx`、`frontend/src/pages/map-test-page.tsx`）。  
- **RN 封装组件**：`frontend/components/amap-map-test-view.tsx`（与 `src/` 同级，避免被 Expo Router 扫描为路由）。  
- **原生视图名**：`AmapMapTest`（`AmapMapTestViewManager.kt`，内部使用 **`com.amap.api.maps2d.MapView`**；本仓库所引 2D JAR 的包名为 **`maps2d`**，与 3D 地图的 `com.amap.api.maps` 不同）。  
- **运行方式**：必须使用 **`npx expo run:android`** 安装到设备/模拟器；**Expo Go 不包含自定义原生模块**，无法显示地图。  
- **入口**：Android 下登录页底部提供「高德地图 SDK 测试页」链接；亦可深链打开 `/map-test`。  
- **配置**：确保 **`frontend/.env`** 中 **`EXPO_PUBLIC_AMAP_API_KEY`** 已填写且与高德控制台包名、签名一致。
  
若本机已解压官方全量包，可在其中的 2D Demo 工程里参考 `MapView` 初始化与生命周期（该目录非仓库必备，见第 1 节）。

---

## 7. 扩展：定位、搜索、路径规划

官方 2D Demo（见第 1 节，**仅本机 SDK 包内**）的 `app/libs` 中还包含例如：

- `AMap_Location_V*.jar` — 定位  
- `AMap_Search_V*.jar` — 搜索/算路等  

需要时将对应 JAR 放入 **`frontend/android/app/libs/`**（勿引入与 AndroidX 冲突的老 **`android-support-v4.jar`**），按官方文档补充 **Service**（如定位的 `APSService`）、权限与隐私合规说明，并重新编译验证。

---

## 8. 参考

- [高德开放平台 Android 地图 SDK 文档](https://lbs.amap.com/api/android-sdk/summary)
- **本地参考目录（不入库）**：`AMap_Android_SDK_All/` — 仅作者/本机暂存，**不推送远程**；团队以 **`frontend/android/app/libs/`** 与本文档为准。
