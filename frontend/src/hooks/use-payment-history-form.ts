/**
 * @file use-payment-history-form.ts
 * @description 支付历史逻辑封装 Hook。要求显式注入 requestId 以维持链路追踪。
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    getPaymentHistory,
    getMonthlyStats,
    PaymentRecord,
    MonthlyStats,
    ApiResponse
} from '@/api/payment-history-api';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

/**
 * 支付历史业务逻辑 Hook
 * @param requestId 必须由页面层显式传递，严禁隐式读取
 */
export const usePaymentHistory = (requestId: string) => {
    // 状态定义
    const [activeTab, setActiveTab] = useState<"all" | "payments" | "refunds">("all");
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [historyList, setHistoryList] = useState<PaymentRecord[]>([]);
    // 规范：禁止使用 null，统一使用 undefined
    const [stats, setStats] = useState<MonthlyStats | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const isMockMode = useEnvStore((state) => state.isMockMode);

    const STATUS_MAP = {
        completed: { label: "已完成" },
        pending: { label: "进行中" },
        refunded: { label: "已退款" },
    };

    /**
     * 数据加载逻辑，包含完整的异常审计与追踪
     */
    const fetchData = useCallback(async () => {
        setLoading(true);
        const moduleName = 'PaymentHistoryHook';
        const operateName = 'fetchData';

        try {
            // 规范：参数化消费 requestId 并标注请求泛型
            const [historyRes, statsRes] = await Promise.all([
                getPaymentHistory({ type: activeTab, status: selectedStatus }, requestId),
                getMonthlyStats(requestId)
            ]);

            if (historyRes.data.success) {
                setHistoryList(historyRes.data.data);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            logger.info({
                module: moduleName,
                operate: operateName,
                params: { activeTab, selectedStatus, isMockMode },
                requestId,
                result: 'Fetch success'
            });
        } catch (error: any) {
            // 规范：禁止 console，统一结构记录错误日志
            logger.error({
                module: moduleName,
                operate: operateName,
                params: { activeTab, selectedStatus },
                requestId,
                error: error?.message || 'Unknown Error',
                errorType: error?.code || 'API_LOAD_FAILED',
                result: undefined
            });
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedStatus, isMockMode, requestId]);

    // 监听筛选条件与模式切换
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * 业务逻辑：数据过滤 (仅在 Mock 模式下生效)
     */
    const displayData = useMemo(() => {
        if (!isMockMode) return historyList;

        let result = [...historyList];
        if (activeTab === "refunds") result = result.filter(item => item.type === "refund");
        if (activeTab === "payments") result = result.filter(item => item.type === "payment");
        if (selectedStatus.length > 0) {
            result = result.filter(item => selectedStatus.includes(item.status));
        }
        return result;
    }, [historyList, activeTab, selectedStatus, isMockMode]);

    /**
     * 事件处理：切换状态过滤
     * @param status 状态值
     */
    const toggleStatus = (status: string) => {
        setSelectedStatus((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    /**
     * 事件处理：重置过滤
     */
    const resetFilters = () => {
        setSelectedStatus([]);
        logger.info({
            module: 'PaymentHistoryHook',
            operate: 'resetFilters',
            requestId
        });
    };

    return {
        activeTab,
        stats,
        loading,
        displayData,
        selectedStatus,
        statusMap: STATUS_MAP,
        setActiveTab,
        toggleStatus,
        resetFilters,
        refresh: fetchData
    };
};