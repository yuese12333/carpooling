/**
 * 地图 SDK 导入验证页：展示高德 2D MapView 是否成功加载。
 * 路由：/map-test
 */

import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmapMapTestView } from '../../components/amap-map-test-view';

export default function MapTestPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const AmapLocation = (NativeModules as any)?.AmapLocation;
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [recenterToken, setRecenterToken] = useState(0);

  const handleLocate = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!AmapLocation?.getCurrentLocation) {
      setLocError('未找到原生定位模块 AmapLocation，请确认已编译安装（expo run:android）');
      return;
    }

    setLocError('');
    setLocLoading(true);
    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '定位权限申请',
          message: '需要定位权限以获取你的位置并在地图上展示。',
          buttonPositive: '允许',
          buttonNegative: '拒绝',
        },
      );

      if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocError('未授予定位权限，无法获取位置');
        return;
      }

      const res = await AmapLocation.getCurrentLocation();
      setLatitude(typeof res?.latitude === 'number' ? res.latitude : null);
      setLongitude(typeof res?.longitude === 'number' ? res.longitude : null);
      setAccuracy(typeof res?.accuracy === 'number' ? res.accuracy : null);
      // 强制触发一次原生镜头居中，即便经纬度与上次相同
      setRecenterToken((v) => v + 1);
    } catch (e: any) {
      setLocError(e?.message ? String(e.message) : '获取定位失败，请稍后重试');
    } finally {
      setLocLoading(false);
    }
  }, [AmapLocation]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '高德地图测试',
          headerBackTitle: '返回',
        }}
      />
      <View style={styles.root}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>SDK 导入自检</Text>
          <Text style={styles.bannerDesc}>
            若下方出现地图底图（非灰块/报错），说明 JAR、清单 Key 与原生视图注册正常。请确认
            frontend/.env 已配置 EXPO_PUBLIC_AMAP_API_KEY，并重新执行 `npx expo run:android`。
          </Text>
          {Platform.OS === 'android' ? (
            <Text style={styles.bannerHint}>当前平台：Android</Text>
          ) : (
            <Text style={styles.bannerHint}>当前平台：{Platform.OS}（仅 Android 显示地图）</Text>
          )}
        </View>

        <View style={styles.locPanel}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLocate}
            disabled={locLoading}
            style={[styles.locBtn, locLoading ? styles.locBtnDisabled : undefined]}
          >
            {locLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.locBtnText}>获取定位</Text>
            )}
          </TouchableOpacity>

          {locError ? (
            <Text style={styles.locError}>{locError}</Text>
          ) : latitude != null && longitude != null ? (
            <Text style={styles.locOk}>
              位置：{latitude.toFixed(6)}, {longitude.toFixed(6)}
              {accuracy != null ? `（精度 ${accuracy.toFixed(0)}m）` : ''}
            </Text>
          ) : (
            <Text style={styles.locHint}>点击「获取定位」以把镜头移动到当前位置</Text>
          )}
        </View>

        <View style={styles.mapShell}>
          <AmapMapTestView
            style={styles.mapInner}
            latitude={latitude ?? undefined}
            longitude={longitude ?? undefined}
            zoom={17}
            recenterToken={recenterToken}
          />
        </View>

        <TouchableOpacity
          style={[styles.backBtn, { marginBottom: Math.max(insets.bottom, 16) }]}
          onPress={handleBack}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>返回上一页</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  bannerHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563eb',
  },
  mapShell: {
    flex: 1,
    minHeight: 320,
    padding: 12,
  },
  mapInner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  locPanel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  locBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  locBtnDisabled: {
    opacity: 0.7,
  },
  locBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  locError: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
  },
  locOk: {
    marginTop: 8,
    color: '#16a34a',
    fontSize: 13,
    lineHeight: 18,
  },
  locHint: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
  backBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
