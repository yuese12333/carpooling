/**
 * @file payment-history-api.ts
 * @description 支付历史与财务统计相关 API 接口定义，集成 Mock 切换机制与全链路日志追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

/** 支付记录类型 */
export interface PaymentRecord {
    id: string;
    type: 'payment' | 'refund';
    status: 'completed' | 'pending' | 'refunded';
    title: string;
    amount: number;
    date: string;
    method: string;
    category: string;
}

/** 月度统计类型 */
export interface MonthlyStats {
    totalExpense: number;
    month: string;
}

// --- 模拟数据 (Internal Mock Data) ---
const MOCK_HISTORY: PaymentRecord[] = [
    { id: "PAY-001", type: "payment", status: "completed", title: "虹桥机场 -> 静安寺", amount: 45.5, date: "2024-05-20 14:30", method: "微信支付", category: "拼车行程" },
    { id: "PAY-002", type: "refund", status: "refunded", title: "五角场 -> 陆家嘴 (行程取消)", amount: 12.0, date: "2024-05-18 09:15", method: "零钱支付", category: "拼车行程" },
    { id: "PAY-003", type: "payment", status: "completed", title: "会员月卡续费", amount: 25.0, date: "2024-05-01 10:00", method: "支付宝", category: "增值服务" },
];

const MOCK_STATS: MonthlyStats = {
    totalExpense: 1280.50,
    month: "2024-05"
};

// --- API 实现 ---

/**
 * 获取支付历史列表
 * @param page 页码
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse<PaymentRecord[]>>
 */
export const getPaymentHistory = async (
    params: { page?: number; type?: string; status?: string[] },
    requestId: string
): Promise<ApiResponse<PaymentRecord[]>> => {
    syncRequestId(requestId);
    const moduleName = 'PaymentAPI';
    const operateName = 'getPaymentHistory';
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        logger.info({
            module: moduleName,
            operate: `${operateName}_MOCK`,
            params: { page: params.page, type: params.type, status: params.status },
            requestId,
            result: 'Returning mock history'
        });
        return {
            success: true,
            code: 200,
            message: "success",
            data: MOCK_HISTORY
        };
    }

    // --- 线性请求逻辑 ---
    // 底层 request 已自动 Resolve 标准 ApiResponse，无需 try-catch
    const result = await request.get<any, ApiResponse<PaymentRecord[]>>('/payments/history', {
        params: { page: params.page, limit: 10 }
    });

    // 仅在业务成功时记录日志
    if (result.success) {
        logger.info({
            module: moduleName,
            operate: operateName,
            params: { page: params.page, type: params.type, status: params.status },
            requestId,
            result: 'API request successful'
        });
    }

    return result;
};

/**
 * 获取月度消费统计
 * @param requestId 链路追踪ID
 * @returns Promise<ApiResponse<MonthlyStats>>
 */
export const getMonthlyStats = async (
    requestId: string
): Promise<ApiResponse<MonthlyStats>> => {
    syncRequestId(requestId);
    const moduleName = 'PaymentAPI';
    const operateName = 'getMonthlyStats';
    const isMockMode = useEnvStore.getState().isMockMode;

    // --- Mock 模式逻辑 ---
    if (isMockMode) {
        logger.info({
            module: moduleName,
            operate: `${operateName}_MOCK`,
            params: undefined,
            requestId,
            result: 'Returning mock stats'
        });
        return {
            success: true,
            code: 200,
            message: "success",
            data: MOCK_STATS
        };
    }

    // --- 线性请求逻辑 ---
    const result = await request.get<any, ApiResponse<MonthlyStats>>('/payments/stats/monthly');

    // 仅在业务成功时记录日志
    if (result.success) {
        logger.info({
            module: moduleName,
            operate: operateName,
            params: undefined,
            requestId,
            result: 'API request successful'
        });
    }

    return result;
};