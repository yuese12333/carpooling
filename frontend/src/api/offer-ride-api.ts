/**
 * @file offer-ride-api.ts
 * @description 拼车发布相关 API 封装。
 */

import logger from '@/utils/logger';
import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

const MODULE_NAME = 'OFFER_RIDE_API';

// --- 类型定义 ---

/**
 * 拼车发布参数接口
 */
export interface PublishRideParams {
    from: string;
    to: string;
    stops?: string[];
    date: string;
    time: string;
    seats: number;
    price: number;
    notes?: string;
    isRecurring?: boolean;
    recurringRules?: {
        daysOfWeek: number[];
        endDate?: string;
    };
    [key: string]: any;
}

export interface PublishConfigResponse {
    timeSlots: string[];
    seatLimit: { min: number; max: number };
    presetTags: { label: string; value: string }[];
}

// --- API 函数 ---

/**
 * 6.1 获取发布配置（时间轴、座位限制等）
 * @param requestId 显式链路追踪 ID
 */
export const getPublishConfig = async (requestId: string): Promise<ApiResponse<PublishConfigResponse>> => {
    syncRequestId(requestId);
    const operate = 'FETCH_CONFIG';

    // Mock 模式逻辑
    if (useEnvStore.getState().isMockMode) {
        return {
            success: true,
            code: 200,
            message: 'Mock Success',
            data: {
                timeSlots: ["06:00", "08:00", "12:00", "18:00", "21:00"],
                seatLimit: { min: 1, max: 4 },
                presetTags: [
                    { label: "不抽烟", value: "no_smoking" },
                    { label: "有空调", value: "ac" }
                ]
            }
        };
    }

    // 线性请求：底层 request 已处理异常并返回标准的 ApiResponse 对象
    const result = await request.get<any, ApiResponse<PublishConfigResponse>>('/rides/publish-config');

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate,
            requestId,
            params: undefined,
            result: 'Config loaded successfully'
        });
    }

    return result;
};

/**
 * 6.2 提交发布行程
 * @param params 发布参数
 * @param requestId 显式链路追踪 ID
 */
export const publishRide = async (params: PublishRideParams, requestId: string): Promise<ApiResponse<{ rideId: string }>> => {
    syncRequestId(requestId);
    const operate = 'SUBMIT_RIDE';

    // Mock 模式逻辑
    if (useEnvStore.getState().isMockMode) {
        return {
            success: true,
            code: 200,
            message: 'Mock Success',
            data: { rideId: "mock_ride_888" }
        };
    }

    // 线性请求
    const result = await request.post<any, ApiResponse<{ rideId: string }>>('/rides/publish', params);

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate,
            requestId,
            params: { ...params, notes: '***' }, // 隐私保护：脱敏备注
            result: 'Ride published successfully'
        });
    }

    return result;
};

/**
 * 6.3 发布权限校验
 * @param requestId 显式链路追踪 ID
 */
export const checkPublishPermission = async (requestId: string): Promise<ApiResponse<{ canPublish: boolean, creditScore: number }>> => {
    syncRequestId(requestId);
    const operate = 'CHECK_PERMISSION';

    // Mock 模式逻辑
    if (useEnvStore.getState().isMockMode) {
        return {
            success: true,
            code: 200,
            message: 'Mock Success',
            data: { canPublish: true, creditScore: 99 }
        };
    }

    // 线性请求
    const result = await request.get<any, ApiResponse<{ canPublish: boolean, creditScore: number }>>('/rides/publish-permission');

    // 条件化日志记录
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate,
            requestId,
            params: undefined,
            result: `Permission checked: ${result.data?.canPublish}`
        });
    }

    return result;
};