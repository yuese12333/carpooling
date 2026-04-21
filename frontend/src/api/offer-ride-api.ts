/**
 * @file offer-ride-api.ts
 * @description 拼车发布相关 API 封装。
 */

import axios, { AxiosError } from 'axios';
import logger from '@/utils/logger';

const IS_MOCK_MODE = process.env.NODE_ENV === 'development';
const BASE_URL = 'https://api.rideshare.com/api';
const MODULE_NAME = 'OFFER_RIDE_API';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

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
    presetTags: Array<{ label: string; value: string }>;
}

export interface StandardResponse<T> {
    code: number;
    data: T;
    message?: string;
}

// --- 工具函数 ---

/**
 * 安全地将错误转换为字符串，标准化错误输出
 */
const formatError = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error || 'Unknown Error');
};

// --- API 函数 (显式注入 requestId) ---

/**
 * 6.1 初始化发布配置加载
 * @param requestId 显式链路追踪 ID
 */
export const getPublishConfig = async (requestId: string): Promise<StandardResponse<PublishConfigResponse>> => {
    const operate = 'GET_PUBLISH_CONFIG';

    try {
        if (IS_MOCK_MODE) {
            const MOCK_CONFIG: StandardResponse<PublishConfigResponse> = {
                code: 200,
                data: {
                    timeSlots: ["08:00", "09:00", "18:00"],
                    seatLimit: { min: 1, max: 6 },
                    presetTags: [{ label: "车内禁烟", value: "no_smoking" }]
                }
            };
            return new Promise((resolve) => {
                setTimeout(() => resolve(MOCK_CONFIG), 300);
            });
        }

        const response = await api.get<StandardResponse<PublishConfigResponse>>('/rides/publish-config');
        return response.data;
    } catch (error) {
        // API 层仅保留关键异常日志，确保包含所有标准化字段
        logger.error({
            module: MODULE_NAME,
            operate,
            requestId,
            params: undefined,
            error: formatError(error),
            errorType: 'NETWORK_ERROR',
            result: (error as AxiosError).response?.data
                ? JSON.stringify((error as AxiosError).response?.data)
                : undefined // 规范：统一以 undefined 替代 null
        });
        throw error;
    }
};

/**
 * 6.2 发布拼车行程
 * @param params 发布参数
 * @param requestId 显式链路追踪 ID
 */
export const publishRide = async (
    params: PublishRideParams,
    requestId: string
): Promise<StandardResponse<{ rideId: string, status: string }>> => {
    const operate = 'PUBLISH_RIDE';

    try {
        if (IS_MOCK_MODE) {
            const mockResult = {
                code: 200,
                data: { rideId: "mock_12345", status: "pending" }
            };
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockResult), 500);
            });
        }

        const response = await api.post<StandardResponse<{ rideId: string, status: string }>>('/rides/publish', params);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        logger.error({
            module: MODULE_NAME,
            operate,
            requestId,
            params: { ...params, notes: '***' }, // 隐私保护：脱敏备注
            error: formatError(error),
            errorType: 'API_BUSINESS_ERROR',
            result: axiosError.response?.data ? JSON.stringify(axiosError.response?.data) : undefined
        });
        throw error;
    }
};

/**
 * 6.3 发布权限校验
 * @param requestId 显式链路追踪 ID
 */
export const checkPublishPermission = async (requestId: string): Promise<StandardResponse<{ canPublish: boolean, creditScore: number }>> => {
    const operate = 'CHECK_PERMISSION';

    try {
        if (IS_MOCK_MODE) {
            return { code: 200, data: { canPublish: true, creditScore: 99 } };
        }

        const response = await api.get<StandardResponse<{ canPublish: boolean, creditScore: number }>>('/rides/publish-permission');
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate,
            requestId,
            params: undefined,
            error: formatError(error),
            errorType: 'AUTH_ERROR',
            result: (error as AxiosError).response?.data
                ? JSON.stringify((error as AxiosError).response?.data)
                : undefined
        });
        throw error;
    }
};