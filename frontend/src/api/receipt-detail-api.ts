/**
 * @file receipt-detail-api.ts
 * @description 凭证详情业务请求模块，支持 Mock 切换与全链路追踪
 * @version 1.2.0 (Refactored: Linear logic without Try-Catch)
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';

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
 * @returns Promise<ApiResponse<ReceiptDetail>>
 */
export const getReceiptDetail = async (id: string, requestId: string): Promise<ApiResponse<ReceiptDetail>> => {
    const isMockMode = useEnvStore.getState().isMockMode;
    const moduleName = 'ReceiptService';
    const operationName = 'getReceiptDetail';

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

        return {
            success: true,
            message: "Mock 获取成功",
            data: MOCK_RECEIPT
        };
    }

    // 2. 真实接口请求
    // 底层 request.ts 无论成功失败都会 Resolve 标准的 ApiResponse 对象
    const response = await request.get<any, ApiResponse<ReceiptDetail>>(`/api/receipt/${id}`);

    // 3. 条件化日志记录
    // 仅在业务成功时记录成功日志，底层已自动记录错误日志，此处不再使用 Try-Catch 捕获
    if (response.success) {
        logger.info({
            module: moduleName,
            operate: operationName,
            params: { id },
            result: "Success",
            requestId: requestId
        });
    }

    return response;
};