/**
 * @file invite-friends-api.ts
 * @description 邀请好友业务模块接口定义及请求逻辑实现，包含 Mock 切换及链路追踪记录
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

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

/**
 * 全局统一 API 响应包装
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
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
 * @returns Promise<InviteInfoResponse>
 */
export const getInviteInfo = async (requestId: string): Promise<InviteInfoResponse | undefined> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    try {
        if (isMockMode) {
            logger.info({
                module: 'InviteFriends',
                operate: 'getInviteInfo_Mock',
                params: { requestId },
                result: 'Triggering mock data with 500ms delay',
                requestId
            });

            await new Promise(resolve => setTimeout(resolve, 500));
            return MOCK_INVITE_DATA;
        }

        const response = await request.get<ApiResponse<InviteInfoResponse>>('/api/v1/user/invite-info', {
            headers: { 'X-Request-Id': requestId }
        });

        // 记录成功日志
        logger.info({
            module: 'InviteFriends',
            operate: 'getInviteInfo_Success',
            params: { requestId },
            result: 'Successfully fetched invite info',
            requestId
        });

        return response.data.data;
    } catch (error: unknown) {
        // 异常捕获与链路记录
        logger.error({
            module: 'InviteFriends',
            operate: 'getInviteInfo_Error',
            params: { requestId },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_ERROR',
            requestId
        });
        return undefined;
    }
};

/**
 * 记录分享行为（埋点或统计）
 * @param platform 分享平台标识
 * @param requestId 链路追踪ID
 */
export const trackShareAction = async (platform: string, requestId: string): Promise<void> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    try {
        if (isMockMode) {
            logger.info({
                module: 'InviteFriends',
                operate: 'trackShareAction_Mock',
                params: { platform, requestId },
                result: 'Mock mode: bypass trackShareAction',
                requestId
            });
            return;
        }

        await request.post<ApiResponse<null>>('/api/v1/user/track-share', { platform }, {
            headers: { 'X-Request-Id': requestId }
        });

        logger.info({
            module: 'InviteFriends',
            operate: 'trackShareAction_Success',
            params: { platform, requestId },
            result: 'Track share action successful',
            requestId
        });
    } catch (error: unknown) {
        logger.error({
            module: 'InviteFriends',
            operate: 'trackShareAction_Error',
            params: { platform, requestId },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'TRACKING_ERROR',
            requestId
        });
    }
};