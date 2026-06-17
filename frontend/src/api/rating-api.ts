/**
 * @file rating-api.ts
 * @description 评价相关 API 模块
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

/** ----------------类型定义---------------- */

export interface RatingTag {
    id: string;
    label: string;
}

export interface Rating {
    ratingId: string;
    score: number;
    commentText: string | null;
    tags: string[] | null;
    createdAt: string;
    fromUser?: {
        userId: string;
        userName: string;
        avatarUrl: string | null;
    };
    order?: {
        fromCity: string;
        toCity: string;
        departAt: string;
    };
}

export interface RatingStats {
    totalRatings: number;
    avgScore: number;
    scoreDistribution: Record<number, number>;
}

export interface RatingListData {
    ratings: Rating[];
    total: number;
    page: number;
    pageSize: number;
    stats: RatingStats;
}

/** ----------------API 请求封装---------------- */
export const ratingApi = {
    /**
     * 获取评价标签
     */
    getTags: async (type?: 'driver' | 'passenger'): Promise<ApiResponse<{ tags: RatingTag[] }>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            const tags = type === 'driver'
                ? [
                    { id: 'safe', label: '驾驶安全' },
                    { id: 'punctual', label: '准时到达' },
                    { id: 'friendly', label: '态度友好' },
                ]
                : [
                    { id: 'polite', label: '礼貌待人' },
                    { id: 'punctual', label: '准时到达' },
                    { id: 'friendly', label: '沟通顺畅' },
                ];
            return { success: true, code: 200, message: 'success', data: { tags } };
        }

        const params = type ? `?type=${type}` : '';
        return request.get<any, ApiResponse<{ tags: RatingTag[] }>>(`/ratings/tags${params}`);
    },

    /**
     * 提交评价
     */
    submit: async (data: {
        orderId: string;
        toUserId: string;
        score: number;
        commentText?: string;
        tags?: string[];
    }): Promise<ApiResponse<{ ratingId: string; score: number; createdAt: string }>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: { ratingId: `rating_${Date.now()}`, score: data.score, createdAt: new Date().toISOString() },
            };
        }

        const result = await request.post<any, ApiResponse<{ ratingId: string; score: number; createdAt: string }>>(
            '/ratings',
            data
        );

        if (result.success) {
            logger.info({
                module: 'RatingApi',
                operate: 'submit',
                params: { orderId: data.orderId, score: data.score },
                result: 'Rating submitted',
                requestId,
            });
        }

        return result;
    },

    /**
     * 获取订单评价
     */
    getByOrder: async (orderId: string): Promise<ApiResponse<Rating[]>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: [
                    {
                        ratingId: 'rating_1',
                        score: 5,
                        commentText: '非常好的行程',
                        tags: ['safe', 'friendly'],
                        createdAt: new Date().toISOString(),
                        fromUser: { userId: 'u_1', userName: '测试用户', avatarUrl: null },
                    },
                ],
            };
        }

        return request.get<any, ApiResponse<Rating[]>>(`/ratings/order/${orderId}`);
    },

    /**
     * 获取用户评价列表
     */
    getByUser: async (userId: string, page = 1, pageSize = 10): Promise<ApiResponse<RatingListData>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: {
                    ratings: [],
                    total: 0,
                    page,
                    pageSize,
                    stats: { totalRatings: 0, avgScore: 0, scoreDistribution: {} },
                },
            };
        }

        return request.get<any, ApiResponse<RatingListData>>(
            `/ratings/user/${userId}?page=${page}&pageSize=${pageSize}`
        );
    },

    /**
     * 获取当前用户评分统计
     */
    getMyStats: async (): Promise<ApiResponse<RatingStats>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: { totalRatings: 12, avgScore: 4.8, scoreDistribution: { 5: 10, 4: 2 } },
            };
        }

        return request.get<any, ApiResponse<RatingStats>>('/ratings/stats');
    },
};
