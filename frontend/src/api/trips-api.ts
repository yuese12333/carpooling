/**
 * @file trips-api.ts
 * @description 行程管理模块 API 请求封装。
 * @version 1.3.0 (Added Mock mode support)
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { useEnvStore } from '@/store/env-store';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

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

// --- Mock 数据 ---

const MOCK_TRIP_LIST: TripListData = {
    list: [
        {
            tripId: 'trip_mock_001',
            rideId: 'ride_mock_001',
            role: 'passenger',
            status: 'upcoming',
            from: '北京市朝阳区望京SOHO',
            to: '北京市海淀区中关村软件园',
            date: '2026-06-16',
            time: '08:30',
            duration: '45分钟',
            price: 25,
            bookedSeats: 1,
            isRated: false,
            driverInfo: {
                name: '张师傅',
                avatar: '',
                car: '大众帕萨特',
                carPlate: '京A****88',
                rating: 4.9,
            },
        },
        {
            tripId: 'trip_mock_002',
            rideId: 'ride_mock_002',
            role: 'driver',
            status: 'completed',
            from: '北京市海淀区五道口',
            to: '北京市朝阳区国贸',
            date: '2026-06-14',
            time: '18:00',
            duration: '50分钟',
            price: 35,
            bookedSeats: 2,
            isRated: false,
            driverInfo: {
                name: '我',
                avatar: '',
                car: '我的车',
                carPlate: '京B****66',
                rating: 5.0,
            },
        },
    ],
    total: 2,
};

const MOCK_CONTACT = {
    driverPhone: '138****1234',
    passengerPhones: [
        { userId: 'u_001', userName: '乘客A', phone: '139****5678' },
    ],
};

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
        syncRequestId(requestId);
        const isMockMode = useEnvStore.getState().isMockMode;

        if (isMockMode) {
            await mockDelay(MOCK_DELAY_MS.LIST);
            logger.info({
                module: MODULE_NAME,
                operate: 'getList_MOCK',
                params,
                result: 'Mock trip list returned',
                requestId,
            });
            return { success: true, message: 'mock', data: MOCK_TRIP_LIST };
        }

        const result = await request.get<any, ApiResponse<TripListData>>('/trips', {
            params,
        });

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
        syncRequestId(requestId);
        const isMockMode = useEnvStore.getState().isMockMode;
        const params = { reason: reason ?? undefined };

        if (isMockMode) {
            await mockDelay(MOCK_DELAY_MS.ACTION);
            logger.info({
                module: MODULE_NAME,
                operate: 'cancelTrip_MOCK',
                params: { tripId },
                result: 'Trip cancelled (mock)',
                requestId,
            });
            return { success: true, message: 'mock', data: null };
        }

        const result = await request.post<any, ApiResponse<null>>(`/trips/${tripId}/cancel`, params);

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
        syncRequestId(requestId);
        const isMockMode = useEnvStore.getState().isMockMode;

        if (isMockMode) {
            await mockDelay(MOCK_DELAY_MS.ACTION);
            logger.info({
                module: MODULE_NAME,
                operate: 'rateTrip_MOCK',
                params: { tripId: data.tripId, score: data.score },
                result: 'Rating submitted (mock)',
                requestId,
            });
            return { success: true, message: 'mock', data: null };
        }

        const { tripId, ...rateBody } = data;
        const result = await request.post<any, ApiResponse<null>>(`/trips/${tripId}/rate`, rateBody);

        if (result.success) {
            logger.info({
                module: MODULE_NAME,
                operate: 'rateTrip',
                params: { tripId: data.tripId, score: data.score },
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
        syncRequestId(requestId);
        const isMockMode = useEnvStore.getState().isMockMode;

        if (isMockMode) {
            await mockDelay(MOCK_DELAY_MS.DETAIL);
            const mockTemplate = {
                origin: '北京市朝阳区望京SOHO',
                destination: '北京市海淀区中关村软件园',
                departureTime: '08:30',
            };
            logger.info({
                module: MODULE_NAME,
                operate: 'getRebookTemplate_MOCK',
                params: { tripId },
                result: 'Rebook template retrieved (mock)',
                requestId,
            });
            return { success: true, message: 'mock', data: mockTemplate };
        }

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
        syncRequestId(requestId);
        const isMockMode = useEnvStore.getState().isMockMode;

        if (isMockMode) {
            await mockDelay(MOCK_DELAY_MS.DETAIL);
            logger.info({
                module: MODULE_NAME,
                operate: 'getContact_MOCK',
                params: { tripId },
                result: 'Contact info retrieved (mock)',
                requestId,
            });
            return { success: true, message: 'mock', data: MOCK_CONTACT };
        }

        const result = await request.get<any, ApiResponse<any>>(`/trips/${tripId}/contact`);

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
