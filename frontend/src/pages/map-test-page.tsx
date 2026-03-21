/**
 * 地图 SDK 导入验证页：展示高德 2D MapView 是否成功加载。
 * 路由：/map-test
 */

import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmapMapTestView } from '../../components/amap-map-test-view';

export default function MapTestPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

        <View style={styles.mapShell}>
          <AmapMapTestView style={styles.mapInner} />
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
