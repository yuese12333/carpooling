/**
 * @file payment-history-api.ts
 * @description 支付历史与财务统计相关 API 接口定义，集成 Mock 切换机制与全链路日志追踪
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import { AxiosResponse } from 'axios';

/** 基础响应结构 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

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
    { id: "PAY-002", type: "refund", status: "refunded", title: "五角场 -> 陆家嘴 (行程取消)", amount: 12.0, date: "2024-05-19 09:15", method: "余额账户", category: "退款" },
    { id: "PAY-003", type: "payment", status: "completed", title: "杭州东站 -> 西湖景区", amount: 88.2, date: "2024-05-18 18:45", method: "Visa (**** 4242)", category: "拼车行程" },
    { id: "PAY-004", type: "payment", status: "pending", title: "北京南站 -> 朝阳公园", amount: 62.0, date: "2024-05-15 11:00", method: "支付宝", category: "拼车行程" }
];

const MOCK_STATS: MonthlyStats = {
    totalExpense: 1284.50,
    month: "2024年5月"
};

/**
 * 获取支付历史列表
 * @param params 筛选参数 { type, status }
 * @param requestId 显式传递的链路追踪 ID
 * @returns Promise<AxiosResponse<ApiResponse<PaymentRecord[]>>>
 */
export const getPaymentHistory = async (
    params?: { type?: string; status?: string[] },
    requestId?: string
): Promise<AxiosResponse<ApiResponse<PaymentRecord[]>>> => {
    const moduleName = 'PaymentAPI';
    const operateName = 'getPaymentHistory';

    try {
        // Mock 模式逻辑
        if (useEnvStore.getState().isMockMode) {
            logger.info({
                module: moduleName,
                operate: `${operateName}_MOCK`,
                params: params || undefined,
                requestId,
                result: 'Returning mock data'
            });
            return {
                data: { success: true, message: "success", data: MOCK_HISTORY },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
        }

        // 真实请求逻辑
        const response = await request.get<ApiResponse<PaymentRecord[]>>('/payment/history', { params });

        logger.info({
            module: moduleName,
            operate: operateName,
            params: params || undefined,
            requestId,
            result: 'API request successful'
        });

        return response;
    } catch (error: any) {
        logger.error({
            module: moduleName,
            operate: operateName,
            params: params || undefined,
            requestId,
            error: error?.message || 'Unknown Error',
            errorType: error?.code || 'API_FAILURE',
            result: undefined
        });
        throw error;
    }
};

/**
 * 获取月度统计数据
 * @param requestId 显式传递的链路追踪 ID
 * @returns Promise<AxiosResponse<ApiResponse<MonthlyStats>>>
 */
export const getMonthlyStats = async (
    requestId?: string
): Promise<AxiosResponse<ApiResponse<MonthlyStats>>> => {
    const moduleName = 'PaymentAPI';
    const operateName = 'getMonthlyStats';

    try {
        if (useEnvStore.getState().isMockMode) {
            logger.info({
                module: moduleName,
                operate: `${operateName}_MOCK`,
                params: undefined,
                requestId,
                result: 'Returning mock stats'
            });
            return {
                data: { success: true, message: "success", data: MOCK_STATS },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
        }

        const response = await request.get<ApiResponse<MonthlyStats>>('/payment/stats/monthly');

        logger.info({
            module: moduleName,
            operate: operateName,
            params: undefined,
            requestId,
            result: 'API request successful'
        });

        return response;
    } catch (error: any) {
        logger.error({
            module: moduleName,
            operate: operateName,
            params: undefined,
            requestId,
            error: error?.message || 'Unknown Error',
            errorType: error?.code || 'API_FAILURE',
            result: undefined
        });
        throw error;
    }
};