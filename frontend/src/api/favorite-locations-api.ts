/**
 * @file favorite-locations-api.ts
 * @description 常用地点模块接口封装。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

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
 * 模块常量定义
 */
const MODULE_NAME = 'favorite-locations-api';

// --- 模拟数据 (Mock Data) ---
const MOCK_LOCATIONS: LocationItem[] = [
    { id: '1', type: 'home', label: '家', address: '上海市浦东新区张江路 888 弄', isDefault: true },
    { id: '2', type: 'work', label: '公司', address: '上海市徐汇区虹梅路 1801 号凯科国际大厦' },
    { id: '3', type: 'other', label: '健身房', address: '上海市长宁区延安西路威尔士健身' },
];

/**
 * 获取地点列表
 * @param requestId - 由页面级使用 useMemo 生成并显式传递的链路 ID
 * @param query - 搜索关键字（可选）
 * @returns {Promise<LocationItem[]>} 过滤后的地点列表
 */
export const getLocationsApi = async (
    requestId: string,
    query?: string
): Promise<LocationItem[]> => {
    const operateName = 'getLocationsApi';
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const filteredData = !query
            ? MOCK_LOCATIONS
            : MOCK_LOCATIONS.filter(
                (l) => l.label.includes(query) || l.address.includes(query)
            );

        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { query },
            result: JSON.stringify(filteredData),
            requestId: requestId,
        });
        return filteredData;
    }

    // --- 生产请求逻辑 ---
    try {
        const { data } = await request.get<LocationItem[]>('/api/v1/locations', {
            params: { query },
            headers: { 'X-Request-Id': requestId },
        });

        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { query },
            result: JSON.stringify(data),
            requestId: requestId,
        });

        return data;
    } catch (error: any) {
        logger.error({
            module: MODULE_NAME,
            operate: operateName,
            params: { query },
            result: undefined,
            error: error.message,
            errorType: error.code || 'API_FETCH_ERROR',
            requestId: requestId,
        });
        throw error;
    }
};

/**
 * 删除指定地点
 * @param requestId - 由页面级使用 useMemo 生成并显式传递的链路 ID
 * @param id - 地点唯一标识
 * @returns {Promise<void>}
 */
export const deleteLocationApi = async (
    requestId: string,
    id: string
): Promise<void> => {
    const operateName = 'deleteLocationApi';
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { id },
            result: 'Mock delete success',
            requestId: requestId,
        });
        return;
    }

    try {
        await request.delete<void>(`/api/v1/locations/${id}`, {
            headers: { 'X-Request-Id': requestId },
        });

        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { id },
            result: 'Success',
            requestId: requestId,
        });
    } catch (error: any) {
        logger.error({
            module: MODULE_NAME,
            operate: operateName,
            params: { id },
            result: undefined,
            error: error.message,
            errorType: error.code || 'API_DELETE_ERROR',
            requestId: requestId,
        });
        throw error;
    }
};