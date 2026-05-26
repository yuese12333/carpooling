# 高德地图 Android SDK 接入与开发说明

本文是**唯一**的地图相关说明：整合 **2D 地图**、**定位**、**搜索** 三套 SDK 的**原生接入**，以及 **React Native（Expo）业务侧**用法。与仓库内 `AMap_Android_SDK_All` 中 **2D Map Demo** 的 `app/libs` 组合一致；**不使用** 3D 一体化 JAR。

---

## 目录

1. [概述与版本](#1-概述与版本)  
2. [一、2D 地图 SDK](#2-一2d-地图-sdk)  
3. [二、定位 SDK](#3-二定位-sdk)  
4. [三、搜索 SDK](#4-三搜索-sdk)  
5. [Gradle、清单与 Key](#5-gradle清单与-key)  
6. [隐私合规 Application](#6-隐私合规-application)  
7. [ProGuard](#7-proguard)  
8. [高德控制台与 SHA1](#8-高德控制台与-sha1)  
9. [RN 业务开发（地图 / 定位 / POI）](#9-rn-业务开发地图--定位--poi)
10. [文件索引与排错](#10-文件索引与排错)

---

## 1. 概述与版本

| SDK | JAR 文件名（当前工程） | 用途 |
|-----|------------------------|------|
| **2D 地图** | `Amap_2DMap_V6.0.0_20191106.jar` | `com.amap.api.maps2d.MapView` 等 |
| **定位** | `AMap_Location_V6.5.1_20251020.jar` | `AMapLocationClient`、逆地理 |
| **搜索** | `AMap_Search_V9.4.0_20220808.jar` | `PoiSearch` 等（POI） |
| **依赖** | `Volley.jar` | 与官方 2D Demo 一致，供搜索使用 |

- **放置路径**：`frontend/android/app/libs/`（与 `build.gradle` 中 `fileTree(dir: "libs", include: ["*.jar"])` 对应）。  
- **本地参考包**：`AMap_Android_SDK_All/AMap2DMap_DemoDocs/AMap_Android_API_2DMap_Demo/AMap2DDemo/app/libs/`（仅本机参考，**不提交**整个 `AMap_Android_SDK_All`）。  
- **勿混用**：`AMap3DMap_*_AMapSearch_*_AMapLocation_*.jar`（3D 一体化）与当前 **2D** 方案**不要**混用。

---

## 2. 一、2D 地图 SDK

### 2.1 接入要点

- 包名：`com.amap.api.maps2d.*`（注意是 **`maps2d`**，不是 `maps`）。  
- **Key**：与其它 SDK 共用清单 `meta-data` `com.amap.api.v2.apikey`（见 [§5](#5-gradle清单与-key)）。  
- **RN 侧**：`AmapMapTestViewManager` 封装 `MapView`，注册名 **`AmapMapTest`**；JS 见 `frontend/components/amap-map-test-view.tsx`。

### 2.2 生命周期

- `MapView` 需在 `onCreate` / `onResume` / `onPause` / `onDestroy` 中按官方调用；当前在 `AmapMapTestViewManager` 内通过 `LifecycleEventListener` 与 Activity 同步。

### 2.3 旧版 JAR 说明

- 当前 2D JAR 的 `MapsInitializer` **无** `updatePrivacyShow` 等接口；地图鉴权依赖 **manifest 中的 Key**。

---

## 3. 二、定位 SDK

### 3.1 接入要点

- **清单**：声明 `com.amap.api.location.APSService`，建议 `android:exported="false"`。  
- **权限**：`ACCESS_COARSE_LOCATION`、`ACCESS_FINE_LOCATION` 等（见 [§5](#5-gradle清单与-key)）；运行时仍需 JS 侧 `PermissionsAndroid` 申请。  
- **隐私**：在首次使用 `AMapLocationClient` 前调用 `AMapLocationClient.updatePrivacyShow` / `updatePrivacyAgree`（见 [§6](#6-隐私合规-application)）。  
- **RN 模块**：`AmapLocationModule`，模块名 **`AmapLocation`**，方法 **`getCurrentLocation()`**；`setNeedAddress(true)` 以返回省市区用于 POI 同城搜索。

---

## 4. 三、搜索 SDK

### 4.1 接入要点

- 与 **Volley** 同目录引入；`implementation fileTree(...*.jar)` 即可。  
- **隐私**：首次使用前调用 `ServiceSettings.updatePrivacyShow` / `updatePrivacyAgree`（见 [§6](#6-隐私合规-application)）。  
- **RN 模块**：`AmapSearchModule`，模块名 **`AmapSearch`**，方法 **`poiKeywordSearch(keyword, city, pageNum, pageSize)`**。  
  - `city` 非空：`setCityLimit(true)`，同城检索。  
  - `city` 为空：全国检索。  
- **控制台**：除「Android SDK」外，**Web 服务 / 搜索** 等能力需在控制台开通；**SHA1** 必须与签名一致，否则常见 **`rCode=1008`**（见 [§8](#8-高德控制台与-sha1)）。

### 4.2 与官方 Demo 差异

- `PoiSearch` 在 SDK 中可能标记 *Deprecated*，后续可迁 `PoiSearchV2`（以高德文档为准）。

---

## 5. Gradle、清单与 Key

### 5.1 `frontend/android/app/build.gradle`

- **Key**：`defaultConfig.manifestPlaceholders = [AMAP_API_KEY: amapApiKey]`  
- **读取顺序**：环境变量 `AMAP_API_KEY` → `frontend/.env` 中 `EXPO_PUBLIC_AMAP_API_KEY` → `local.properties` 的 `amap.api.key` → Gradle 属性。  
- **依赖**：`implementation fileTree(dir: "libs", include: ["*.jar"])`。

### 5.2 `frontend/.env`（勿提交真实 Key 到公开仓库）

```env
EXPO_PUBLIC_AMAP_API_KEY=你的Key
```

### 5.3 `AndroidManifest.xml`（要点）

- **权限**：`INTERNET`、`ACCESS_NETWORK_STATE`、`ACCESS_WIFI_STATE`、`CHANGE_WIFI_STATE`、`ACCESS_COARSE_LOCATION`、`ACCESS_FINE_LOCATION`、`WAKE_LOCK` 等（与地图/定位一致即可）。  
- **application 内**：  
  - `<meta-data android:name="com.amap.api.v2.apikey" android:value="${AMAP_API_KEY}"/>`  
  - `<service android:name="com.amap.api.location.APSService" android:exported="false"/>`

---

## 6. 隐私合规（Application）

在 **`MainApplication.onCreate()`** 中，`super.onCreate()` **之后**、其它初始化之前：

1. **定位**：`AMapLocationClient.updatePrivacyShow(this, true, true)`、`AmapLocationClient.updatePrivacyAgree(this, true)`  
2. **搜索**：`ServiceSettings.updatePrivacyShow(this, true, true)`、`ServiceSettings.updatePrivacyAgree(this, true)`  

正式上线应在 **用户同意隐私政策** 后再设为 `true`（或先 `false` 再在同意后更新）。

---

## 7. ProGuard

`frontend/android/app/proguard-rules.pro` 中保留：

```proguard
-keep class com.amap.api.** { *; }
-keep class com.autonavi.** { *; }
-dontwarn com.amap.api.**
```

（地图、定位、搜索包名均在 `com.amap.api` 下。）

---

## 8. 高德控制台与 SHA1

| 配置项 | 值 |
|--------|-----|
| 包名 | `com.anonymous.carpooling`（与 `applicationId` 一致） |
| Key | 与 `EXPO_PUBLIC_AMAP_API_KEY` 一致 |

### 8.1 Debug 签名必须用工程内 keystore

本工程 **`debug` 使用** `frontend/android/app/debug.keystore`（**不是** `C:\Users\<用户>\.android\debug.keystore`）。两份证书 **SHA1 不同**。

获取方式：

```bash
cd frontend/android
./gradlew signingReport
# Windows: gradlew.bat signingReport
```

在 **`> Task :app:signingReport`** → **`Variant: debug`** 中查看 **`SHA1:`**，将该值填入高德控制台。**可同时添加多条** SHA1（工程 debug、用户目录 debug、release）。

### 8.2 常见错误 rCode=1008

- **含义**：`CODE_AMAP_INVALID_USER_SCODE`，安全码（SHA1）未通过。  
- **处理**：核对控制台包名与 **实际安装包** 的签名 SHA1；地图能显示不代表搜索已通过校验。

---

## 9. RN 业务开发（地图 / 定位 / POI）

### 9.1 前提

- 使用 **`npx expo run:android`**；**Expo Go** 无自定义原生模块。  
- 非路由组件放在 **`frontend/components/`**（与 `src` 同级），见 `CONTRIBUTING.md`。

### 9.2 地图组件 `AmapMapTestView`

路径：`frontend/components/amap-map-test-view.tsx`。主要 props：`latitude`、`longitude`、`zoom`、`recenterToken`（需强制再次居中时递增）。

### 9.3 定位 `NativeModules.AmapLocation`

- `getCurrentLocation()` → 含 `latitude`、`longitude`、`accuracy`、`city`、`district`、`province`、`address` 等。

### 9.4 搜索 `NativeModules.AmapSearch`

- `poiKeywordSearch(keyword, city, pageNum, pageSize)`  
- **`city` 为空字符串**：全国范围检索（`setCityLimit(false)`）。  
- **`city` 非空**：同城检索（通常传地级市名，如 `北京市`）。

### 9.4.1 地图测试页：城市选择 + 地点输入

`/map-test` 提供 **城市选择（先省 / 直辖市，再市）** 与 **地点关键字输入**，便于与业务表单一致联调：

| 控件 | 默认 / 行为 |
|--------|-------------|
| **城市** | **`CityPicker` 组件**（`frontend/utils/city-picker.tsx`，与 `src` 同级，避免被 Expo Router 当作路由）：第一步选省级行政区，第二步选地级市；首项 **「全国」** 表示不限制城市。传给原生时 **`全国` 或空** 等价于 `city=''`（全国 POI）。**获取定位**成功后，若有逆地理 `city` 则写入选中城市；若该城市在数据表中可匹配省份，则插入对应省列表首位；若无法匹配省份，则出现 **「使用定位城市：xxx」** 快捷项。 |
| **地点** | POI 关键字输入（如「天安门」「加油站」）。 |

省 / 市数据、`cityToNativeParam` 与 `CityPicker` 均在 `frontend/utils/city-picker.tsx`（勿放入 `src/`，否则 Expo Router 会将其当作页面路由），可按业务扩展数据或拆分模块。

### 9.5 示例流程

定位 → 地图居中（`recenterToken++`）→ 城市选择（省 → 市）同步逆地理城市（或保持全国）→ 输入地点关键字 → POI 搜索 → 选点更新地图与表单。

**联调页面**：`/map-test`（`src/pages/map-test-page.tsx`）。

### 9.6 地图测试页：POI 结果点击定位

`/map-test` 在 **POI 搜索成功**后，先对 **本页拉取到的全部结果**（`pageSize` 最大 50，与 `AmapSearchModule` 一致）按所选方式排序，再 **截取前 5 条** 列表展示，**每条可点击**，用于在地图上查看该 POI 位置（与仅文字展示不同，便于联调「搜索 → 地图」闭环）。

| 行为 | 说明 |
|------|------|
| **排序** | **默认（接口顺序）**：与 SDK 对本页全部结果的返回顺序一致，再取前 5 条。**距我距离**：对本页全部结果按与「获取定位」成功时保存的 `userLocateLat` / `userLocateLng`（Haversine 球面距离，米）升序后，再取前 5 条；无经纬度的条目排在后面。未成功获取定位时「距我距离」不可用。 |
| **有经纬度** | 点击后设置 `latitude` / `longitude`，并对 **`recenterToken` 递增**，触发原生 `AmapMapTestView` 再次移动镜头（与「获取定位」后居中逻辑一致；若经纬度与上次相同，也必须依赖 `recenterToken` 变化才能强制居中）。 |
| **无经纬度** | 仍可点击；弹出系统提示（`Alert`），说明该条未返回坐标，无法移动地图。列表上对无坐标项会标注「无坐标」类文案。 |

**业务页复用**：将搜索返回数组（如前 5 条）映射为 `TouchableOpacity`（或 `Pressable`），在 `onPress` 中若 `latitude`/`longitude` 为有效数字则更新地图状态并递增 `recenterToken`；否则提示用户。

实现参考：`frontend/src/pages/map-test-page.tsx` 中的 `poiAllResults`（单次搜索完整列表）、`poiSortMode`、`POI_DISPLAY_LIMIT`、`focusPoiOnMap`；距离计算见 `frontend/utils/geo.ts`（`haversineMeters`）。

---

## 10. 文件索引与排错

| 说明 | 路径 |
|------|------|
| 地图 RN 封装 | `frontend/components/amap-map-test-view.tsx` |
| 地图 ViewManager | `.../AmapMapTestViewManager.kt` |
| 定位模块 | `.../AmapLocationModule.kt` |
| 搜索模块 | `.../AmapSearchModule.kt` |
| Package 注册 | `.../MainApplication.kt`（`AmapMapPackage`、`AmapLocationPackage`、`AmapSearchPackage`） |
| 清单 | `frontend/android/app/src/main/AndroidManifest.xml` |
| Gradle | `frontend/android/app/build.gradle` |

---

## 相关文档

- [安卓原生工程与版本控制说明.md](./安卓原生工程与版本控制说明.md) — `android` 目录与 Git  
- `frontend/README.md` — 前端运行与 Metro 等  

---

*若原生 API 有变更，以 Kotlin 源码与高德官方文档为准。*
