/**
 * @file favorite-locations-api.ts
 * @description 常用地点模块接口封装。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

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
 * @returns {ApiResponse<LocationItem[]>} 过滤后的地点列表
 */
export const getLocationsApi = async (
    requestId: string,
    query?: string
): Promise<ApiResponse<LocationItem[]>> => {
    syncRequestId(requestId);
    const operateName = 'getLocationsApi';
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        await mockDelay(MOCK_DELAY_MS.SHORT);
        const isQueryEmpty = !query || query.trim() === '';
        const filteredData = isQueryEmpty
            ? MOCK_LOCATIONS
            : MOCK_LOCATIONS.filter(
                (l) => l.label.includes(query) || l.address.includes(query)
            );

        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { query },
            result: `count: ${filteredData.length}`,
            requestId: requestId,
        });

        // 统一返回包装格式，确保页面通过 res.data 能拿到数组
        return {
            code: 200,
            success: true,
            message: 'Mock Success',
            data: filteredData
        };
    }

    // --- 生产请求逻辑 ---
    // 移除 try-catch，底层 request 已处理 HTTP 异常并 Resolve ApiResponse
    const result = await request.get<any, ApiResponse<LocationItem[]>>('/locations', {
        params: { query },
    });

    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { query },
            result: `count: ${result.data?.length ?? 0}`,
            requestId: requestId,
        });
    }

    return result;
};

/**
 * 删除指定地点
 * @param requestId - 由页面级使用 useMemo 生成并显式传递的链路 ID
 * @param id - 地点唯一标识
 * @returns {Promise<ApiResponse<null>>}
 */
export const deleteLocationApi = async (
    requestId: string,
    id: string
): Promise<ApiResponse<null>> => {
    syncRequestId(requestId);
    const operateName = 'deleteLocationApi';
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { id },
            result: 'Mock delete success',
            requestId: requestId,
        });
        return { code: 200, success: true, message: 'Mock delete success', data: null };
    }

    // --- 生产请求逻辑 ---
    const result = await request.post<any, ApiResponse<null>>(`/locations/${id}/delete`);

    // 仅在业务成功时记录日志
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: operateName,
            params: { id },
            result: 'Success',
            requestId: requestId,
        });
    }

    return result;
};