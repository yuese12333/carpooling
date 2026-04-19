/**
 * @file offer-ride-api.ts
 * @description 拼车发布相关 API 封装，修复了 Record 索引签名与日志类型不匹配问题
 */

import axios, { AxiosError } from 'axios';
import { useEnvStore } from '@/store/env-store';
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
 * 修复索引签名报错：添加 [key: string]: any 确保兼容 Record<string, unknown>
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
    [key: string]: any; // 允许索引访问，解决类型分配问题
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

const getRequestId = () => useEnvStore.getState().currentRequestId;

/**
 * 安全地将错误转换为字符串，解决 logger 的 error 字段类型限制
 */
const formatError = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error || 'Unknown Error');
};

// --- API 函数 ---

/**
 * 6.2 初始化发布配置加载
 */
export const getPublishConfig = async (): Promise<StandardResponse<PublishConfigResponse>> => {
    const requestId = getRequestId();
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
                setTimeout(() => {
                    logger.info({
                        module: MODULE_NAME,
                        operate,
                        requestId,
                        // 使用 JSON.stringify 或确保 logger 接受对象
                        result: JSON.stringify(MOCK_CONFIG)
                    });
                    resolve(MOCK_CONFIG);
                }, 500);
            });
        }

        const response = await api.get<StandardResponse<PublishConfigResponse>>('/rides/publish-config');
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate,
            requestId,
            params: undefined,
            error: formatError(error),
            errorType: 'NETWORK_ERROR',
            result: (error as AxiosError).response?.data ? JSON.stringify((error as AxiosError).response?.data) : undefined
        });
        throw error;
    }
};

/**
 * 6.1 发布拼车行程
 */
export const publishRide = async (params: PublishRideParams): Promise<StandardResponse<{ rideId: string, status: string }>> => {
    const requestId = getRequestId();
    const operate = 'PUBLISH_RIDE';

    try {
        if (IS_MOCK_MODE) {
            const mockResult = {
                code: 200,
                data: { rideId: "mock_12345", status: "pending" }
            };
            return new Promise((resolve) => {
                setTimeout(() => {
                    logger.info({
                        module: MODULE_NAME,
                        operate,
                        params, // PublishRideParams 现在具备索引签名，可以分配给 Record
                        requestId,
                        result: JSON.stringify(mockResult)
                    });
                    resolve(mockResult);
                }, 1000);
            });
        }

        const response = await api.post<StandardResponse<{ rideId: string, status: string }>>('/rides/publish', params);

        logger.info({
            module: MODULE_NAME,
            operate,
            params,
            requestId,
            result: JSON.stringify(response.data)
        });

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        logger.error({
            module: MODULE_NAME,
            operate,
            params,
            requestId,
            error: formatError(error),
            errorType: 'API_BUSINESS_ERROR',
            result: axiosError.response?.data ? JSON.stringify(axiosError.response?.data) : undefined
        });
        throw error;
    }
};

/**
 * 6.4 发布权限校验
 */
export const checkPublishPermission = async (): Promise<StandardResponse<{ canPublish: boolean, creditScore: number }>> => {
    const requestId = getRequestId();
    const operate = 'CHECK_PERMISSION';

    try {
        if (IS_MOCK_MODE) {
            const mockData = { code: 200, data: { canPublish: true, creditScore: 99 } };
            logger.info({
                module: MODULE_NAME,
                operate,
                requestId,
                result: JSON.stringify(mockData)
            });
            return mockData;
        }

        const response = await api.get<StandardResponse<{ canPublish: boolean, creditScore: number }>>('/rides/publish-permission');
        return response.data;
    } catch (error) {
        logger.error({
            module: MODULE_NAME,
            operate,
            requestId,
            error: formatError(error),
            errorType: 'AUTH_ERROR',
            result: (error as AxiosError).response?.data ? JSON.stringify((error as AxiosError).response?.data) : undefined
        });
        throw error;
    }
};