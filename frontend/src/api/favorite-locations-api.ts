/**
 * @file favorite-locations-api.ts
 * @description 常用地点模块接口封装，支持全链路追踪与标准化日志记录
 */

import axios from 'axios';
import logger from '@/utils/logger';

// --- 类型定义 ---

/**
 * 地点类型定义
 */
export interface LocationItem {
    id: string;
    type: 'home' | 'work' | 'other';
    label: string;
    address: string;
    isDefault?: boolean;
}

/**
 * API 调用通用配置
 * @property requestId - 必须从业务起点显式传递的链路追踪 ID
 */
interface ApiConfig {
    requestId: string;
}

// --- 模拟数据 (Mock Data) ---
const MOCK_LOCATIONS: LocationItem[] = [
    { id: '1', type: 'home', label: '家', address: '上海市浦东新区张江路 888 弄', isDefault: true },
    { id: '2', type: 'work', label: '公司', address: '上海市徐汇区虹梅路 1801 号凯科国际大厦' },
    { id: '3', type: 'other', label: '健身房', address: '上海市长宁区延安西路威尔士健身' },
];

// 生产环境应基于环境变量控制
const IS_MOCK = true;

/**
 * 获取地点列表
 * @param requestId - 业务流唯一请求 ID
 * @param query - 搜索关键字（可选）
 * @returns 过滤后的地点列表
 */
export const getLocationsApi = async (
    requestId: string,
    query?: string
): Promise<LocationItem[]> => {
    const moduleName = 'favorite-locations-api';
    const operateName = 'getLocationsApi';

    if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const filteredData = !query
            ? MOCK_LOCATIONS
            : MOCK_LOCATIONS.filter(l => l.label.includes(query) || l.address.includes(query));

        logger.info({
            module: moduleName,
            operate: operateName,
            params: { query },
            result: JSON.stringify(filteredData),
            requestId: requestId
        });
        return filteredData;
    }

    try {
        const response = await axios.get('/api/v1/locations', {
            params: { query },
            headers: { 'X-Request-Id': requestId } // 注入链路 ID
        });

        logger.info({
            module: moduleName,
            operate: operateName,
            params: { query },
            result: response.data,
            requestId: requestId
        });

        return response.data;
    } catch (error: any) {
        logger.error({
            module: moduleName,
            operate: operateName,
            params: { query },
            result: undefined,
            error: error.message,
            errorType: error.code || 'API_FETCH_ERROR',
            requestId: requestId
        });
        throw error;
    }
};

/**
 * 删除指定地点
 * @param requestId - 业务流唯一请求 ID
 * @param id - 地点 ID
 */
export const deleteLocationApi = async (
    requestId: string,
    id: string
): Promise<void> => {
    const moduleName = 'favorite-locations-api';
    const operateName = 'deleteLocationApi';

    if (IS_MOCK) {
        logger.info({
            module: moduleName,
            operate: operateName,
            params: { id },
            result: 'Mock delete success',
            requestId: requestId
        });
        return;
    }

    try {
        await axios.delete(`/api/v1/locations/${id}`, {
            headers: { 'X-Request-Id': requestId }
        });

        logger.info({
            module: moduleName,
            operate: operateName,
            params: { id },
            result: 'Success',
            requestId: requestId
        });
    } catch (error: any) {
        logger.error({
            module: moduleName,
            operate: operateName,
            params: { id },
            result: undefined,
            error: error.message,
            errorType: error.code || 'API_DELETE_ERROR',
            requestId: requestId
        });
        throw error;
    }
};