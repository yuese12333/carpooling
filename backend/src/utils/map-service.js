/**
 * 文件功能：地图服务工具类
 * 关联业务：地点搜索、路线规划、距离计算
 * 说明：封装高德地图 API 调用
 */
const axios = require('axios');
const { logger } = require('./logger');

const AMAP_KEY = process.env.AMAP_KEY || '';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

/**
 * 函数功能：地点搜索（关键字搜索）
 * 入参：keyword（字符串，搜索关键字）、city（字符串，城市名）、limit（数字，返回数量上限）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Array> - 地点列表
 */
async function searchPlaces(keyword, city, limit = 10, requestId = '') {
  if (!AMAP_KEY) {
    logger.warn({
      module: 'map-service',
      operate: 'search-places',
      requestId,
      result: 'AMAP_KEY not configured, returning mock data',
    });
    return generateMockPlaces(keyword, city, limit);
  }

  try {
    const response = await axios.get(`${AMAP_BASE_URL}/place/text`, {
      params: {
        key: AMAP_KEY,
        keywords: keyword,
        city,
        citylimit: city ? 'true' : 'false',
        offset: limit,
        page: 1,
        extensions: 'all',
      },
      timeout: 5000,
    });

    if (response.data.status !== '1') {
      throw new Error(response.data.info || '搜索失败');
    }

    logger.info({
      module: 'map-service',
      operate: 'search-places',
      params: { keyword, city, resultCount: (response.data.pois || []).length },
      requestId,
      result: 'Search places success',
    });

    return (response.data.pois || []).map((poi) => ({
      name: poi.name,
      address: poi.address || poi.pname + poi.cityname + poi.adname,
      latitude: poi.location ? parseFloat(poi.location.split(',')[1]) : null,
      longitude: poi.location ? parseFloat(poi.location.split(',')[0]) : null,
      city: poi.cityname || city || '',
      district: poi.adname || '',
      distance: poi.distance ? parseInt(poi.distance) : null,
    }));
  } catch (error) {
    logger.error({
      module: 'map-service',
      operate: 'search-places',
      params: { keyword, city },
      requestId,
      error: error.message,
      errorType: error.name || 'MapApiError',
    });
    return generateMockPlaces(keyword, city, limit);
  }
}

/**
 * 函数功能：逆地理编码（坐标转地址）
 * 入参：latitude（数字，纬度）、longitude（数字，经度）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - 地址信息对象
 */
async function reverseGeocode(latitude, longitude, requestId = '') {
  if (!AMAP_KEY) {
    logger.warn({
      module: 'map-service',
      operate: 'reverse-geocode',
      requestId,
      result: 'AMAP_KEY not configured, returning default address',
    });
    return {
      address: '未知地址',
      city: '',
      district: '',
    };
  }

  try {
    const response = await axios.get(`${AMAP_BASE_URL}/geocode/regeo`, {
      params: {
        key: AMAP_KEY,
        location: `${longitude},${latitude}`,
        extensions: 'all',
      },
      timeout: 5000,
    });

    if (response.data.status !== '1') {
      throw new Error(response.data.info || '逆地理编码失败');
    }

    const regeocode = response.data.regeocode || {};
    const addressComponent = regeocode.addressComponent || {};

    logger.info({
      module: 'map-service',
      operate: 'reverse-geocode',
      params: { latitude, longitude },
      requestId,
      result: 'Reverse geocode success',
    });

    return {
      address: regeocode.formatted_address || '',
      city: addressComponent.city || addressComponent.province || '',
      district: addressComponent.district || '',
      province: addressComponent.province || '',
      street: addressComponent.streetNumber?.street || '',
      streetNumber: addressComponent.streetNumber?.number || '',
    };
  } catch (error) {
    logger.error({
      module: 'map-service',
      operate: 'reverse-geocode',
      params: { latitude, longitude },
      requestId,
      error: error.message,
      errorType: error.name || 'MapApiError',
    });
    return {
      address: '未知地址',
      city: '',
      district: '',
    };
  }
}

/**
 * 函数功能：路线规划（驾车）
 * 入参：originLng（数字，起点经度）、originLat（数字，起点纬度）、destLng（数字，终点经度）、destLat（数字，终点纬度）、requestId（字符串，链路追踪ID）
 * 出参：Promise<Object> - 路线信息对象（含距离、时长、路径坐标）
 */
async function getDrivingRoute(originLng, originLat, destLng, destLat, requestId = '') {
  if (!AMAP_KEY) {
    const distance = calculateStraightDistance(originLat, originLng, destLat, destLng);
    const duration = distance / 500;
    logger.warn({
      module: 'map-service',
      operate: 'get-driving-route',
      requestId,
      result: 'AMAP_KEY not configured, returning straight line distance',
    });
    return {
      distance: Math.round(distance),
      duration: Math.round(duration),
      routePath: [],
    };
  }

  try {
    const response = await axios.get(`${AMAP_BASE_URL}/direction/driving`, {
      params: {
        key: AMAP_KEY,
        origin: `${originLng},${originLat}`,
        destination: `${destLng},${destLat}`,
        extensions: 'all',
      },
      timeout: 5000,
    });

    if (response.data.status !== '1') {
      throw new Error(response.data.info || '路线规划失败');
    }

    const route = response.data.route || {};
    const path = route.paths?.[0] || {};

    logger.info({
      module: 'map-service',
      operate: 'get-driving-route',
      params: { originLng, originLat, destLng, destLat },
      requestId,
      result: `Route planned, distance: ${path.distance}m`,
    });

    return {
      distance: parseInt(path.distance) || 0,
      duration: parseInt(path.duration) || 0,
      routePath: path.steps?.flatMap((step) =>
        step.polyline?.split(';').map((point) => {
          const [lng, lat] = point.split(',');
          return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        }) || []
      ) || [],
      tolls: parseInt(path.tolls) || 0,
      tollDistance: parseInt(path.toll_distance) || 0,
    };
  } catch (error) {
    logger.error({
      module: 'map-service',
      operate: 'get-driving-route',
      params: { originLng, originLat, destLng, destLat },
      requestId,
      error: error.message,
      errorType: error.name || 'MapApiError',
    });
    const distance = calculateStraightDistance(originLat, originLng, destLat, destLng);
    return {
      distance: Math.round(distance),
      duration: Math.round(distance / 500),
      routePath: [],
    };
  }
}

/**
 * 函数功能：计算两点间直线距离（Haversine 公式）
 * 入参：lat1（数字，起点纬度）、lng1（数字，起点经度）、lat2（数字，终点纬度）、lng2（数字，终点经度）
 * 出参：number - 距离（米）
 */
function calculateStraightDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 函数功能：角度转弧度
 * 入参：deg（数字，角度值）
 * 出参：number - 弧度值
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 函数功能：生成模拟地点数据
 * 入参：keyword（字符串，搜索关键字）、city（字符串，城市名）、limit（数字，返回数量上限）
 * 出参：Array - 模拟地点列表
 */
function generateMockPlaces(keyword, city, limit) {
  const baseLat = 39.9042;
  const baseLng = 116.4074;
  const places = [];

  for (let i = 0; i < Math.min(limit, 5); i++) {
    places.push({
      name: `${keyword}示例地点${i + 1}`,
      address: `${city || '北京市'}朝阳区${keyword}路${i + 1}号`,
      latitude: baseLat + (Math.random() - 0.5) * 0.1,
      longitude: baseLng + (Math.random() - 0.5) * 0.1,
      city: city || '北京市',
      district: '朝阳区',
      distance: Math.round(Math.random() * 5000),
    });
  }

  return places;
}

module.exports = {
  searchPlaces,
  reverseGeocode,
  getDrivingRoute,
  calculateStraightDistance,
};
