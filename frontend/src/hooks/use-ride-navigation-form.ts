/**
 * @file use-ride-navigation-form.ts
 * @description 行程导航页业务逻辑：定位、POI 解析、原生导航启动与返回。
 */

import { useCallback, useState } from 'react';
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import logger from '@/utils/logger';
import { startNavi } from '@/utils/amap-navi';

const MODULE = 'useRideNavigationForm';

type PoiResultRow = {
  title?: string;
  snippet?: string;
  latitude?: number | null;
  longitude?: number | null;
};

/**
 * 行程导航页业务 Hook
 * @param requestId 由 Page 层注入的全链路 ID
 */
export const useRideNavigationForm = (requestId: string) => {
  const router = useRouter();
  const AmapLocation = (NativeModules as { AmapLocation?: { getCurrentLocation: () => Promise<Record<string, unknown>> } })?.AmapLocation;
  const AmapSearch = (NativeModules as { AmapSearch?: { poiKeywordSearch: (keyword: string, city: string, page: number, size: number) => Promise<PoiResultRow[]> } })?.AmapSearch;

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);

  const [locLoading, setLocLoading] = useState(false);
  const [naviLoading, setNaviLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [formError, setFormError] = useState('');
  const [statusText, setStatusText] = useState('');

  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [startPoi, setStartPoi] = useState<PoiResultRow | null>(null);
  const [endPoi, setEndPoi] = useState<PoiResultRow | null>(null);

  const searchPoi = useCallback(
    async (keyword: string): Promise<PoiResultRow> => {
      if (!AmapSearch?.poiKeywordSearch) {
        throw new Error('未找到原生搜索模块 AmapSearch');
      }
      const text = keyword.trim();
      if (!text) {
        throw new Error('地址不能为空');
      }
      const list = await AmapSearch.poiKeywordSearch(text, '', 0, 8);
      const valid = (Array.isArray(list) ? list : []).filter(
        (it) => typeof it?.latitude === 'number' && typeof it?.longitude === 'number',
      );
      if (valid.length === 0) {
        throw new Error(`未找到可用地址：${text}`);
      }
      return valid[0];
    },
    [AmapSearch],
  );

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
    setFormError('');
    setLocLoading(true);

    logger.info({
      module: MODULE,
      operate: 'locate_start',
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
          operate: 'locate_permission_denied',
          requestId,
        });
        setLocError('未授予定位权限，无法获取位置');
        return;
      }

      const res = await AmapLocation.getCurrentLocation();
      const lat = typeof res?.latitude === 'number' ? res.latitude : null;
      const lng = typeof res?.longitude === 'number' ? res.longitude : null;

      if (lat == null || lng == null) {
        setLocError('定位结果缺少坐标');
        return;
      }

      setLatitude(lat);
      setLongitude(lng);
      setRecenterToken((v) => v + 1);

      const city = res?.city != null ? String(res.city) : '';
      const addr = res?.address != null ? String(res.address).trim() : '';
      const label = addr || city || '当前位置';
      const text = city
        ? `${city}（${lat.toFixed(5)}, ${lng.toFixed(5)}）`
        : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      setStatusText(text);
      if (!fromInput.trim()) {
        setFromInput(label);
      }
      setStartPoi({ title: label, latitude: lat, longitude: lng });

      logger.info({
        module: MODULE,
        operate: 'locate_success',
        params: { hasCity: Boolean(city) },
        requestId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '获取位置失败，请稍后重试';
      logger.error({
        module: MODULE,
        operate: 'locate_error',
        error: message,
        errorType: 'NATIVE_LOCATION_ERROR',
        requestId,
      });
      setLocError(message);
    } finally {
      setLocLoading(false);
    }
  }, [AmapLocation, fromInput, requestId]);

  const resolveStartPoi = useCallback(async (): Promise<PoiResultRow> => {
    if (
      startPoi &&
      typeof startPoi.latitude === 'number' &&
      typeof startPoi.longitude === 'number'
    ) {
      return startPoi;
    }
    if (latitude != null && longitude != null) {
      return {
        title: fromInput.trim() || '起点',
        latitude,
        longitude,
      };
    }
    return searchPoi(fromInput);
  }, [fromInput, latitude, longitude, searchPoi, startPoi]);

  const handleStartNavigation = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setFormError('导航功能仅支持 Android 端');
      return;
    }
    if (!fromInput.trim() || !toInput.trim()) {
      setFormError('请填写出发地和目的地');
      return;
    }

    setFormError('');
    setLocError('');
    setNaviLoading(true);

    logger.info({
      module: MODULE,
      operate: 'start_navi',
      params: { hasFrom: Boolean(fromInput.trim()), hasTo: Boolean(toInput.trim()) },
      requestId,
    });

    try {
      const start = await resolveStartPoi();
      const end = await searchPoi(toInput);
      setStartPoi(start);
      setEndPoi(end);

      const startLat = start.latitude as number;
      const startLng = start.longitude as number;
      const endLat = end.latitude as number;
      const endLng = end.longitude as number;

      setLatitude(endLat);
      setLongitude(endLng);
      setRecenterToken((v) => v + 1);

      await startNavi({
        startLat,
        startLng,
        startName: start.title ?? fromInput.trim(),
        endLat,
        endLng,
        endName: end.title ?? toInput.trim(),
      });

      setStatusText(`正在导航：${start.title ?? fromInput} → ${end.title ?? toInput}`);

      logger.info({
        module: MODULE,
        operate: 'start_navi_success',
        requestId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '导航启动失败';
      setFormError(message);
      logger.error({
        module: MODULE,
        operate: 'start_navi_error',
        error: message,
        errorType: 'NATIVE_NAVI_ERROR',
        requestId,
      });
    } finally {
      setNaviLoading(false);
    }
  }, [fromInput, toInput, resolveStartPoi, searchPoi, requestId]);

  const goBack = useCallback(() => {
    logger.info({
      module: MODULE,
      operate: 'page_back',
      requestId,
    });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router, requestId]);

  return {
    latitude,
    longitude,
    recenterToken,
    locLoading,
    naviLoading,
    locError,
    formError,
    statusText,
    fromInput,
    toInput,
    setFromInput,
    setToInput,
    handleLocate,
    handleStartNavigation,
    goBack,
  };
};
