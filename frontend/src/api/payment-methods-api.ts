/**
 * @file payment-methods-api.ts
 * @description 支付方式相关接口定义，包含账户余额查询、支付列表管理及 Mock 逻辑处理。
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

/** 支付方式类型定义 */
export type PaymentType = 'wechat' | 'alipay' | 'bank';

/** 支付方式数据结构 */
export interface PaymentMethod {
    id: string;
    type: PaymentType;
    name: string;
    sub: string;
    isDefault: boolean;
    color: string;
    bgColor: string;
}

/** 账户余额数据结构 */
export interface AccountBalance {
    amount: number;
    currency: string;
}

/** 通用返回结构 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/** 基础调用参数，强制要求 requestId 显式传递 */
interface BaseApiParams {
    requestId: string;
}

// --- 模拟数据 (Internal Private) ---

const MOCK_BALANCE: AccountBalance = { amount: 128.50, currency: '¥' };

const MOCK_METHODS: PaymentMethod[] = [
    { id: '1', type: 'wechat', name: '微信支付', sub: '已绑定: *8888', isDefault: true, color: '#07C160', bgColor: '#ecfdf5' },
    { id: '2', type: 'alipay', name: '支付宝', sub: '已绑定: 138****0000', isDefault: false, color: '#1677FF', bgColor: '#eff6ff' },
    { id: '3', type: 'bank', name: '招商银行 (储蓄卡)', sub: '尾号 4210', isDefault: false, color: '#E60012', bgColor: '#fef2f2' }
];

/**
 * 统一处理请求逻辑（含日志审计与异常捕获）
 * @template T 响应数据类型
 * @param mockData 模拟数据
 * @param remotePath 请求路径
 * @param method 请求方法
 * @param requestId 链路追踪ID
 * @param payload 请求负载
 * @returns {Promise<ApiResponse<T>>}
 */
const handleRequest = async <T>(
    mockData: T,
    remotePath: string,
    method: 'get' | 'post',
    requestId: string,
    payload?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
    const isMockMode = useEnvStore.getState().isMockMode;
    const moduleName = 'PaymentAPI';
    const operation = `${method.toUpperCase()}:${remotePath}`;

    try {
        if (isMockMode) {
            await new Promise(resolve => setTimeout(resolve, 300));
            logger.info({
                module: moduleName,
                operate: `${operation} (Mock)`,
                params: payload ?? undefined,
                result: 'Mock success',
                requestId
            });
            return {
                success: true,
                message: "Success (Mock Mode)",
                data: mockData
            };
        }

        const response = method === 'get'
            ? await request.get<ApiResponse<T>>(remotePath)
            : await request.post<ApiResponse<T>>(remotePath, payload);

        const apiResult = response.data;

        if (apiResult.success) {
            logger.info({
                module: moduleName,
                operate: operation,
                params: payload ?? undefined,
                result: apiResult.message,
                requestId
            });
        } else {
            logger.error({
                module: moduleName,
                operate: operation,
                params: payload ?? undefined,
                error: apiResult.message,
                errorType: 'BIZ_ERROR',
                requestId
            });
        }

        return apiResult;
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error({
            module: moduleName,
            operate: operation,
            params: payload ?? undefined,
            error: errorMessage,
            errorType: 'NETWORK_ERROR',
            requestId
        });

        return {
            success: false,
            message: errorMessage,
            data: undefined as unknown as T
        };
    }
};

// --- 对外 API 接口 ---

/** * 获取账户余额 
 * @param params {BaseApiParams}
 */
export const getAccountBalance = (params: BaseApiParams) =>
    handleRequest(MOCK_BALANCE, '/api/v1/payment/balance', 'get', params.requestId);

/** * 获取已绑定的支付方式列表 
 * @param params {BaseApiParams}
 */
export const getPaymentMethods = (params: BaseApiParams) =>
    handleRequest(MOCK_METHODS, '/api/v1/payment/methods', 'get', params.requestId);

/** * 设置默认支付方式 
 * @param id 支付方式ID
 * @param params {BaseApiParams}
 */
export const setDefaultPaymentMethod = (id: string, params: BaseApiParams) =>
    handleRequest(undefined, `/api/v1/payment/methods/${id}/set-default`, 'post', params.requestId);

/** * 添加支付方式 
 * @param data 支付方式表单数据
 * @param params {BaseApiParams}
 */
export const addPaymentMethod = (data: Partial<PaymentMethod>, params: BaseApiParams) =>
    handleRequest(
        MOCK_METHODS[0],
        '/api/v1/payment/methods/add',
        'post',
        params.requestId,
        data as Record<string, unknown>
    );