/**
 * 地图 SDK 导入验证页：展示高德 2D MapView、定位与 POI 搜索是否可用。
 * 路由：/map-test
 */

import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { AmapMapTestView } from '../../components/amap-map-test-view';
import { CityPicker, cityToNativeParam } from '../utils/city-picker';
import { formatDistanceMeters, haversineMeters } from '../utils/geo';

/** 与原生 AmapSearch 返回项一致的可选字段 */
type PoiResultRow = {
  title?: string;
  snippet?: string;
  latitude?: number | null;
  longitude?: number | null;
};

/** POI 列表排序：SDK 返回顺序 vs 与「获取定位」坐标的距离 */
type PoiSortMode = 'default' | 'distance';

/** 与原生 `AmapSearchModule.poiKeywordSearch` 的 pageSize 上限一致（单次请求尽量拉满，再排序取前 5） */
const POI_SEARCH_PAGE_SIZE = 50;
const POI_DISPLAY_LIMIT = 5;

function sortPoiByDistanceFrom(
  rows: PoiResultRow[],
  userLat: number,
  userLng: number,
): PoiResultRow[] {
  const withMeta = rows.map((it, index) => {
    const lat = it.latitude;
    const lng = it.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return { it, index, dist: Number.POSITIVE_INFINITY };
    }
    return { it, index, dist: haversineMeters(userLat, userLng, lat, lng) };
  });
  withMeta.sort((a, b) => {
    if (a.dist !== b.dist) return a.dist - b.dist;
    return a.index - b.index;
  });
  return withMeta.map((x) => x.it);
}

export default function MapTestPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const AmapLocation = (NativeModules as any)?.AmapLocation;
  const AmapSearch = (NativeModules as any)?.AmapSearch;
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  /** 仅「获取定位」成功时写入，不被 POI 选点覆盖，用于「距我距离」排序 */
  const [userLocateLat, setUserLocateLat] = useState<number | null>(null);
  const [userLocateLng, setUserLocateLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [recenterToken, setRecenterToken] = useState(0);
  /** 最近一次成功定位解析到的城市（用于 POI 同城搜索）；未定位成功则为空 → 全国搜 */
  const [locatedCity, setLocatedCity] = useState('');

  /** 当前选中的城市（选择器），默认「全国」；定位成功可自动选中逆地理城市 */
  const [poiCityInput, setPoiCityInput] = useState('全国');
  /** 地点关键字 */
  const [poiKeyword, setPoiKeyword] = useState('天安门');
  const [poiLoading, setPoiLoading] = useState(false);
  const [poiError, setPoiError] = useState('');
  /** 单次搜索返回的全部 POI（最多 {@link POI_SEARCH_PAGE_SIZE} 条），排序与截取在 `poiResults` 中完成 */
  const [poiAllResults, setPoiAllResults] = useState<PoiResultRow[]>([]);
  const [poiSortMode, setPoiSortMode] = useState<PoiSortMode>('default');
  /** 搜索成功但 0 条时的提示文案 */
  const [poiEmptyHint, setPoiEmptyHint] = useState('');

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
      const lat = typeof res?.latitude === 'number' ? res.latitude : null;
      const lng = typeof res?.longitude === 'number' ? res.longitude : null;
      setLatitude(lat);
      setLongitude(lng);
      if (lat != null && lng != null) {
        setUserLocateLat(lat);
        setUserLocateLng(lng);
      }
      setAccuracy(typeof res?.accuracy === 'number' ? res.accuracy : null);
      const c = res?.city != null && String(res.city).trim() !== '' ? String(res.city).trim() : '';
      setLocatedCity(c);
      // POI 城市框：有逆地理城市则填入，否则保持「全国」
      if (c) {
        setPoiCityInput(c);
      } else {
        setPoiCityInput('全国');
      }
      // 强制触发一次原生镜头居中，即便经纬度与上次相同
      setRecenterToken((v) => v + 1);
    } catch (e: any) {
      setLocError(e?.message ? String(e.message) : '获取定位失败，请稍后重试');
    } finally {
      setLocLoading(false);
    }
  }, [AmapLocation]);

  const handlePoiSearch = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!AmapSearch?.poiKeywordSearch) {
      setPoiError('未找到原生搜索模块 AmapSearch，请确认已编译安装（expo run:android）');
      return;
    }
    const kw = poiKeyword.trim();
    if (!kw) {
      setPoiError('请输入地点关键字');
      return;
    }

    setPoiError('');
    setPoiAllResults([]);
    setPoiSortMode('default');
    setPoiEmptyHint('');
    setPoiLoading(true);
    try {
      const cityParam = cityToNativeParam(poiCityInput);
      const list = await AmapSearch.poiKeywordSearch(kw, cityParam, 0, POI_SEARCH_PAGE_SIZE);
      const arr = (Array.isArray(list) ? list : []) as PoiResultRow[];
      if (arr.length === 0) {
        setPoiEmptyHint('未返回 POI 结果（可尝试换城市或关键字）');
        return;
      }
      setPoiAllResults(arr);
      // 默认顺序下列 1 与地图首次居中：对「本页全部结果」排序规则为接口顺序时，取首条
      const first = arr[0];
      if (typeof first?.latitude === 'number' && typeof first?.longitude === 'number') {
        setLatitude(first.latitude);
        setLongitude(first.longitude);
        setRecenterToken((v) => v + 1);
      }
    } catch (e: any) {
      const code = e?.code != null ? String(e.code) : '';
      const msg = e?.message != null ? String(e.message) : 'POI 搜索失败';
      setPoiError(code ? `${code}: ${msg}` : msg);
    } finally {
      setPoiLoading(false);
    }
  }, [AmapSearch, poiKeyword, poiCityInput]);

  const hasUserLocate =
    typeof userLocateLat === 'number' &&
    typeof userLocateLng === 'number' &&
    Number.isFinite(userLocateLat) &&
    Number.isFinite(userLocateLng);

  /** 先在「本页全部搜索结果」上按所选方式排序，再取前 {@link POI_DISPLAY_LIMIT} 条 */
  const poiResults = useMemo(() => {
    const all = poiAllResults;
    if (all.length === 0) return [];
    if (poiSortMode !== 'distance' || !hasUserLocate) {
      return all.slice(0, POI_DISPLAY_LIMIT);
    }
    const sorted = sortPoiByDistanceFrom(all, userLocateLat!, userLocateLng!);
    return sorted.slice(0, POI_DISPLAY_LIMIT);
  }, [poiAllResults, poiSortMode, hasUserLocate, userLocateLat, userLocateLng]);

  const focusPoiOnMap = useCallback((item: PoiResultRow) => {
    const lat = item.latitude;
    const lng = item.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
      setLatitude(lat);
      setLongitude(lng);
      setRecenterToken((v) => v + 1);
      return;
    }
    Alert.alert('无法定位', '该条结果未返回经纬度，无法在地图上移动镜头。');
  }, []);

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
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
              {locatedCity
                ? `\n逆地理城市：${locatedCity}（已同步到上方城市选择：省 → 市）`
                : '\n未解析到城市名，POI 城市可保持「全国」'}
            </Text>
          ) : (
            <Text style={styles.locHint}>点击「获取定位」以把镜头移动到当前位置</Text>
          )}
        </View>

        {Platform.OS === 'android' ? (
          <View style={styles.searchPanel}>
            <Text style={styles.searchTitle}>POI 搜索（搜索 SDK）</Text>
            <Text style={styles.searchFieldLabel}>城市（先省 / 直辖市，后市）</Text>
            <CityPicker
              value={poiCityInput}
              onChange={setPoiCityInput}
              disabled={poiLoading}
              locatedCity={locatedCity}
            />
            <Text style={styles.searchFieldLabel}>地点</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="关键字，如：天安门、加油站"
              placeholderTextColor="#9ca3af"
              value={poiKeyword}
              onChangeText={setPoiKeyword}
              editable={!poiLoading}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePoiSearch}
              disabled={poiLoading}
              style={[styles.searchBtn, poiLoading ? styles.locBtnDisabled : undefined]}
            >
              {poiLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.locBtnText}>POI 搜索</Text>
              )}
            </TouchableOpacity>
            {poiError ? (
              <Text style={styles.locError}>{poiError}</Text>
            ) : poiAllResults.length > 0 ? (
              <View style={styles.poiList}>
                <Text style={styles.poiListHint}>
                  点击下列条目在地图上定位（展示 {POI_DISPLAY_LIMIT} 条：已对本页全部 {poiAllResults.length} 条结果排序后截取）
                </Text>
                <View style={styles.poiSortRow}>
                  <Text style={styles.poiSortLabel}>排序</Text>
                  <View style={styles.poiSortChips}>
                    <TouchableOpacity
                      style={[styles.poiSortChip, poiSortMode === 'default' && styles.poiSortChipActive]}
                      onPress={() => setPoiSortMode('default')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.poiSortChipText,
                          poiSortMode === 'default' && styles.poiSortChipTextActive,
                        ]}
                      >
                        默认（接口顺序）
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.poiSortChip,
                        poiSortMode === 'distance' && styles.poiSortChipActive,
                        !hasUserLocate && styles.poiSortChipDisabled,
                      ]}
                      onPress={() => {
                        if (hasUserLocate) setPoiSortMode('distance');
                      }}
                      disabled={!hasUserLocate}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.poiSortChipText,
                          poiSortMode === 'distance' && styles.poiSortChipTextActive,
                          !hasUserLocate && styles.poiSortChipTextDisabled,
                        ]}
                      >
                        距我距离
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {!hasUserLocate ? (
                  <Text style={styles.poiSortHint}>「距我距离」需先成功「获取定位」</Text>
                ) : null}
                {poiResults.map((it, i) => {
                  const hasCoord =
                    typeof it.latitude === 'number' && typeof it.longitude === 'number';
                  const title = it.title ?? '';
                  const sub = it.snippet ?? '';
                  const distM =
                    hasUserLocate &&
                    hasCoord &&
                    poiSortMode === 'distance' &&
                    userLocateLat != null &&
                    userLocateLng != null
                      ? haversineMeters(userLocateLat, userLocateLng, it.latitude!, it.longitude!)
                      : null;
                  return (
                    <TouchableOpacity
                      key={`poi-${title}-${sub}-${it.latitude ?? ''}-${it.longitude ?? ''}-${i}`}
                      style={[styles.poiRow, !hasCoord && styles.poiRowMuted]}
                      onPress={() => focusPoiOnMap(it)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.poiRowText}>
                        {i + 1}. {title}
                        {sub ? ` — ${sub}` : ''}
                      </Text>
                      {distM != null ? (
                        <Text style={styles.poiRowDistance}>距定位点约 {formatDistanceMeters(distM)}</Text>
                      ) : null}
                      {!hasCoord ? (
                        <Text style={styles.poiRowNoCoord}>无坐标，点击将提示</Text>
                      ) : (
                        <Text style={styles.poiRowTap}>点击在地图上定位</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : poiEmptyHint ? (
              <Text style={styles.poiPreview}>{poiEmptyHint}</Text>
            ) : (
              <Text style={styles.locHint}>
                城市请先选省再选市；「全国」为全范围检索。定位城市会在对应省份列表中优先展示；无法匹配省份时可点「使用定位城市」。
                若报 rCode=1008，请核对控制台包名与 SHA1。
              </Text>
            )}
          </View>
        ) : null}

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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
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
  searchPanel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  searchFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  searchInput: {
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
  searchBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#059669',
  },
  poiPreview: {
    marginTop: 10,
    color: '#374151',
    fontSize: 12,
    lineHeight: 18,
  },
  poiList: {
    marginTop: 10,
  },
  poiListHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  poiSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  poiSortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  poiSortChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  poiSortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  poiSortChipActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  poiSortChipDisabled: {
    opacity: 0.45,
  },
  poiSortChipText: {
    fontSize: 12,
    color: '#374151',
  },
  poiSortChipTextActive: {
    color: '#047857',
    fontWeight: '600',
  },
  poiSortChipTextDisabled: {
    color: '#9ca3af',
  },
  poiSortHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  poiRowDistance: {
    marginTop: 4,
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  poiRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  poiRowMuted: {
    backgroundColor: '#f3f4f6',
  },
  poiRowText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 20,
  },
  poiRowNoCoord: {
    marginTop: 4,
    fontSize: 11,
    color: '#9ca3af',
  },
  poiRowTap: {
    marginTop: 4,
    fontSize: 11,
    color: '#059669',
  },
  mapShell: {
    height: 360,
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
