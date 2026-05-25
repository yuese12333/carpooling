/**
 * @file edit-vehicle-api.ts
 * @description 车辆信息编辑相关接口封装，支持链路追踪与规范化日志记录
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';
import { MOCK_VEHICLES } from '@/store/mock-vehicle-data';

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

const EMPTY_VEHICLE_FORM: VehicleInfo = {
    brand: "",
    model: "",
    plate: "",
    color: "",
    seats: "5",
    isNonSmoking: true,
    hasAirConditioner: true,
    isDefault: false,
};

const mapListItemToForm = (vehicle: (typeof MOCK_VEHICLES)[number]): VehicleInfo => ({
    brand: vehicle.brand,
    model: vehicle.model,
    plate: vehicle.plate,
    color: vehicle.color,
    seats: String(vehicle.seats),
    isNonSmoking: vehicle.tags.includes('禁烟'),
    hasAirConditioner: true,
    isDefault: vehicle.isDefault,
    vehicleImageUrl: vehicle.image || '',
});

/** Mock 上传占位：空字符串由 UI 层展示本地占位图 */
export const MOCK_ASSETS = {
    VEHICLE_DEFAULT: '',
    USER_AVATAR: '',
};

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
    syncRequestId(requestId);
    const isMock = useEnvStore.getState().isMockMode;

    if (isMock) {
        if (vehicleId === 'new') {
            return { success: true, message: "Mock 成功", data: { ...EMPTY_VEHICLE_FORM } };
        }

        const matched =
            MOCK_VEHICLES.find((v) => v.id === vehicleId) ??
            (vehicleId === 'current' ? MOCK_VEHICLES.find((v) => v.isDefault) : undefined);

        const data = matched ? mapListItemToForm(matched) : MOCK_VEHICLE_DATA;

        logger.info({
            module: MODULE_NAME,
            operate: 'getVehicleDetail_MOCK',
            params: { vehicleId },
            result: 'Mock 成功',
            requestId,
        });
        return { success: true, message: "Mock 成功", data };
    }

    // 发起请求，底层 request 会自动处理 HTTP 错误并 Resolve 结果
    const result = await request.get<any, ApiResponse<VehicleInfo>>(`/vehicles/${vehicleId}`);

    // 仅在业务成功时记录成功日志
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getVehicleDetail_Success',
            params: { vehicleId },
            result: '数据获取成功',
            requestId
        });
    }

    return result;
};

/**
 * 更新车辆信息
 * @param data 车辆信息对象
 * @param requestId 链路追踪 ID
 */
export const updateVehicleInfo = async (
    vehicleId: string,
    data: VehicleInfo,
    requestId: string
): Promise<ApiResponse<undefined>> => {
    syncRequestId(requestId);
    const isMock = useEnvStore.getState().isMockMode;

    if (isMock) {
        await mockDelay(MOCK_DELAY_MS.LONG);
        logger.info({
            module: MODULE_NAME,
            operate: 'updateVehicleInfo_MOCK',
            params: { vehicleId, ...data },
            result: 'Mock 修改成功',
            requestId
        });
        return { success: true, message: "Mock 修改成功", data: undefined };
    }

    const result = await request.post<any, ApiResponse<undefined>>(`/vehicles/${vehicleId}/update`, data);

    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'updateVehicleInfo_Success',
            params: { vehicleId, ...data },
            result: '修改成功',
            requestId
        });
    }

    return result;
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
    syncRequestId(requestId);
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
            data: { url: MOCK_ASSETS.VEHICLE_DEFAULT }
        };
    }

    const result = await request.post<any, ApiResponse<{ url: string }>>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'uploadVehiclePhoto_Success',
            params: { info: 'FormData Upload' },
            result: '上传成功',
            requestId
        });
    }

    return result;
};