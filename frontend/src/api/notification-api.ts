/**
 * @file notification-api.ts
 * @description 通知模块接口请求层，支持 Mock 模式与链路追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

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

/**
 * 统一接口返回包装
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
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
        title: '安全提醒',
        content: '您的账号于新设备登录，若非本人操作请及时修改密码。',
        time: '昨天',
        isRead: true,
        type: 'warning',
    },
];

// --- 接口函数 ---

/**
 * 获取通知列表
 * @param category 筛选分类 (all | trip | system)
 * @param requestId 显式传递的页面级链路追踪 ID
 * @returns Promise<ApiResponse<NotificationItem[]>>
 */
export const fetchNotifications = async (
    category: string,
    requestId: string
): Promise<ApiResponse<NotificationItem[]>> => {
    const isMockMode = useEnvStore.getState().isMockMode;
    const module = 'notification-api';
    const operate = 'fetchNotifications';

    try {
        if (isMockMode) {
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 500));
            const filtered =
                category === 'all'
                    ? MOCK_NOTIFICATIONS
                    : MOCK_NOTIFICATIONS.filter((item) => item.category === category);

            logger.info({
                module,
                operate,
                params: { category, isMock: true },
                result: 'Success (Mock)',
                requestId,
            });

            return { success: true, message: 'Success (Mock)', data: filtered };
        }

        // 真实接口调用
        const response = await request.get<ApiResponse<NotificationItem[]>>('/v1/notifications', {
            params: { category },
            headers: { 'X-Request-Id': requestId }, // 注入链路 ID
        });

        logger.info({
            module,
            operate,
            params: { category },
            result: response.data.message,
            requestId,
        });

        return response.data;
    } catch (error: any) {
        logger.error({
            module,
            operate,
            params: { category },
            error: error?.message || 'Unknown Error',
            errorType: error?.code || 'FETCH_ERROR',
            requestId,
        });
        // 抛出异常或返回标准错误结构，确保调用方能感知
        throw error;
    }
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
    const isMockMode = useEnvStore.getState().isMockMode;
    const module = 'notification-api';
    const operate = 'clearNotifications';

    try {
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

        const response = await request.delete<ApiResponse<null>>('/v1/notifications', {
            data: { category },
            headers: { 'X-Request-Id': requestId },
        });

        logger.info({
            module,
            operate,
            params: { category },
            result: response.data.message,
            requestId,
        });

        return response.data;
    } catch (error: any) {
        logger.error({
            module,
            operate,
            params: { category },
            error: error?.message || 'Unknown Error',
            errorType: error?.code || 'DELETE_ERROR',
            requestId,
        });
        throw error;
    }
};