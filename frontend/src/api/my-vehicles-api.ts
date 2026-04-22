/**
 * @file my-vehicles-api.ts
 * @description 车辆管理模块接口封装，集成 Mock 自动切换与链路追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import { MOCK_VEHICLES } from '@/store/mock-vehicle-data';
import logger from '@/utils/logger';

// 基础响应结构
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

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
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        return { success: true, message: 'Mock Success', data: MOCK_VEHICLES };
    }

    try {
        const response = await request.get<ApiResponse<VehicleInfo[]>>('/api/v1/vehicles');
        return response.data;
    } catch (error: any) {
        logger.error({
            module: 'VehicleAPI',
            operate: 'getVehicleList',
            error: error?.message,
            errorType: 'NETWORK_ERROR',
            requestId
        });
        throw error;
    }
};

/**
 * 设置默认车辆
 * @param id 车辆ID
 * @param requestId 链路追踪ID
 */
export const setDefaultVehicleApi = async (id: string, requestId: string): Promise<ApiResponse> => {
    try {
        const response = await request.post<ApiResponse>(`/api/v1/vehicles/${id}/set-default`);
        return response.data;
    } catch (error: any) {
        logger.error({
            module: 'VehicleAPI',
            operate: 'setDefaultVehicle',
            params: { id },
            error: error?.message,
            requestId
        });
        throw error;
    }
};

/**
 * 删除车辆
 * @param id 车辆ID
 * @param requestId 链路追踪ID
 */
export const deleteVehicleApi = async (id: string, requestId: string): Promise<ApiResponse> => {
    try {
        const response = await request.delete<ApiResponse>(`/api/v1/vehicles/${id}`);
        return response.data;
    } catch (error: any) {
        logger.error({
            module: 'VehicleAPI',
            operate: 'deleteVehicle',
            params: { id },
            error: error?.message,
            requestId
        });
        throw error;
    }
};