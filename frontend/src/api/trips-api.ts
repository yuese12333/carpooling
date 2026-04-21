/**
 * @file trips-api.ts
 * @description 行程管理模块 API 请求封装。
 */

import axios from 'axios';
import logger from '@/utils/logger';

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
    baseURL: process.env.API_BASE_URL ?? '/api',
    timeout: 10000,
});

// --- API 请求函数 ---

export const tripsApi = {
    /**
     * 分页获取行程列表
     * @param params 包含角色、状态及分页信息
     * @param requestId 显式注入的链路请求ID
     */
    getList: async (
        params: {
            role?: string;
            status?: string;
            page: number;
            pageSize: number;
        },
        requestId: string
    ): Promise<TripListResponse> => {
        try {
            const response = await apiClient.get<TripListResponse>('/trips/list', {
                params,
                headers: { 'X-Request-Id': requestId } // 显式注入请求头
            });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getList',
                params: params ?? undefined,
                result: undefined,
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
     * @param requestId 显式注入的链路请求ID
     * @param reason 取消原因
     */
    cancelTrip: async (tripId: string, requestId: string, reason?: string): Promise<void> => {
        const params = { tripId, reason: reason ?? undefined };
        try {
            await apiClient.post('/trips/cancel', params, {
                headers: { 'X-Request-Id': requestId }
            });
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'cancelTrip',
                params,
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_EXECUTE_ERROR',
                requestId,
            });
            throw error;
        }
    },

    /**
     * 提交行程评价
     * @param data 评价详情
     * @param requestId 显式注入的链路请求ID
     */
    rateTrip: async (data: RateTripParams, requestId: string): Promise<void> => {
        try {
            await apiClient.post('/trips/rate', data, {
                headers: { 'X-Request-Id': requestId }
            });
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'rateTrip',
                params: { tripId: data.tripId, score: data.score }, // 仅记录非敏感字段
                result: undefined,
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
     * @param requestId 显式注入的链路请求ID
     */
    getRebookTemplate: async (tripId: string, requestId: string): Promise<any> => {
        try {
            const response = await apiClient.get('/trips/template', {
                params: { tripId },
                headers: { 'X-Request-Id': requestId }
            });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getRebookTemplate',
                params: { tripId },
                result: undefined,
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
     * @param requestId 显式注入的链路请求ID
     */
    getContact: async (tripId: string, requestId: string): Promise<any> => {
        try {
            const response = await apiClient.get('/trips/contact', {
                params: { tripId },
                headers: { 'X-Request-Id': requestId }
            });
            return response.data;
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'getContact',
                params: { tripId },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_QUERY_ERROR',
                requestId,
            });
            throw error;
        }
    }
};