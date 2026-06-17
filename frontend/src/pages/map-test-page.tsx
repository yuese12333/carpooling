/**
 * 地图导航测试页：输入起点地址/终点地址并启动导航。
 * 路由：/map-test
 */

import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmapMapTestView } from '@/components/amap-map-test-view';
import { startNavi } from '@/utils/amap-navi';
import logger from '@/utils/logger';

const ZOOM_MIN = 3;
const ZOOM_MAX = 20;
const ZOOM_STEP = 1;

type PoiResultRow = {
  title?: string;
  snippet?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function MapTestPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const AmapLocation = (NativeModules as any)?.AmapLocation;
  const AmapSearch = (NativeModules as any)?.AmapSearch;

  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);
  const [zoom, setZoom] = useState(15);

  const [startKeyword, setStartKeyword] = useState('');
  const [endKeyword, setEndKeyword] = useState('北京国贸');
  const [startPoi, setStartPoi] = useState<PoiResultRow | null>(null);
  const [endPoi, setEndPoi] = useState<PoiResultRow | null>(null);
  const [startPoiResults, setStartPoiResults] = useState<PoiResultRow[]>([]);
  const [endPoiResults, setEndPoiResults] = useState<PoiResultRow[]>([]);
  const [startSearchLoading, setStartSearchLoading] = useState(false);
  const [endSearchLoading, setEndSearchLoading] = useState(false);
  const [startSearchError, setStartSearchError] = useState('');
  const [endSearchError, setEndSearchError] = useState('');

  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [naviLoading, setNaviLoading] = useState(false);
  const [naviError, setNaviError] = useState('');

  const searchPoi = useCallback(
    async (keyword: string): Promise<PoiResultRow[]> => {
      if (!AmapSearch?.poiKeywordSearch) {
        throw new Error('未找到原生搜索模块 AmapSearch');
      }
      const text = keyword.trim();
      if (!text) {
        throw new Error('地址不能为空');
      }
      const list = (await AmapSearch.poiKeywordSearch(text, '', 0, 8)) as PoiResultRow[];
      const valid = (Array.isArray(list) ? list : []).filter(
        (it) => typeof it?.latitude === 'number' && typeof it?.longitude === 'number',
      );
      if (valid.length === 0) {
        throw new Error(`未找到可用 POI：${text}`);
      }
      return valid;
    },
    [AmapSearch],
  );

  const handleLocateAndFillStart = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!AmapLocation?.getCurrentLocation) {
      setLocError('未找到原生定位模块 AmapLocation');
      return;
    }

    setLocError('');
    setLocLoading(true);
    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '定位权限申请',
          message: '需要定位权限以获取当前位置并回填起点地址。',
          buttonPositive: '允许',
          buttonNegative: '拒绝',
        },
      );
      if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocError('未授予定位权限');
        return;
      }
      const res = await AmapLocation.getCurrentLocation();
      const lat = typeof res?.latitude === 'number' ? res.latitude : null;
      const lng = typeof res?.longitude === 'number' ? res.longitude : null;
      const addr = res?.address != null ? String(res.address).trim() : '';
      if (lat == null || lng == null) {
        setLocError('定位结果缺少坐标');
        return;
      }
      setMapLat(lat);
      setMapLng(lng);
      setRecenterToken((v) => v + 1);
      if (addr) setStartKeyword(addr);
      setStartPoi({ title: addr || '当前位置', latitude: lat, longitude: lng });
      setStartPoiResults([]);
      logger.info({
        module: 'MapTestPage',
        operate: 'handleLocateAndFillStart',
        result: `定位成功 lat=${lat} lng=${lng} address=${addr}`,
      });
    } catch (e: any) {
      setLocError(e?.message ? String(e.message) : '定位失败');
    } finally {
      setLocLoading(false);
    }
  }, [AmapLocation]);

  const handleSearchStartPoi = useCallback(async () => {
    setStartSearchError('');
    setStartSearchLoading(true);
    try {
      const rows = await searchPoi(startKeyword);
      setStartPoiResults(rows);
      setStartPoi(null);
    } catch (e: any) {
      setStartPoiResults([]);
      setStartSearchError(e?.message ? String(e.message) : '起点 POI 搜索失败');
    } finally {
      setStartSearchLoading(false);
    }
  }, [searchPoi, startKeyword]);

  const handleSearchEndPoi = useCallback(async () => {
    setEndSearchError('');
    setEndSearchLoading(true);
    try {
      const rows = await searchPoi(endKeyword);
      setEndPoiResults(rows);
      setEndPoi(null);
    } catch (e: any) {
      setEndPoiResults([]);
      setEndSearchError(e?.message ? String(e.message) : '终点 POI 搜索失败');
    } finally {
      setEndSearchLoading(false);
    }
  }, [searchPoi, endKeyword]);

  const handleStartNavi = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    const startLat = startPoi?.latitude;
    const startLng = startPoi?.longitude;
    const endLat = endPoi?.latitude;
    const endLng = endPoi?.longitude;
    if (
      typeof startLat !== 'number' ||
      typeof startLng !== 'number' ||
      typeof endLat !== 'number' ||
      typeof endLng !== 'number'
    ) {
      setNaviError('请先从 POI 结果中选择起点和终点');
      return;
    }

    setNaviError('');
    setNaviLoading(true);
    try {
      setMapLat(endLat);
      setMapLng(endLng);
      setRecenterToken((v) => v + 1);
      await startNavi({
        startLat,
        startLng,
        startName: startPoi?.title ?? (startKeyword.trim() || '起点'),
        endLat,
        endLng,
        endName: endPoi?.title ?? (endKeyword.trim() || '终点'),
      } as any);
      logger.info({
        module: 'MapTestPage',
        operate: 'handleStartNavi',
        params: `start=${startPoi?.title ?? ''} end=${endPoi?.title ?? ''}`,
        result: `导航页面已拉起，等待原生算路回调 start=(${startLat},${startLng}) end=(${endLat},${endLng})`,
      });
    } catch (e: any) {
      const message = e?.message ? String(e.message) : '导航启动失败';
      setNaviError(message);
      logger.error({
        module: 'MapTestPage',
        operate: 'handleStartNavi',
        params: `start=${startPoi?.title ?? ''} end=${endPoi?.title ?? ''}`,
        error: message,
        errorType: e?.name ?? 'Unknown',
      });
    } finally {
      setNaviLoading(false);
    }
  }, [startPoi, endPoi, startKeyword, endKeyword]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '导航测试', headerBackTitle: '返回' }} />
      <View style={styles.root}>
        <View style={styles.mapShell}>
          <AmapMapTestView
            style={styles.mapInner}
            latitude={mapLat ?? undefined}
            longitude={mapLng ?? undefined}
            zoom={zoom}
            recenterToken={recenterToken}
          />
          <View style={styles.zoomCtrl}>
            <TouchableOpacity
              style={[styles.zoomBtn, zoom >= ZOOM_MAX && styles.zoomBtnDisabled]}
              onPress={handleZoomIn}
              disabled={zoom >= ZOOM_MAX}
              activeOpacity={0.8}
            >
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomLevelBadge}>
              <Text style={styles.zoomLevelText}>{zoom}</Text>
            </View>
            <TouchableOpacity
              style={[styles.zoomBtn, zoom <= ZOOM_MIN && styles.zoomBtnDisabled]}
              onPress={handleZoomOut}
              disabled={zoom <= ZOOM_MIN}
              activeOpacity={0.8}
            >
              <Text style={styles.zoomBtnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {Platform.OS === 'android' ? (
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={[styles.panelContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLocateAndFillStart}
              disabled={locLoading}
              style={[styles.primaryBtn, locLoading && styles.btnDisabled]}
            >
              {locLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>用当前位置回填起点地址</Text>
              )}
            </TouchableOpacity>
            {locError ? <Text style={styles.errorText}>{locError}</Text> : null}

            <Text style={styles.fieldLabel}>起点地址</Text>
            <TextInput
              style={styles.textInput}
              placeholder="如：北京市朝阳区望京SOHO"
              placeholderTextColor="#9ca3af"
              value={startKeyword}
              onChangeText={setStartKeyword}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSearchStartPoi}
              disabled={startSearchLoading}
              style={[styles.searchBtn, startSearchLoading && styles.btnDisabled]}
            >
              {startSearchLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>搜索起点 POI</Text>
              )}
            </TouchableOpacity>
            {startSearchError ? <Text style={styles.errorText}>{startSearchError}</Text> : null}
            {startPoi ? (
              <Text style={styles.selectedText}>已选起点：{startPoi.title ?? '未命名POI'}</Text>
            ) : null}
            {startPoiResults.map((poi, index) => (
              <TouchableOpacity
                key={`start-poi-${index}`}
                activeOpacity={0.8}
                style={styles.poiItem}
                onPress={() => {
                  setStartPoi(poi);
                  setStartPoiResults([]);
                  if (typeof poi.latitude === 'number' && typeof poi.longitude === 'number') {
                    setMapLat(poi.latitude);
                    setMapLng(poi.longitude);
                    setRecenterToken((v) => v + 1);
                  }
                }}
              >
                <Text style={styles.poiTitle}>{poi.title ?? '未命名POI'}</Text>
                {poi.snippet ? <Text style={styles.poiSnippet}>{poi.snippet}</Text> : null}
              </TouchableOpacity>
            ))}

            <Text style={styles.fieldLabel}>终点地址</Text>
            <TextInput
              style={styles.textInput}
              placeholder="如：北京国贸"
              placeholderTextColor="#9ca3af"
              value={endKeyword}
              onChangeText={setEndKeyword}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSearchEndPoi}
              disabled={endSearchLoading}
              style={[styles.searchBtn, endSearchLoading && styles.btnDisabled]}
            >
              {endSearchLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>搜索终点 POI</Text>
              )}
            </TouchableOpacity>
            {endSearchError ? <Text style={styles.errorText}>{endSearchError}</Text> : null}
            {endPoi ? <Text style={styles.selectedText}>已选终点：{endPoi.title ?? '未命名POI'}</Text> : null}
            {endPoiResults.map((poi, index) => (
              <TouchableOpacity
                key={`end-poi-${index}`}
                activeOpacity={0.8}
                style={styles.poiItem}
                onPress={() => {
                  setEndPoi(poi);
                  setEndPoiResults([]);
                  if (typeof poi.latitude === 'number' && typeof poi.longitude === 'number') {
                    setMapLat(poi.latitude);
                    setMapLng(poi.longitude);
                    setRecenterToken((v) => v + 1);
                  }
                }}
              >
                <Text style={styles.poiTitle}>{poi.title ?? '未命名POI'}</Text>
                {poi.snippet ? <Text style={styles.poiSnippet}>{poi.snippet}</Text> : null}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStartNavi}
              disabled={naviLoading}
              style={[styles.primaryBtn, styles.naviBtn, naviLoading && styles.btnDisabled]}
            >
              {naviLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>启动导航</Text>
              )}
            </TouchableOpacity>
            {naviError ? <Text style={styles.errorText}>{naviError}</Text> : null}
            <Text style={styles.hintText}>先搜索并选择起点/终点 POI，再启动导航。</Text>

            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
              <Text style={styles.backBtnText}>返回上一页</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 16) }}>
            <Text style={styles.hintText}>导航测试仅在 Android 原生构建中可用。</Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
              <Text style={styles.backBtnText}>返回上一页</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapShell: {
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  mapInner: {
    flex: 1,
  },
  zoomCtrl: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    alignItems: 'center',
    gap: 4,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  zoomBtnDisabled: {
    opacity: 0.35,
  },
  zoomBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  zoomLevelBadge: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(17,24,39,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    padding: 16,
  },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    marginBottom: 10,
  },
  searchBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    marginBottom: 10,
  },
  naviBtn: {
    backgroundColor: '#7c3aed',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  hintText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  selectedText: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 8,
    fontWeight: '600',
  },
  poiItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  poiTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  poiSnippet: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  backBtn: {
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
