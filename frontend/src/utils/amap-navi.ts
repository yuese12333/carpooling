/**
 * @file amap-navi.ts
 * @description 高德导航 RN 封装。调用原生 AmapNaviModule 启动全屏导航 Activity。
 * 仅 Android 原生构建（expo run:android）可用，Expo Go 不支持。
 */

import { NativeModules, Platform } from 'react-native';

const AmapNavi = (NativeModules as any)?.AmapNavi;

export type NaviParams = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

/**
 * 启动高德逐步导航（全屏 Activity）。
 * 路线计算成功后自动进入导航模式。
 *
 * @param params 起终点经纬度
 * @throws 若平台非 Android 或原生模块未找到则抛出错误
 *
 * @example
 * await startNavi({
 *   startLat: currentLat,
 *   startLng: currentLng,
 *   endLat: ride.toLat,
 *   endLng: ride.toLng,
 * });
 */
export async function startNavi(params: NaviParams): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('导航功能仅支持 Android');
  }
  if (!AmapNavi?.startNavi) {
    throw new Error('未找到原生导航模块 AmapNavi，请确认已使用 expo run:android 编译安装');
  }
  await AmapNavi.startNavi(
    params.startLat,
    params.startLng,
    params.endLat,
    params.endLng,
  );
}
