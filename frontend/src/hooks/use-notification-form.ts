/**
 * @file use-notification-form.ts
 * @description 通知页面业务逻辑 Hook，封装数据加载与清理逻辑，支持显式链路追踪
 */

import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, clearNotifications, NotificationItem } from "@/api/notification-api";
import logger from "@/utils/logger";

/**
 * 通知页面业务逻辑 Hook
 * @param requestId 显式传递的页面级链路追踪 ID
 * @returns 包含状态与操作方法的对象
 */
export const useNotification = (requestId: string) => {
    const [activeTab, setActiveTab] = useState<'all' | 'trip' | 'system'>('all');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const module = 'use-notification-hook';

    /**
     * 加载通知数据
     */
    const loadData = useCallback(async () => {
        const operate = 'loadData';
        setLoading(true);

        try {
            // 显式透传 requestId 至 API 层
            const res = await fetchNotifications(activeTab, requestId);

            if (res.success) {
                setNotifications(res.data);
                logger.info({
                    module,
                    operate,
                    params: { activeTab },
                    result: 'Data loaded successfully',
                    requestId
                });
            }
        } catch (error: any) {
            logger.error({
                module,
                operate,
                params: { activeTab },
                error: error?.message || 'Unknown fetch error',
                errorType: 'API_FETCH_FAILED',
                requestId
            });
            // 错误处理逻辑（如发送全局 Toast）应在此扩展
        } finally {
            setLoading(false);
        }
    }, [activeTab, requestId]);

    /**
     * 监听 Tab 切换，自动重新加载数据
     */
    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * 清空通知处理函数
     */
    const handleClear = async () => {
        const operate = 'handleClear';
        try {
            const res = await clearNotifications(activeTab, requestId);
            if (res.success) {
                setNotifications([]);
                logger.info({
                    module,
                    operate,
                    params: { activeTab },
                    result: 'Notifications cleared',
                    requestId
                });
            }
        } catch (error: any) {
            logger.error({
                module,
                operate,
                params: { activeTab },
                error: error?.message || 'Unknown clear error',
                errorType: 'API_CLEAR_FAILED',
                requestId
            });
        }
    };

    /**
     * 切换 Tab 的动作
     * @param value Tab 类型值
     */
    const handleTabChange = (value: string) => {
        const operate = 'handleTabChange';
        const nextTab = value as 'all' | 'trip' | 'system';

        logger.info({
            module,
            operate,
            params: { from: activeTab, to: nextTab },
            result: 'Tab changed',
            requestId
        });

        setActiveTab(nextTab);
    };

    // 暴露给 UI 层的所有状态和方法
    return {
        activeTab,
        notifications,
        loading,
        handleTabChange,
        handleClear,
        refresh: loadData,
    };
};