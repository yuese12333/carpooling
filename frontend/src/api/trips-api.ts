/**
 * @file trips-api.ts
 * @description 行程管理模块 API 请求封装，包含订单列表、评价、模板获取等核心接口。
 */

import axios, { AxiosResponse } from 'axios';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

// --- 类型定义 ---

/** 司机基础信息 */
export interface DriverInfo {
    name: string;
    avatar: string;
    car: string;
    carPlate: string;
    rating: number;
}

/** 行程单项详情 */
export interface TripItem {
    tripId: string;
    rideId: string;
    role: 'passenger' | 'driver';
    status: 'upcoming' | 'completed' | 'cancelled';
    from: string;
    to: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    bookedSeats: number;
    isRated: boolean;
    driverInfo: DriverInfo;
}

/** 行程列表响应结构 */
export interface TripListResponse {
    list: TripItem[];
    total: number;
}

/** 评价提交数据结构 */
export interface RateTripParams {
    tripId: string;
    score: number;
    content?: string;
    tags?: string[];
}

// --- 模块配置 ---

const MODULE_NAME = 'trips-api';

const apiClient = axios.create({
    // 假设配置已集成至环境变量或全局config
    baseURL: process.env.API_BASE_URL || '/api',
    timeout: 10000,
});

// --- API 请求函数 ---

export const tripsApi = {
    /**
     * 分页获取行程列表
     * @param params 包含角色、状态及分页信息
     * @returns Promise<TripListResponse>
     */
    getList: async (params: {
        role?: string;
        status?: string;
        page: number;
        pageSize: number;
    }): Promise<TripListResponse> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            const response = await apiClient.get<TripListResponse>('/trips/list', { params });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getList',
                params,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_RESPONSE_ERROR',
                requestId,
            });
            throw error;
        }
    },

    /**
     * 取消指定行程
     * @param tripId 行程唯一ID
     * @param reason 取消原因
     * @returns Promise<void>
     */
    cancelTrip: async (tripId: string, reason?: string): Promise<void> => {
        const requestId = useEnvStore.getState().currentRequestId;
        const params = { tripId, reason };
        try {
            await apiClient.post('/trips/cancel', params);
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'cancelTrip',
                params,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_EXECUTE_ERROR',
                requestId,
            });
            throw error;
        }
    },

    /**
     * 提交行程评价
     * @param data 评价详情（分数、内容、标签）
     * @returns Promise<void>
     */
    rateTrip: async (data: RateTripParams): Promise<void> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            await apiClient.post('/trips/rate', data);
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'rateTrip',
                params: data as unknown as Record<string, unknown>,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_EXECUTE_ERROR',
                requestId,
            });
            throw error;
        }
    },

    /**
     * 获取再次预约的行程模板
     * @param tripId 原行程ID
     * @returns Promise<Partial<TripItem>>
     */
    getRebookTemplate: async (tripId: string): Promise<any> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            const response = await apiClient.get('/trips/template', { params: { tripId } });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getRebookTemplate',
                params: { tripId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_QUERY_ERROR',
                requestId,
            });
            throw error;
        }
    },

    /**
     * 获取行程相关紧急联系人或司乘联系信息
     * @param tripId 行程唯一ID
     * @returns Promise<any>
     */
    getContact: async (tripId: string): Promise<any> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            const response = await apiClient.get('/trips/contact', { params: { tripId } });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getContact',
                params: { tripId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_QUERY_ERROR',
                requestId,
            });
            throw error;
        }
    }
};