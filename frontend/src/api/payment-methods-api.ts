/**
 * @file payment-methods-api.ts
 * @description 支付方式相关 API 定义，支持全量 UI 配置字段。
 */

import request from "@/utils/request";
import type { ApiResponse } from '@/api/api.d';
import { useEnvStore } from "@/store/env-store";
import logger from "@/utils/logger";
import { syncRequestId } from "@/utils/sync-request-id";

/**
 * 扩展支付方式对象结构，保留原始 UI 表现字段
 */
export interface PaymentMethod {
    id: string;
    type: "alipay" | "wechat" | "bank" | "BALANCE"; // 对齐原始数据类型
    name: string;
    sub?: string;       // 对应“已绑定/尾号”描述
    isDefault: boolean;
    color?: string;     // 品牌色
    bgColor?: string;   // 背景色
    icon?: string;      // 图标标识
}

const MODULE_NAME = "PaymentMethodsAPI";

/**
 * 获取账户余额
 */
export const getAccountBalance = async (requestId: string): Promise<ApiResponse<number>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        return { success: true, message: "Mock Success", data: 1250.85 };
    }

    const res = await request.get<any, ApiResponse<number>>("/payments/balance", {
        params: { requestId }
    });

    if (res.success) {
        logger.info({ module: MODULE_NAME, operate: "getAccountBalance", result: "Success", requestId });
    }
    return res;
};

/**
 * 获取支付方式列表 - 已恢复全量模拟数据
 */
export const getPaymentMethods = async (requestId: string): Promise<ApiResponse<PaymentMethod[]>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        const mockData: PaymentMethod[] = [
            { id: '1', type: 'wechat', name: '微信支付', sub: '已绑定: *8888', isDefault: true, color: '#07C160', bgColor: '#ecfdf5' },
            { id: '2', type: 'alipay', name: '支付宝', sub: '已绑定: 138****0000', isDefault: false, color: '#1677FF', bgColor: '#eff6ff' },
            { id: '3', type: 'bank', name: '招商银行 (储蓄卡)', sub: '尾号 4210', isDefault: false, color: '#E60012', bgColor: '#fef2f2' }
        ];
        return { success: true, message: "Mock Success", data: mockData };
    }

    const res = await request.get<any, ApiResponse<PaymentMethod[]>>("/payments/methods", {
        params: { requestId }
    });

    if (res.success) {
        logger.info({
            module: MODULE_NAME,
            operate: "getPaymentMethods",
            result: `Fetched ${res.data?.length || 0} methods`,
            requestId
        });
    }
    return res;
};

/**
 * 设置默认支付方式
 */
export const setDefaultPaymentMethod = async (
    methodId: string,
    requestId: string
): Promise<ApiResponse<null>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        return { success: true, message: "Mock Update Success", data: null };
    }

    const res = await request.post<any, ApiResponse<null>>("/payments/methods/default", {
        methodId,
        requestId
    });

    if (res.success) {
        logger.info({
            module: MODULE_NAME,
            operate: "setDefaultPaymentMethod",
            params: { methodId },
            result: "Success",
            requestId
        });
    }
    return res;
};