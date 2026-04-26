/**
 * @file trips-api.ts
 * @description 行程管理模块 API 请求封装。
 * @version 1.2.0 (Refactored: Linear logic without Try-Catch)
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';

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
export interface TripListData {
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

// --- API 请求函数 ---

export const tripsApi = {
    /**
     * 分页获取行程列表
     * @param params 包含角色、状态及分页信息
     * @param requestId 显式注入的链路请求ID
     * @returns {Promise<ApiResponse<TripListData>>}
     */
    getList: async (
        params: {
            role?: string;
            status?: string;
            page: number;
            pageSize: number;
        },
        requestId: string
    ): Promise<ApiResponse<TripListData>> => {
        const result = await request.get<any, ApiResponse<TripListData>>('/trips/list', {
            params,
        });

        // 仅在业务成功时记录日志，失败日志已由底层 request.ts 处理
        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'getList',
                params: params ?? undefined,
                result: 'Successfully retrieved trip list',
                requestId,
            });
        }

        return result;
    },

    /**
     * 取消指定行程
     * @param tripId 行程唯一ID
     * @param requestId 显式注入的链路请求ID
     * @param reason 取消原因
     * @returns {Promise<ApiResponse<null>>}
     */
    cancelTrip: async (tripId: string, requestId: string, reason?: string): Promise<ApiResponse<null>> => {
        const params = { tripId, reason: reason ?? undefined };

        const result = await request.post<any, ApiResponse<null>>('/trips/cancel', params);

        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'cancelTrip',
                params,
                result: 'Trip cancelled successfully',
                requestId,
            });
        }

        return result;
    },

    /**
     * 提交行程评价
     * @param data 评价详情
     * @param requestId 显式注入的链路请求ID
     * @returns {Promise<ApiResponse<null>>}
     */
    rateTrip: async (data: RateTripParams, requestId: string): Promise<ApiResponse<null>> => {
        const result = await request.post<any, ApiResponse<null>>('/trips/rate', data);

        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'rateTrip',
                params: { tripId: data.tripId, score: data.score }, // 仅记录非敏感字段
                result: 'Rating submitted successfully',
                requestId,
            });
        }

        return result;
    },

    /**
     * 获取再次预约的行程模板
     * @param tripId 原行程ID
     * @param requestId 显式注入的链路请求ID
     * @returns {Promise<ApiResponse<any>>}
     */
    getRebookTemplate: async (tripId: string, requestId: string): Promise<ApiResponse<any>> => {
        const result = await request.get<any, ApiResponse<any>>('/trips/template', {
            params: { tripId },
        });

        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'getRebookTemplate',
                params: { tripId },
                result: 'Rebook template retrieved',
                requestId,
            });
        }

        return result;
    },

    /**
     * 获取行程相关紧急联系人或司乘联系信息
     * @param tripId 行程唯一ID
     * @param requestId 显式注入的链路请求ID
     * @returns {Promise<ApiResponse<any>>}
     */
    getContact: async (tripId: string, requestId: string): Promise<ApiResponse<any>> => {
        const result = await request.get<any, ApiResponse<any>>('/trips/contact', {
            params: { tripId },
        });

        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'getContact',
                params: { tripId },
                result: 'Contact info retrieved',
                requestId,
            });
        }

        return result;
    }
};