/**
 * @file home-api.ts
 * @description 首页相关业务 API 接口实现
 */

import { mockRides, currentUser as mockUser } from "../store/mock-data";
import { useEnvStore } from '../store/env-store'; // 仅用于获取 isMockMode
import request from '../utils/request';
import logger from '@/utils/logger';

// --- 类型定义 ---

/** 用户基础信息 */
export interface UserInfo {
    name: string;
    avatar: string;
    level: number;
    verifiedStatus: boolean;
}

/** 行程条目信息 */
export interface RideItem {
    id: string;
    from: string;
    to: string;
    time: string;
    price: number;
    seatsLeft: number;
    driver: {
        name: string;
        avatar: string;
        rating: number;
        trips: number;
        verified: boolean;
    };
}

/** 首页全局统计指标 */
export interface HomeStats {
    todayRidesCount: number;
    totalUsers: number;
    positiveRate: number;
}

/** 通用 API 响应包裹结构 */
interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}

// --- 接口实现 ---

export const HomeService = {
    /**
     * 获取当前登录用户信息
     * @param {string} requestId - 显式注入的链路 ID
     */
    getUserInfo: async (requestId: string): Promise<UserInfo> => {
        const isMock = useEnvStore.getState().isMockMode;

        try {
            if (isMock) {
                return {
                    name: mockUser.name,
                    avatar: mockUser.avatar,
                    level: 1,
                    verifiedStatus: true
                };
            }
            const res = await request.get<ApiResponse<UserInfo>>('/home/user-info');
            return res.data.data;
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getUserInfo',
                params: { requestId }, // 记录触发参数
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId: requestId // 显式绑定
            });
            throw error;
        }
    },

    /**
     * 根据坐标获取推荐行程列表
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @param {string} requestId - 显式注入的链路 ID
     */
    getRecommendRides: async (lat: number, lng: number, requestId: string): Promise<RideItem[]> => {
        const isMock = useEnvStore.getState().isMockMode;

        try {
            if (isMock) {
                return mockRides.map(r => ({
                    id: String(r.id),
                    from: r.from,
                    to: r.to,
                    time: r.time,
                    price: r.price,
                    seatsLeft: r.seatsLeft,
                    driver: {
                        name: r.driver.name,
                        avatar: r.driver.avatar,
                        rating: r.driver.rating,
                        trips: r.driver.trips,
                        verified: r.driver.verified
                    }
                }));
            }
            const res = await request.get<ApiResponse<{ list: RideItem[] }>>('/rides/recommend', {
                params: { latitude: lat, longitude: lng, limit: 3 },
            });
            return res.data.data.list;
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getRecommendRides',
                params: { lat, lng },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId: requestId
            });
            throw error;
        }
    },

    /**
     * 获取全站今日统计数据
     * @param {string} requestId - 显式注入的链路 ID
     */
    getStatistics: async (requestId: string): Promise<HomeStats> => {
        const isMock = useEnvStore.getState().isMockMode;

        try {
            if (isMock) {
                return { todayRidesCount: 12847, totalUsers: 48000, positiveRate: 98 };
            }
            const res = await request.get<ApiResponse<HomeStats>>('/home/statistics');
            const d = res.data.data;
            return {
                todayRidesCount: d.todayRidesCount,
                totalUsers: d.totalUsers,
                positiveRate: d.positiveRate
            };
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getStatistics',
                params: { requestId },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId: requestId
            });
            throw error;
        }
    },

    /**
     * 获取用户未读通知状态
     * @param {string} requestId - 显式注入的链路 ID
     */
    getUnreadStatus: async (requestId: string): Promise<boolean> => {
        const isMock = useEnvStore.getState().isMockMode;

        try {
            if (isMock) return true;
            const res = await request.get<ApiResponse<{ hasUnread: boolean }>>('/notifications/unread-status');
            return res.data.data.hasUnread;
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getUnreadStatus',
                params: { requestId },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId: requestId
            });
            throw error;
        }
    }
};