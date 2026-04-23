/**
 * @file edit-vehicle-api.ts
 * @description 车辆信息编辑相关接口封装，支持链路追踪与规范化日志记录
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

// --- 类型定义 ---

/**
 * 车辆信息基础数据结构
 */
export interface VehicleInfo {
    brand: string;
    model: string;
    plate: string;
    color: string;
    seats: string;
    isNonSmoking: boolean;
    hasAirConditioner: boolean;
    isDefault: boolean;
    vehicleImageUrl?: string;
}

/**
 * 统一 API 响应包装格式
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// --- Mock 数据配置 ---

const MOCK_VEHICLE_DATA: VehicleInfo = {
    brand: "大众",
    model: "帕萨特 2023款",
    plate: "沪A·88888",
    color: "极地白",
    seats: "5",
    isNonSmoking: true,
    hasAirConditioner: true,
    isDefault: true,
};

const MODULE_NAME = 'edit-vehicle-api';

// --- 接口函数 ---

/**
 * 获取指定车辆详情
 * @param vehicleId 车辆唯一标识
 * @param requestId 链路追踪 ID (必须由 UI 层 useMemo 生成后传入)
 */
export const getVehicleDetail = async (
    vehicleId: string,
    requestId: string
): Promise<ApiResponse<VehicleInfo>> => {
    const isMock = useEnvStore.getState().isMockMode;

    if (isMock) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getVehicleDetail_MOCK',
            params: { vehicleId },
            result: 'Mock 成功',
            requestId
        });
        return { success: true, message: "Mock 成功", data: MOCK_VEHICLE_DATA };
    }

    try {
        const response = await request.get<ApiResponse<VehicleInfo>>(`/v1/vehicles/${vehicleId}`);
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate: 'getVehicleDetail',
            params: { vehicleId },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_ERROR',
            requestId
        });
        throw error;
    }
};

/**
 * 更新车辆信息
 * @param data 车辆信息对象
 * @param requestId 链路追踪 ID
 */
export const updateVehicleInfo = async (
    data: VehicleInfo,
    requestId: string
): Promise<ApiResponse<undefined>> => {
    const isMock = useEnvStore.getState().isMockMode;

    if (isMock) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info({
            module: MODULE_NAME,
            operate: 'updateVehicleInfo_MOCK',
            params: { ...data },
            result: 'Mock 修改成功',
            requestId
        });
        return { success: true, message: "Mock 修改成功", data: undefined };
    }

    try {
        const response = await request.put<ApiResponse<undefined>>('/v1/vehicles/update', data);
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate: 'updateVehicleInfo',
            params: { ...data },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_ERROR',
            requestId
        });
        throw error;
    }
};

/**
 * 上传车辆照片
 * @param formData 包含文件数据的表单对象
 * @param requestId 链路追踪 ID
 */
export const uploadVehiclePhoto = async (
    formData: FormData,
    requestId: string
): Promise<ApiResponse<{ url: string }>> => {
    const isMock = useEnvStore.getState().isMockMode;

    if (isMock) {
        logger.info({
            module: MODULE_NAME,
            operate: 'uploadVehiclePhoto_MOCK',
            params: { info: 'FormData Upload' },
            result: 'Mock 上传成功',
            requestId
        });
        return {
            success: true,
            message: "Mock 上传成功",
            data: { url: "https://example.com/car.jpg" }
        };
    }

    try {
        const response = await request.post<ApiResponse<{ url: string }>>('/v1/common/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate: 'uploadVehiclePhoto',
            params: { info: 'FormData Upload' },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'UPLOAD_ERROR',
            requestId
        });
        throw error;
    }
};