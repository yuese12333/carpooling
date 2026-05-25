/**
 * @file invite-friends-api.ts
 * @description 邀请好友业务模块接口定义及请求逻辑实现，包含 Mock 切换及链路追踪记录
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

// --- 类型定义 ---

/**
 * 邀请统计数据结构
 */
export interface InviteStats {
    successCount: number;    // 成功邀请人数
    totalReward: number;     // 累计奖励金额
    pendingCoupons: number;  // 待领取券数量
}

/**
 * 邀请页面初始化响应数据
 */
export interface InviteInfoResponse {
    inviteCode: string;
    stats: InviteStats;
}

// --- Mock 数据 ---

const MOCK_INVITE_DATA: InviteInfoResponse = {
    inviteCode: "CP8821",
    stats: {
        successCount: 12,
        totalReward: 120,
        pendingCoupons: 3
    }
};

// --- 接口函数 ---

/**
 * 获取邀请页面初始化数据
 * @param requestId 链路追踪ID，由页面级组件显式传递
 * @returns Promise<ApiResponse<InviteInfoResponse>>
 */
export const getInviteInfo = async (requestId: string): Promise<ApiResponse<InviteInfoResponse>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        logger.info({
            module: 'InviteFriends',
            operate: 'getInviteInfo_Mock',
            params: { requestId },
            result: 'Triggering mock data with 500ms delay',
            requestId
        });

        await mockDelay(MOCK_DELAY_MS.SHORT);
        return {
            success: true,
            code: 200,
            message: 'Mock Success',
            data: MOCK_INVITE_DATA
        };
    }

    // --- 线性请求逻辑 ---
    // 底层 request 始终返回 ApiResponse，不再需要 try-catch
    const result = await request.get<any, ApiResponse<InviteInfoResponse>>('/v1/user/invite-info');

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: 'InviteFriends',
            operate: 'getInviteInfo_Success',
            params: { requestId },
            result: 'Successfully fetched invite info',
            requestId
        });
    }

    return result;
};

/**
 * 记录分享行为（埋点或统计）
 * @param platform 分享平台标识
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse<null>>
 */
export const trackShareAction = async (platform: string, requestId: string): Promise<ApiResponse<null>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        logger.info({
            module: 'InviteFriends',
            operate: 'trackShareAction_Mock',
            params: { platform, requestId },
            result: 'Mock mode: bypass trackShareAction',
            requestId
        });
        return {
            success: true,
            code: 200,
            message: 'Mock Success',
            data: null
        };
    }

    // --- 线性请求逻辑 ---
    const result = await request.post<any, ApiResponse<null>>('/v1/user/track-share', { platform });

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: 'InviteFriends',
            operate: 'trackShareAction_Success',
            params: { platform, requestId },
            result: 'Track share action successful',
            requestId
        });
    }

    return result;
};