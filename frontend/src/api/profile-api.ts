/**
 * @file profile-api.ts
 * @description 用户个人中心模块 API 封装。
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '@/utils/logger';

/**
 * 统一 API 响应结构体
 * @template T 业务数据类型
 */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/**
 * 用户基础信息接口数据定义
 */
export interface UserInfo {
    name: string;
    phone: string;
    avatar: string;
    memberSince: string;
    isVerified: boolean;
    trips: number;
    rating: number;
    accumulatedSavings: number;
}

/**
 * 车辆详情接口数据定义
 */
export interface CarDetail {
    brand: string;
    color: string;
    carPlate: string;
    seatCount: number;
    vehiclePhoto: string;
}

/**
 * 成就勋章条目定义
 */
export interface BadgeItem {
    emoji: string;
    label: string;
    unlocked: boolean;
}

// 实例化 API 客户端
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

/**
 * 内部统一日志记录器
 * @param operate 操作描述
 * @param error 错误对象
 * @param requestId 显式注入的链路追踪 ID
 * @param params 请求参数
 */
const logApiError = (operate: string, error: unknown, requestId: string, params?: Record<string, any>) => {
    logger.error({
        module: 'profile-api',
        operate,
        params: params || undefined,
        result: undefined,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof AxiosError ? 'NetworkError' : 'LogicError',
        requestId: requestId,
    });
};

export const profileApi = {
    /**
     * 8.1 获取用户中心基础信息
     * @param requestId 显式链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<UserInfo>>
     */
    getInfo: async (requestId: string, userId?: string) => {
        try {
            const response = await apiClient.get<ApiResponse<UserInfo>>('/profile/info', {
                params: { userId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-info', error, requestId, { userId });
            throw error;
        }
    },

    /**
     * 8.3 获取车辆详情
     * @param requestId 显式链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<CarDetail>>
     */
    getCar: async (requestId: string, userId?: string) => {
        try {
            const response = await apiClient.get<ApiResponse<CarDetail>>('/profile/car', {
                params: { userId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-car', error, requestId, { userId });
            throw error;
        }
    },

    /**
     * 8.5 获取成就勋章列表
     * @param requestId 显式链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<{ list: BadgeItem[] }>>
     */
    getBadges: async (requestId: string, userId?: string) => {
        try {
            const response = await apiClient.get<ApiResponse<{ list: BadgeItem[] }>>('/profile/badges', {
                params: { userId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-badges', error, requestId, { userId });
            throw error;
        }
    },

    /**
     * 8.11 退出登录
     * @param requestId 显式链路追踪 ID
     * @returns Promise<ApiResponse<{ success: boolean }>>
     */
    logout: async (requestId: string) => {
        try {
            const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/profile/logout');
            return response.data;
        } catch (error) {
            logApiError('logout', error, requestId);
            throw error;
        }
    },
};