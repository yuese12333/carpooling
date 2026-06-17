/**
 * @file home-api.ts
 * @description 首页相关业务 API 接口实现
 */

import { mockRides, currentUser as mockUser } from "../store/mock-data";
import { useEnvStore } from '@/store/env-store'; // 仅用于获取 isMockMode
import request from '@/utils/request';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

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

// --- 接口实现 ---

export const HomeService = {
    /**
     * 获取当前登录用户信息
     * @param {string} requestId - 显式注入的链路 ID
     */
    getUserInfo: async (requestId: string): Promise<ApiResponse<UserInfo>> => {
        syncRequestId(requestId);
        const isMock = useEnvStore.getState().isMockMode;

        if (isMock) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: {
                    name: mockUser.name,
                    avatar: mockUser.avatar,
                    level: 1,
                    verifiedStatus: true
                }
            };
        }

        // 线性调用：底层 request 已处理异常并返回标准的 ApiResponse 对象
        const result = await request.get<any, ApiResponse<UserInfo>>('/home/user-info');

        // 仅在业务成功时记录日志
        if (result.success) {
            logger.info({
                module: 'HomeService',
                operate: 'getUserInfo_Success',
                params: { requestId },
                result: 'User info fetched',
                requestId: requestId
            });
        }

        return result;
    },

    /**
     * 根据坐标获取推荐行程列表
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @param {string} requestId - 显式注入的链路 ID
     */
    getRecommendRides: async (lat: number, lng: number, requestId: string): Promise<ApiResponse<RideItem[]>> => {
        syncRequestId(requestId);
        const isMock = useEnvStore.getState().isMockMode;

        if (isMock) {
            const mockData = mockRides.map(r => ({
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
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: mockData
            };
        }

        const result = await request.get<any, ApiResponse<{ list: RideItem[] }>>('/rides/recommend', {
            params: { latitude: lat, longitude: lng, limit: 3 },
        });

        // 转换数据结构以匹配 ApiResponse<RideItem[]>
        const formattedResult: ApiResponse<RideItem[]> = {
            ...result,
            data: result.data?.list ?? []
        };

        if (formattedResult.success) {
            logger.info({
                module: 'HomeService',
                operate: 'getRecommendRides_Success',
                params: { lat, lng },
                result: `Fetched ${formattedResult.data?.length} rides`,
                requestId: requestId
            });
        }

        return formattedResult;
    },

    /**
     * 获取全站今日统计数据
     * @param {string} requestId - 显式注入的链路 ID
     */
    getStatistics: async (requestId: string): Promise<ApiResponse<HomeStats>> => {
        syncRequestId(requestId);
        const isMock = useEnvStore.getState().isMockMode;

        if (isMock) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: { todayRidesCount: 12847, totalUsers: 48000, positiveRate: 98 }
            };
        }

        const result = await request.get<any, ApiResponse<HomeStats>>('/home/statistics');

        if (result.success) {
            logger.info({
                module: 'HomeService',
                operate: 'getStatistics_Success',
                params: { requestId },
                result: 'Statistics updated',
                requestId: requestId
            });
        }

        return result;
    },

    /**
     * 获取用户未读通知状态
     * @param {string} requestId - 显式注入的链路 ID
     */
    getUnreadStatus: async (requestId: string): Promise<ApiResponse<{ hasUnread: boolean }>> => {
        syncRequestId(requestId);
        const isMock = useEnvStore.getState().isMockMode;

        if (isMock) {
            return {
                success: true,
                code: 200,
                message: 'Mock Success',
                data: { hasUnread: true }
            };
        }

        const result = await request.get<any, ApiResponse<{ hasUnread: boolean }>>('/notifications/unread-status');

        if (result.success) {
            logger.info({
                module: 'HomeService',
                operate: 'getUnreadStatus_Success',
                params: { requestId },
                result: `Unread status: ${result.data?.hasUnread}`,
                requestId: requestId
            });
        }

        return result;
    }
};