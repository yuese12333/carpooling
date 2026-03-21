/**
 * 高德 2D 地图原生视图封装（仅 Android）。
 * 依赖 app 内已接入的 Amap_2DMap JAR 与 AmapMapTestViewManager。
 * 放在 frontend/components（与 src 同级），避免被 Expo Router 当作路由扫描。
 */

import React from 'react';
import {
  Platform,
  requireNativeComponent,
  type StyleProp,
  StyleSheet,
  Text,
  UIManager,
  View,
  type ViewStyle,
} from 'react-native';

const NATIVE_VIEW_NAME = 'AmapMapTest';

type NativeProps = {
  /** 与 RN 内置 View 一致，支持数组以合并样式 */
  style?: StyleProp<ViewStyle>;

  /** 纬度（由定位模块提供） */
  latitude?: number;
  /** 经度（由定位模块提供） */
  longitude?: number;
  /** 缩放级别（移动镜头用） */
  zoom?: number;
  /** 每次变化都触发一次重新居中（即便经纬度未变） */
  recenterToken?: number;
};

function getNativeMapView(): React.ComponentType<NativeProps> | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (UIManager.getViewManagerConfig(NATIVE_VIEW_NAME) == null) {
    return null;
  }
  return requireNativeComponent<NativeProps>(NATIVE_VIEW_NAME);
}

const NativeAmapMapTest = getNativeMapView();

export type AmapMapTestViewProps = {
  style?: StyleProp<ViewStyle>;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  recenterToken?: number;
};

/**
 * 测试用地图区域：在 development build / `expo run:android` 下应显示高德底图。
 * Expo Go 不包含自定义原生模块，将显示提示文案。
 */
export function AmapMapTestView({
  style,
  latitude,
  longitude,
  zoom = 17,
  recenterToken,
}: AmapMapTestViewProps) {
  if (Platform.OS !== 'android') {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>
          高德 2D 地图测试页当前仅在 Android 原生构建中可用。
        </Text>
      </View>
    );
  }

  if (NativeAmapMapTest == null) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>
          未找到原生视图「{NATIVE_VIEW_NAME}」。请使用 `npx expo run:android` 重新编译安装（Expo
          Go 不支持）。
        </Text>
      </View>
    );
  }

  return (
    <NativeAmapMapTest
      style={[styles.map, style]}
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      recenterToken={recenterToken}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    minHeight: 280,
    width: '100%',
    flex: 1,
  },
  fallback: {
    minHeight: 200,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  fallbackText: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
});
