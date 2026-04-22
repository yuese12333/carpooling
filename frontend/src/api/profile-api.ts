/**
 * @file profile-api.ts
 * @description 用户个人中心模块 API 封装，集成环境切换与严谨链路追踪。
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import { AxiosError } from 'axios';

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

/**
 * 内部统一日志记录器
 * @param operate 操作描述
 * @param error 错误对象
 * @param requestId 显式注入的链路追踪 ID
 * @param params 请求参数
 */
const logApiError = (
    operate: string,
    error: unknown,
    requestId: string,
    params?: Record<string, any>,
) => {
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

/**
 * 获取当前是否处于 Mock 模式
 * @returns boolean
 */
const getIsMock = (): boolean => useEnvStore.getState().isMockMode;

export const profileApi = {
    /**
     * 8.1 获取用户中心基础信息
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<UserInfo>>
     */
    getInfo: async (requestId: string, userId?: string): Promise<ApiResponse<UserInfo>> => {
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/info' : '/profile/info';
        try {
            // 严格使用统一 request 实例，禁止自建 axios
            const response = await request.get<ApiResponse<UserInfo>>(url, {
                params: { userId: userId || undefined },
                headers: { 'X-Request-Id': requestId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-info', error, requestId, { userId, isMock });
            throw error;
        }
    },

    /**
     * 8.3 获取车辆详情
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<CarDetail>>
     */
    getCar: async (requestId: string, userId?: string): Promise<ApiResponse<CarDetail>> => {
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/car' : '/profile/car';
        try {
            const response = await request.get<ApiResponse<CarDetail>>(url, {
                params: { userId: userId || undefined },
                headers: { 'X-Request-Id': requestId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-car', error, requestId, { userId, isMock });
            throw error;
        }
    },

    /**
     * 8.5 获取成就勋章列表
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<{ list: BadgeItem[] }>>
     */
    getBadges: async (requestId: string, userId?: string): Promise<ApiResponse<{ list: BadgeItem[] }>> => {
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/badges' : '/profile/badges';
        try {
            const response = await request.get<ApiResponse<{ list: BadgeItem[] }>>(url, {
                params: { userId: userId || undefined },
                headers: { 'X-Request-Id': requestId },
            });
            return response.data;
        } catch (error) {
            logApiError('get-badges', error, requestId, { userId, isMock });
            throw error;
        }
    },

    /**
     * 8.11 退出登录
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @returns Promise<ApiResponse<{ success: boolean }>>
     */
    logout: async (requestId: string): Promise<ApiResponse<{ success: boolean }>> => {
        try {
            // 退出登录通常不走 Mock
            const response = await request.post<ApiResponse<{ success: boolean }>>('/profile/logout', {}, {
                headers: { 'X-Request-Id': requestId },
            });
            return response.data;
        } catch (error) {
            logApiError('logout', error, requestId);
            throw error;
        }
    },
};