/**
 * @file receipt-detail-api.ts
 * @description 凭证详情业务请求模块，支持 Mock 切换与全链路追踪
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

/**
 * 接口返回统一响应体格式
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * 凭证详情数据模型
 */
export interface ReceiptDetail {
    amount: string;
    status: string;
    merchant: string;
    orderId: string;
    transactionId: string;
    time: string;
    method: string;
    route: {
        from: string;
        to: string;
    };
}

/**
 * 模拟数据定义
 */
const MOCK_RECEIPT: ReceiptDetail = {
    amount: "45.50",
    status: "支付成功",
    merchant: "拼车出行服务中心 (Mock)",
    orderId: "ORD2024052088329102",
    transactionId: "TXN9902183746612",
    time: "2024-05-20 14:35:21",
    method: "微信支付 (绑定招商银行 8821)",
    route: {
        from: "上海虹桥国际机场 T2",
        to: "静安寺地铁站 4号口"
    }
};

/**
 * 获取凭证详情
 * @param id 凭证ID
 * @param requestId 链路追踪ID (必须由外部页面级 useMemo 生成并传入)
 * @returns Promise<ReceiptDetail>
 */
export const getReceiptDetail = async (id: string, requestId: string): Promise<ReceiptDetail> => {
    const isMockMode = useEnvStore.getState().isMockMode;
    const moduleName = 'ReceiptService';
    const operationName = 'getReceiptDetail';

    try {
        // 1. Mock 模式处理
        if (isMockMode) {
            await new Promise(resolve => setTimeout(resolve, 500));

            logger.info({
                module: moduleName,
                operate: `${operationName}_MOCK`,
                params: { id },
                result: "Mock data returned successfully",
                requestId: requestId
            });

            return MOCK_RECEIPT;
        }

        // 2. 真实接口请求
        // 显式标注泛型：AxiosResponse<ApiResponse<ReceiptDetail>>
        const response = await request.get<ApiResponse<ReceiptDetail>>(`/api/receipt/${id}`);

        // 3. 业务逻辑校验
        if (response.data && response.data.success) {
            logger.info({
                module: moduleName,
                operate: operationName,
                params: { id },
                result: "Success",
                requestId: requestId
            });
            return response.data.data;
        } else {
            const errorMsg = response.data?.message || "后端返回业务逻辑错误";

            logger.error({
                module: moduleName,
                operate: operationName,
                params: { id },
                error: errorMsg,
                errorType: 'BUSINESS_ERROR',
                requestId: requestId
            });

            throw new Error(errorMsg);
        }
    } catch (error: unknown) {
        // 4. 异常捕获与统一日志上报
        const finalMessage = error instanceof Error ? error.message : "未知请求异常";

        logger.error({
            module: moduleName,
            operate: operationName,
            params: { id },
            error: finalMessage,
            errorType: 'NETWORK_OR_RUNTIME_ERROR',
            requestId: requestId
        });

        throw error;
    }
};