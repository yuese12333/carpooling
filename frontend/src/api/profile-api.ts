/**
 * @file profile-api.ts
 * @description 用户个人中心模块 API 封装，集成环境切换与严谨链路追踪。
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { currentUser } from '@/store/mock-data';
import { badgeData } from '@/pages/profile/profile/profile-config';

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
    vehicleId?: string;
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

const getIsMock = (): boolean => useEnvStore.getState().isMockMode;

const mockUserInfo = (): UserInfo => ({
    name: currentUser.name,
    phone: currentUser.phone,
    avatar: currentUser.avatar,
    memberSince: currentUser.memberSince || '2024-01-01',
    isVerified: currentUser.verified ?? false,
    trips: currentUser.trips,
    rating: currentUser.rating,
    accumulatedSavings: currentUser.accumulatedSavings ?? 0,
});

const mockCarDetail = (): CarDetail => ({
    vehicleId: 'v1',
    brand: currentUser.car,
    color: currentUser.carColor,
    carPlate: currentUser.carPlate,
    seatCount: 5,
    vehiclePhoto: '',
});

export const profileApi = {
    getInfo: async (requestId: string, userId?: string): Promise<ApiResponse<UserInfo>> => {
        syncRequestId(requestId);
        if (getIsMock()) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: mockUserInfo(),
            };
        }

        const response = await request.get<any, ApiResponse<UserInfo>>('/profile/info', {
            params: { userId: userId || undefined },
        });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-info',
                params: { userId },
                result: 'Fetch user info success',
                requestId,
            });
        }

        return response;
    },

    getCar: async (requestId: string, userId?: string): Promise<ApiResponse<CarDetail>> => {
        syncRequestId(requestId);
        if (getIsMock()) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: mockCarDetail(),
            };
        }

        const response = await request.get<any, ApiResponse<CarDetail>>('/profile/car', {
            params: { userId: userId || undefined },
        });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-car',
                params: { userId },
                result: `Car: ${response.data?.carPlate || 'unknown'}`,
                requestId,
            });
        }

        return response;
    },

    getBadges: async (requestId: string, userId?: string): Promise<ApiResponse<{ list: BadgeItem[] }>> => {
        syncRequestId(requestId);
        if (getIsMock()) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: { list: badgeData },
            };
        }

        const response = await request.get<any, ApiResponse<{ list: BadgeItem[] }>>('/profile/badges', {
            params: { userId: userId || undefined },
        });

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'get-badges',
                params: { userId },
                result: `Badges count: ${response.data?.list?.length || 0}`,
                requestId,
            });
        }

        return response;
    },

    logout: async (requestId: string): Promise<ApiResponse<{ success: boolean }>> => {
        syncRequestId(requestId);

        if (getIsMock()) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: { success: true },
            };
        }

        const response = await request.post<any, ApiResponse<{ success: boolean }>>('/profile/logout', {});

        if (response.success) {
            logger.info({
                module: 'profile-api',
                operate: 'logout',
                params: {},
                result: 'Logout success',
                requestId,
            });
        }

        return response;
    },
};
