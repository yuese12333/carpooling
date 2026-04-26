/**
 * @file profile-api.ts
 * @description 用户个人中心模块 API 封装，集成环境切换与严谨链路追踪。
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';

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
 * 获取当前是否处于 Mock 模式
 * @returns boolean
 */
const getIsMock = (): boolean => useEnvStore.getState().isMockMode;

/**
 * 更新全局链路追踪 ID
 * 遵循 PR #410/#432 规范：由 API 层同步 store，拦截器统一消费
 */
const syncRequestId = (id: string) => {
    useEnvStore.getState().setCurrentRequestId(id);
};

export const profileApi = {
    /**
     * 8.1 获取用户中心基础信息
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<UserInfo>>
     */
    getInfo: async (requestId: string, userId?: string): Promise<ApiResponse<UserInfo>> => {
        syncRequestId(requestId);
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/info' : '/profile/info';
        const params = { userId: userId || undefined };

        const response = await request.get<any, ApiResponse<UserInfo>>(url, { params });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-info',
                params: params as Record<string, unknown>,
                result: 'Fetch user info success',
                error: undefined,
                errorType: undefined,
                requestId: requestId,
            });
        }

        return response;
    },

    /**
     * 8.3 获取车辆详情
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<CarDetail>>
     */
    getCar: async (requestId: string, userId?: string): Promise<ApiResponse<CarDetail>> => {
        syncRequestId(requestId);
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/car' : '/profile/car';
        const params = { userId: userId || undefined };

        const response = await request.get<any, ApiResponse<CarDetail>>(url, { params });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-car',
                params: params as Record<string, unknown>,
                result: `Car: ${response.data?.carPlate || 'unknown'}`,
                error: undefined,
                errorType: undefined,
                requestId: requestId,
            });
        }

        return response;
    },

    /**
     * 8.5 获取成就勋章列表
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @param userId 用户唯一标识（可选）
     * @returns Promise<ApiResponse<{ list: BadgeItem[] }>>
     */
    getBadges: async (requestId: string, userId?: string): Promise<ApiResponse<{ list: BadgeItem[] }>> => {
        syncRequestId(requestId);
        const isMock = getIsMock();
        const url = isMock ? '/mock/profile/badges' : '/profile/badges';
        const params = { userId: userId || undefined };

        const response = await request.get<any, ApiResponse<{ list: BadgeItem[] }>>(url, { params });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-badges',
                params: params as Record<string, unknown>,
                result: `Badges count: ${response.data?.list?.length || 0}`,
                error: undefined,
                errorType: undefined,
                requestId: requestId,
            });
        }

        return response;
    },

    /**
     * 8.11 退出登录
     * @param requestId 页面级生命周期内唯一的链路追踪 ID
     * @returns Promise<ApiResponse<{ success: boolean }>>
     */
    logout: async (requestId: string): Promise<ApiResponse<{ success: boolean }>> => {
        syncRequestId(requestId);

        const response = await request.post<any, ApiResponse<{ success: boolean }>>('/profile/logout', {});

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'logout',
                params: {},
                result: 'Logout success',
                error: undefined,
                errorType: undefined,
                requestId: requestId,
            });
        }

        return response;
    },
};