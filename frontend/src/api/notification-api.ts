/**
 * @file notification-api.ts
 * @description 通知模块接口请求层，支持 Mock 模式与链路追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

// --- 类型定义 ---

/**
 * 通知项数据结构
 */
export interface NotificationItem {
    id: string;
    category: 'trip' | 'system';
    title: string;
    content: string;
    time: string;
    isRead: boolean;
    /** 图标映射类型 */
    type: 'success' | 'location' | 'warning';
}

// --- 模拟数据 (Mock Data) ---

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        category: 'trip',
        title: '支付成功',
        content: '您前往“静安寺地铁站”的行程已支付成功，金额 ￥45.50。',
        time: '10:35',
        isRead: false,
        type: 'success',
    },
    {
        id: '2',
        category: 'trip',
        title: '行程提醒',
        content: '司机师傅已到达预约地点“上海虹桥机场T2”，请尽快前往。',
        time: '09:20',
        isRead: true,
        type: 'location',
    },
    {
        id: '3',
        category: 'system',
        title: '账号安全提醒',
        content: '您的账号于今日 08:15 在新设备上登录，如非本人操作请及时修改密码。',
        time: '昨天',
        isRead: true,
        type: 'warning',
    },
];

// --- 接口函数 ---

/**
 * 获取通知列表
 * @param category 筛选分类：'all' | 'trip' | 'system'
 * @param requestId 显式传递的页面级链路追踪 ID
 * @returns Promise<ApiResponse<NotificationItem[]>>
 */
export const fetchNotifications = async (
    category: string,
    requestId: string
): Promise<ApiResponse<NotificationItem[]>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;
    const module = 'notification-api';
    const operate = 'getNotifications';

    // --- Mock 逻辑 ---
    if (isMockMode) {
        const data = category === 'all'
            ? MOCK_NOTIFICATIONS
            : MOCK_NOTIFICATIONS.filter((i) => i.category === category);

        return {
            success: true,
            message: 'success (mock)',
            data: data,
        };
    }

    // --- 线性请求逻辑 ---
    // 底层 request.ts 已统一处理 HTTP 错误并返回 Resolve 后的 ApiResponse
    const result = await request.get<any, ApiResponse<NotificationItem[]>>('/v1/notifications', {
        params: { category },
    });

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module,
            operate,
            params: { category },
            result: `Fetched ${result.data?.length || 0} items`,
            requestId,
        });
    }

    return result;
};

/**
 * 全部设为已读 / 删除通知
 * @param category 筛选分类
 * @param requestId 显式传递的页面级链路追踪 ID
 * @returns Promise<ApiResponse<null>>
 */
export const clearNotifications = async (
    category: string,
    requestId: string
): Promise<ApiResponse<null>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;
    const module = 'notification-api';
    const operate = 'clearNotifications';

    // --- Mock 逻辑 ---
    if (isMockMode) {
        logger.info({
            module,
            operate,
            params: { category, isMock: true },
            result: 'Cleared (Mock)',
            requestId,
        });
        return { success: true, message: 'Cleared (Mock)', data: null };
    }

    // --- 线性请求逻辑 ---
    const result = await request.post<any, ApiResponse<null>>('/v1/notifications/clear', { category });

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module,
            operate,
            params: { category },
            result: result.message,
            requestId,
        });
    }

    return result;
};