/**
 * @file my-vehicles-api.ts
 * @description 车辆管理模块接口封装，集成 Mock 自动切换与链路追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import { MOCK_VEHICLES } from '@/store/mock-vehicle-data';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

// 车辆信息实体
export interface VehicleInfo {
    id: string;
    brand: string;
    model: string;
    plate: string;
    color: string;
    seats: number;
    isDefault: boolean;
    status: 'verified' | 'pending' | 'rejected';
    tags: string[];
    image: string;
}

/**
 * 获取当前用户的车辆列表
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse<VehicleInfo[]>>
 */
export const getVehicleListApi = async (requestId: string): Promise<ApiResponse<VehicleInfo[]>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        return { success: true, message: 'Mock Success', data: MOCK_VEHICLES };
    }

    // --- 生产请求逻辑 ---
    // 底层 request 已统一 Resolve 标准 ApiResponse 对象，此处采用线性调用
    const result = await request.get<any, ApiResponse<VehicleInfo[]>>('/v1/vehicles');

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: 'VehicleAPI',
            operate: 'getVehicleList',
            result: 'Success',
            requestId
        });
    }

    return result;
};

/**
 * 设置默认车辆
 * @param id 车辆ID
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse>
 */
export const setDefaultVehicleApi = async (id: string, requestId: string): Promise<ApiResponse> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        return { success: true, code: 200, message: 'Mock Success', data: null };
    }

    const result = await request.post<any, ApiResponse>(`/v1/vehicles/${id}/set-default`);

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: 'VehicleAPI',
            operate: 'setDefaultVehicle',
            params: { id },
            result: 'Success',
            requestId
        });
    }

    return result;
};

/**
 * 删除车辆
 * @param id 车辆ID
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse>
 */
export const deleteVehicleApi = async (id: string, requestId: string): Promise<ApiResponse> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        return { success: true, code: 200, message: 'Mock Success', data: null };
    }

    const result = await request.post<any, ApiResponse>('/v1/vehicles/delete', { id });

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: 'VehicleAPI',
            operate: 'deleteVehicle',
            params: { id },
            result: 'Success',
            requestId
        });
    }

    return result;
};