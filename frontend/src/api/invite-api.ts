/**
 * @file invite-api.ts
 * @description 邀请码相关 API 模块
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

export interface InviteRecord {
    id: string;
    inviteeName: string;
    inviteeAvatar: string | null;
    rewardAmount: number;
    rewardStatus: string;
    createdAt: string;
}

export interface InviteStats {
    totalInvites: number;
    totalReward: number;
}

export const inviteApi = {
    /**
     * 获取我的邀请码
     */
    getMyCode: async (): Promise<ApiResponse<{ code: string; status: string; createdAt: string }>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: { code: 'ABC123', status: 'active', createdAt: new Date().toISOString() },
            };
        }
        return request.get('/invite/my-code');
    },

    /**
     * 使用邀请码
     */
    useCode: async (code: string): Promise<ApiResponse<{ success: boolean; inviterName: string; rewardAmount: number }>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: { success: true, inviterName: '好友', rewardAmount: 10 },
            };
        }
        return request.post('/invite/use', { code });
    },

    /**
     * 获取邀请记录
     */
    getHistory: async (page = 1, pageSize = 10): Promise<ApiResponse<{
        records: InviteRecord[];
        total: number;
        totalReward: number;
    }>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: 'success',
                data: {
                    records: [
                        { id: '1', inviteeName: '用户A', inviteeAvatar: null, rewardAmount: 10, rewardStatus: 'completed', createdAt: new Date().toISOString() },
                    ],
                    total: 1,
                    totalReward: 10,
                },
            };
        }
        return request.get(`/invite/history?page=${page}&pageSize=${pageSize}`);
    },

    /**
     * 获取邀请统计
     */
    getStats: async (): Promise<ApiResponse<InviteStats>> => {
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            return { success: true, code: 200, message: 'success', data: { totalInvites: 5, totalReward: 50 } };
        }
        return request.get('/invite/stats');
    },
};
