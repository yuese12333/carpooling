/**
 * @file ride-navigation.tsx
 * @description 导航页面 - 基于高德原生 SDK，提供出发地/目的地输入与地图导航功能
 * 关联业务：用户拼车行程中的实时导航
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navigation, MapPin, ArrowLeft } from 'lucide-react-native';

import { AmapMapTestView } from '@/../components/amap-map-test-view';
import logger, { generateRequestId } from '@/utils/logger';

const MODULE = 'RideNavigation';

export default function RideNavigationPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 每次进入页面生成唯一链路 ID
  const requestId = useMemo(() => generateRequestId(), []);

  const AmapLocation = (NativeModules as any)?.AmapLocation;

  // 地图坐标状态
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);

  // 定位状态
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [locText, setLocText] = useState('');

  // 出发地 / 目的地输入
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');

  /**
   * 获取当前位置，自动填入出发地
   */
  const handleLocate = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setLocError('定位功能仅支持 Android 端');
      return;
    }
    if (!AmapLocation?.getCurrentLocation) {
      setLocError('未找到原生定位模块，请确认已执行 expo run:android');
      return;
    }

    setLocError('');
    setLocLoading(true);

    logger.info({
      module: MODULE,
      operate: '获取当前位置',
      result: '开始定位',
      requestId,
    });

    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '定位权限申请',
          message: '导航功能需要获取您的位置',
          buttonPositive: '允许',
          buttonNegative: '拒绝',
        },
      );

      if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
        logger.warn({
          module: MODULE,
          operate: '获取当前位置',
          result: '用户拒绝定位权限',
          requestId,
        });
        setLocError('未授予定位权限，无法获取位置');
        return;
      }

      const res = await AmapLocation.getCurrentLocation();
      const lat = typeof res?.latitude === 'number' ? res.latitude : null;
      const lng = typeof res?.longitude === 'number' ? res.longitude : null;

      if (lat != null && lng != null) {
        setLatitude(lat);
        setLongitude(lng);
        setRecenterToken(v => v + 1);
        const city = res?.city ? String(res.city) : '';
        const text = city
          ? `${city}（${lat.toFixed(5)}, ${lng.toFixed(5)}）`
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setLocText(text);
        // 自动填入出发地
        if (!fromInput) setFromInput(city || '当前位置');

        logger.info({
          module: MODULE,
          operate: '获取当前位置',
          result: `定位成功，城市：${city}`,
          requestId,
        });
      }
    } catch (error: any) {
      logger.error({
        module: MODULE,
        operate: '获取当前位置',
        error: error?.message || '定位失败',
        errorType: '原生模块异常',
        requestId,
      });
      setLocError(error?.message || '获取位置失败，请稍后重试');
    } finally {
      setLocLoading(false);
    }
  }, [AmapLocation, fromInput, requestId]);

  /**
   * 开始导航（记录日志，跳转或触发原生导航）
   */
  const handleStartNavigation = () => {
    if (!fromInput.trim() || !toInput.trim()) {
      setLocError('请填写出发地和目的地');
      return;
    }

    logger.info({
      module: MODULE,
      operate: '开始导航',
      params: { from: fromInput, to: toInput },
      result: '导航指令已下发',
      requestId,
    });

    // TODO: 对接高德原生导航 SDK 启动导航
    setLocError('');
    setLocText(`正在导航：${fromInput} → ${toInput}`);
  };

  const handleBack = () => {
    logger.info({
      module: MODULE,
      operate: '退出导航页',
      result: '用户手动返回',
      requestId,
    });
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
          headerShown: false,
        }}
      />

      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>行程导航</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 输入区域 */}
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>设置路线</Text>

            {/* 出发地 */}
            <View style={styles.inputRow}>
              <View style={styles.inputIconGreen}>
                <Navigation size={14} color="#16a34a" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="出发地"
                placeholderTextColor="#9ca3af"
                value={fromInput}
                onChangeText={setFromInput}
              />
            </View>

            {/* 目的地 */}
            <View style={[styles.inputRow, styles.borderTopNone]}>
              <View style={styles.inputIconOrange}>
                <MapPin size={14} color="#f97316" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="目的地"
                placeholderTextColor="#9ca3af"
                value={toInput}
                onChangeText={setToInput}
              />
            </View>

            {/* 定位按钮 */}
            <TouchableOpacity
              style={[styles.locBtn, locLoading && styles.btnDisabled]}
              onPress={handleLocate}
              disabled={locLoading}
              activeOpacity={0.8}
            >
              {locLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>📍 获取当前位置</Text>
              )}
            </TouchableOpacity>

            {/* 开始导航按钮 */}
            <TouchableOpacity
              style={[styles.startBtn, (!fromInput || !toInput) && styles.btnDisabled]}
              onPress={handleStartNavigation}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>🚗 开始导航</Text>
            </TouchableOpacity>

            {/* 状态提示 */}
            {locError ? (
              <Text style={styles.errorText}>{locError}</Text>
            ) : locText ? (
              <Text style={styles.successText}>{locText}</Text>
            ) : null}

            {/* 仅 Android 提示 */}
            {Platform.OS !== 'android' && (
              <Text style={styles.hintText}>
                ⚠️ 地图与导航功能仅支持 Android 端
              </Text>
            )}
          </View>

          {/* 地图区域 */}
          {Platform.OS === 'android' && (
            <View style={styles.mapShell}>
              <AmapMapTestView
                style={styles.mapInner}
                latitude={latitude ?? undefined}
                longitude={longitude ?? undefined}
                zoom={16}
                recenterToken={recenterToken}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  borderTopNone: {
    marginTop: 0,
  },
  inputIconGreen: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconOrange: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  locBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  startBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    marginTop: 8,
    color: '#16a34a',
    fontSize: 13,
    lineHeight: 18,
  },
  hintText: {
    marginTop: 8,
    color: '#f97316',
    fontSize: 13,
    lineHeight: 18,
  },
  mapShell: {
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  mapInner: {
    flex: 1,
  },
});
