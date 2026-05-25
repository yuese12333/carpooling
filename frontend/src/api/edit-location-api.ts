/**
 * @file edit-location-api.ts
 * @description 常用地点编辑模块接口封装。
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

// --- 类型定义 ---

export interface LocationDetail {
    id: string;
    label: string;
    address: string;
}

export interface UpdateLocationParams {
    id: string;
    label: string;
    address: string;
}

const MODULE_NAME = 'EditLocationApi';

// --- 接口实现 ---

/**
 * 更新地点信息
 * @param params 更新参数
 * @param requestId 链路追踪ID
 */
export const updateLocationApi = async (
    params: UpdateLocationParams,
    requestId: string
): Promise<ApiResponse<undefined>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 逻辑 ---
    if (isMockMode) {
        logger.info({
            module: MODULE_NAME,
            operate: 'updateLocation_Mock',
            params: { ...params },
            result: 'Triggering mock success',
            requestId
        });

        await mockDelay(MOCK_DELAY_MS.MEDIUM);
        return {
            success: true,
            code: 200,
            data: undefined,
            message: "更新成功"
        };
    }

    // --- 线性请求逻辑 ---
    // 底层 request.ts 已处理异常并返回标准的 ApiResponse 对象
    const result = await request.post<any, ApiResponse<undefined>>(`/locations/${params.id}/update`, {
        label: params.label,
        address: params.address,
    });

    // 仅在业务成功时记录日志
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'updateLocation_Success',
            params: { id: params.id },
            result: 'API response received',
            requestId
        });
    }

    return result;
};

/**
 * 获取地点详情
 * @param id 地点ID
 * @param requestId 链路追踪ID
 */
export const getLocationDetailApi = async (
    id: string,
    requestId: string
): Promise<ApiResponse<LocationDetail>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 逻辑 ---
    if (isMockMode) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getLocationDetail_Mock',
            params: { id },
            result: 'Return mock data',
            requestId
        });
        return {
            success: true,
            code: 200,
            data: MOCK_DETAIL,
            message: "success"
        };
    }

    // --- 线性请求逻辑 ---
    const result = await request.get<any, ApiResponse<LocationDetail>>(`/locations/${id}`);

    // 仅在业务成功时记录日志
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getLocationDetail_Success',
            params: { id },
            result: 'Detail fetched',
            requestId
        });
    }

    return result;
};

// --- Mock 数据 ---
const MOCK_DETAIL: LocationDetail = {
    id: "1",
    label: "演示地点",
    address: "北京市朝阳区某某大厦"
};