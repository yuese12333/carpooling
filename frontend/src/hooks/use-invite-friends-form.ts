/**
 * @file use-invite-friends-form.ts
 * @description 邀请好友页面的业务逻辑 Hook，处理数据初始化、分享追踪及剪贴板交互。
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Share, Alert } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { getInviteInfo, trackShareAction, InviteStats } from "@/api/invite-friends-api";
import logger from '@/utils/logger';
import { router } from "expo-router";

/**
 * InviteFriends 页面的业务逻辑 Hook
 * @param requestId 页面级唯一的链路追踪 ID，必须由外部注入
 * @returns 包含 UI 状态及交互处理函数
 */
export const useInviteFriendsForm = (requestId: string) => {
    // 状态管理：统一使用 undefined 避免 null
    const [loading, setLoading] = useState<boolean>(true);
    const [inviteCode, setInviteCode] = useState<string>("");
    const [stats, setStats] = useState<InviteStats | undefined>(undefined);

    /**
     * 从 API 获取邀请相关数据
     */
    const hasContentRef = useRef(false);
    useEffect(() => {
        hasContentRef.current = Boolean(inviteCode);
    }, [inviteCode]);

    const fetchInviteData = useCallback(async (options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        try {
            if (!silent) {
                setLoading(true);
            }
            // 获取完整的 ApiResponse 对象
            const response = await getInviteInfo(requestId);

            // 规范：判断业务请求是否成功
            if (response.success && response.data) {
                // 从响应体的 data 字段中提取业务数据
                setInviteCode(response.data.inviteCode);
                setStats(response.data.stats);

                logger.info({
                    module: 'InviteFriendsHook',
                    operate: 'fetchInviteData_Success',
                    params: { requestId },
                    result: 'Invite data state updated',
                    requestId
                });
            }
        } catch (error: unknown) {
            // 异常捕获并记录日志，禁止 console.error
            logger.error({
                module: 'InviteFriendsHook',
                operate: 'fetchInviteData_Error',
                params: { requestId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'FETCH_ERROR',
                requestId
            });
            Alert.alert("错误", "获取邀请信息失败，请重试");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    // 初始化加载数据
    useEffect(() => {
        fetchInviteData();
    }, [fetchInviteData]);

    /**
     * 复制邀请码到剪贴板
     */
    const handleCopyToClipboard = async () => {
        if (!inviteCode) {
            logger.warn({
                module: 'InviteFriendsHook',
                operate: 'handleCopyToClipboard_Empty',
                params: { requestId },
                result: 'Attempted to copy empty invite code',
                requestId
            });
            return;
        }

        try {
            await Clipboard.setStringAsync(inviteCode);

            logger.info({
                module: 'InviteFriendsHook',
                operate: 'copyToClipboard',
                params: { inviteCode, requestId },
                result: 'Copied to clipboard successfully',
                requestId
            });

            Alert.alert("提示", "邀请码已复制到剪贴板");
        } catch (error: unknown) {
            logger.error({
                module: 'InviteFriendsHook',
                operate: 'copyToClipboard_Error',
                params: { requestId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'CLIPBOARD_ERROR',
                requestId
            });
        }
    };

    /**
     * 调用系统原生分享并触发埋点
     */
    const handleShare = async () => {
        const shareMessage = `加入拼车出行，输入邀请码 ${inviteCode}，领取您的首单优惠！`;

        try {
            const result = await Share.share({
                message: shareMessage,
            });

            if (result.action === Share.sharedAction) {
                const platform = result.activityType || 'general';

                logger.info({
                    module: 'InviteFriendsHook',
                    operate: 'handleShare_Actioned',
                    params: { platform, requestId },
                    result: 'User shared successfully',
                    requestId
                });

                // 显式传递 requestId 进行链路追踪
                await trackShareAction(platform, requestId);
            } else if (result.action === Share.dismissedAction) {
                logger.info({
                    module: 'InviteFriendsHook',
                    operate: 'handleShare_Dismissed',
                    params: { requestId },
                    result: 'User dismissed share sheet',
                    requestId
                });
            }
        } catch (error: unknown) {
            logger.error({
                module: 'InviteFriendsHook',
                operate: 'handleShare_Error',
                params: { requestId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'SHARE_ERROR',
                requestId
            });
        }
    };

    // --- 事件处理 ---
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);


    // 返回 UI 所需的所有状态与方法
    return {
        loading,
        inviteCode,
        stats,
        handleCopyToClipboard,
        handleShare,
        handleBack,
        refreshData: fetchInviteData
    };
};