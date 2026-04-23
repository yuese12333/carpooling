/**
 * @file use-vehicle-verification-form.ts
 * @description 车辆认证详情业务逻辑 Hook，封装数据加载、状态管理与链路追踪
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'expo-router';
import {
    getVehicleVerificationDetail,
    VehicleVerificationDetail
} from "@/api/vehicle-verification-api";
import logger from '@/utils/logger';

/**
 * 车辆认证详情业务逻辑 Hook
 * @param {string} requestId - 由页面级 useMemo 生成的唯一链路追踪 ID
 * @returns {object} 暴露给 UI 层的状态与操作接口
 */
export const useVehicleVerificationDetail = (requestId: string) => {
    const router = useRouter();

    // --- 状态管理 ---
    const [loading, setLoading] = useState<boolean>(true);
    // 规范要求：避免使用 null，统一使用 undefined
    const [detail, setDetail] = useState<VehicleVerificationDetail | undefined>(undefined);

    // --- 事件处理 ---
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    /**
     * 执行数据加载流程
     * 包含完整的异常捕获与结构化日志记录
     */
    const loadData = useCallback(async () => {
        const moduleName = 'VehicleVerificationHook';
        const operationName = 'loadData';

        try {
            setLoading(true);

            // 执行 API 调用，显式透传 requestId
            const res = await getVehicleVerificationDetail(requestId);

            if (res.success) {
                setDetail(res.data);
                logger.info({
                    module: moduleName,
                    operate: operationName,
                    params: { requestId },
                    result: 'Data loaded successfully',
                    requestId
                });
            } else {
                // 处理业务逻辑级别的失败
                logger.error({
                    module: moduleName,
                    operate: operationName,
                    params: { requestId },
                    error: res.message,
                    errorType: 'BUSINESS_ERROR',
                    requestId
                });
            }
        } catch (error: unknown) {
            // 捕获非预期的运行时错误
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            logger.error({
                module: moduleName,
                operate: operationName,
                params: { requestId },
                error: errorMsg,
                errorType: 'RUNTIME_EXCEPTION',
                requestId
            });
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    // --- 业务逻辑副作用 ---
    useEffect(() => {
        if (requestId) {
            loadData();
        }
    }, [requestId, loadData]);

    // 暴露给页面的接口
    return {
        loading,
        detail,
        handleBack,
        refreshData: loadData // 暴露刷新方法，供 UI 下拉刷新或重试使用
    };
};