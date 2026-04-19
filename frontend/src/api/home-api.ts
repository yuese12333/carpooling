/**
 * @file home-api.ts
 * @description 首页相关业务 API 接口定义与实现，包含用户信息、推荐行程及统计数据。
 */

import axios, { AxiosResponse } from 'axios';
import { mockRides, currentUser as mockUser } from "../store/mock-data";
import { useEnvStore } from '../store/env-store';
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

// --- 配置 ---
// 注意：建议生产环境通过 env 配置文件获取
const API_BASE_URL = 'https://your-api-domain.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// --- 辅助工具 ---

/**
 * 获取当前的链路 ID
 * @returns {string | undefined}
 */
const getContextRequestId = (): string | undefined => {
    return useEnvStore.getState().currentRequestId;
};

// --- 接口实现 ---

export const HomeService = {
    /**
     * 获取当前登录用户信息
     * @returns {Promise<UserInfo>}
     */
    getUserInfo: async (): Promise<UserInfo> => {
        const isMock = useEnvStore.getState().isMockMode;
        const requestId = getContextRequestId();

        try {
            if (isMock) {
                return {
                    name: mockUser.name,
                    avatar: mockUser.avatar,
                    level: 1,
                    verifiedStatus: true
                };
            }
            const res: AxiosResponse<ApiResponse<UserInfo>> = await api.get('/home/user-info');
            return res.data.data;
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getUserInfo',
                params: undefined,
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId
            });
            throw error;
        }
    },

    /**
     * 根据坐标获取推荐行程列表
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @returns {Promise<RideItem[]>}
     */
    getRecommendRides: async (lat: number, lng: number): Promise<RideItem[]> => {
        const isMock = useEnvStore.getState().isMockMode;
        const requestId = getContextRequestId();

        try {
            if (isMock) {
                // 移除 any 转换，通过显式映射确保类型安全
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
            const res: AxiosResponse<ApiResponse<{ list: RideItem[] }>> = await api.get('/rides/recommend', {
                params: { latitude: lat, longitude: lng, limit: 3 }
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
                requestId
            });
            throw error;
        }
    },

    /**
     * 获取全站今日统计数据
     * @returns {Promise<HomeStats>}
     */
    getStatistics: async (): Promise<HomeStats> => {
        const isMock = useEnvStore.getState().isMockMode;
        const requestId = getContextRequestId();

        try {
            if (isMock) {
                return { todayRidesCount: 12847, totalUsers: 48000, positiveRate: 98 };
            }
            const res: AxiosResponse<ApiResponse<HomeStats>> = await api.get('/home/statistics');
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
                params: undefined,
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId
            });
            throw error;
        }
    },

    /**
     * 获取用户未读通知状态
     * @returns {Promise<boolean>}
     */
    getUnreadStatus: async (): Promise<boolean> => {
        const isMock = useEnvStore.getState().isMockMode;
        const requestId = getContextRequestId();

        try {
            if (isMock) return true;
            const res: AxiosResponse<ApiResponse<{ hasUnread: boolean }>> = await api.get('/notifications/unread-status');
            return res.data.data.hasUnread;
        } catch (error) {
            logger.error({
                module: 'HomeService',
                operate: 'getUnreadStatus',
                params: undefined,
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_ERROR',
                requestId
            });
            throw error;
        }
    }
};