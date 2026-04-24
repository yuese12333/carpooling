/**
 * @file use-receipt-detail-form.ts
 * @description 提取 ReceiptDetailPage 的业务逻辑，集成全链路追踪、结构化日志与加载状态管理
 */

import { useState, useEffect, useCallback } from "react";
import { getReceiptDetail, ReceiptDetail } from "@/api/receipt-detail-api";
import logger from '@/utils/logger';

interface UseReceiptDetailReturn {
    loading: boolean;
    receiptData: ReceiptDetail | undefined; // 修复：统一使用 undefined
    handleFetchDetail: () => Promise<void>;
    handleShare: () => void;
    handleDownload: () => void;
    handleSendEmail: () => void;
    handleCopyOrderId: (orderId: string) => void;
    handleContactSupport: () => void;
}

/**
 * 交易凭证页面的自定义逻辑 Hook
 * @param id 凭证 ID
 * @param requestId 显式注入的链路追踪 ID
 * @returns UseReceiptDetailReturn
 */
export const useReceiptDetail = (
    id: string | string[],
    requestId: string
): UseReceiptDetailReturn => {
    const [loading, setLoading] = useState<boolean>(true);
    const [receiptData, setReceiptData] = useState<ReceiptDetail | undefined>(undefined);

    const moduleName = 'Hook_useReceiptDetail';
    const detailId = Array.isArray(id) ? id[0] : id;

    // 获取数据逻辑
    const handleFetchDetail = useCallback(async () => {
        try {
            setLoading(true);

            // 显式下传 requestId 至 API 层
            const data = await getReceiptDetail(detailId, requestId);
            setReceiptData(data);

            logger.info({
                module: moduleName,
                operate: 'FETCH_DETAIL_SUCCESS',
                params: { detailId },
                result: 'Data state updated',
                requestId
            });
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : "获取详情未知异常";

            logger.error({
                module: moduleName,
                operate: 'FETCH_DETAIL_ERROR',
                params: { detailId },
                error: errorMsg,
                errorType: 'API_FETCH_FAILURE',
                requestId
            });
            // 此处可根据规范集成全局 Toast
        } finally {
            setLoading(false);
        }
    }, [detailId, requestId]);

    // 初始化加载
    useEffect(() => {
        handleFetchDetail();
    }, [handleFetchDetail]);

    // 分享处理
    const handleShare = useCallback(() => {
        logger.info({
            module: moduleName,
            operate: 'SHARE_ACTION',
            params: { detailId },
            result: 'Triggering RN Share module',
            requestId
        });
        // 实现逻辑：Share.share({ ... })
    }, [detailId, requestId]);

    // 下载凭证图片
    const handleDownload = useCallback(() => {
        logger.info({
            module: moduleName,
            operate: 'DOWNLOAD_ACTION',
            params: { detailId },
            result: 'Initiating file download',
            requestId
        });
    }, [detailId, requestId]);

    // 发送邮件
    const handleSendEmail = useCallback(() => {
        logger.info({
            module: moduleName,
            operate: 'EMAIL_ACTION',
            params: { detailId },
            result: 'Opening mail composer',
            requestId
        });
    }, [detailId, requestId]);

    // 复制订单号
    const handleCopyOrderId = useCallback((orderId: string) => {
        logger.info({
            module: moduleName,
            operate: 'COPY_ORDER_ID',
            params: { orderId },
            result: 'Copied to clipboard',
            requestId
        });
        // 实现逻辑：Clipboard.setStringAsync(orderId);
    }, [requestId]);

    // 联系客服
    const handleContactSupport = useCallback(() => {
        logger.info({
            module: moduleName,
            operate: 'CONTACT_SUPPORT',
            params: { detailId },
            result: 'Redirecting to help center',
            requestId
        });
    }, [detailId, requestId]);

    return {
        loading,
        receiptData,
        handleFetchDetail,
        handleShare,
        handleDownload,
        handleSendEmail,
        handleCopyOrderId,
        handleContactSupport,
    };
};