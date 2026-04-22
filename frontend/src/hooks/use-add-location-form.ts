/**
 * @file use-add-location-form.ts
 * @description 处理新增常用地点的业务逻辑 Hook，集成链路追踪与结构化日志记录。
 */

import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { ROUTES } from '@/router/paths';
import { saveFavoriteLocation } from "@/api/add-location-api";
import logger, { generateRequestId } from '@/utils/logger';

// --- 常量配置 ---
const MODULE_NAME = 'use-add-location-form';

/**
 * 新增常用地点业务逻辑 Hook
 * @returns 包含表单状态、加载状态及保存处理函数
 */
export const useAddLocationForm = (requestId: string) => {
    const router = useRouter();

    // 1. 状态管理
    const [label, setLabel] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    /**
     * 保存地点的事件处理函数
     */
    const handleSave = async () => {
        const params = { label: label.trim(), address: address.trim() };

        // 基础校验
        if (!params.label || !params.address) {
            logger.warn({
                module: MODULE_NAME,
                operate: 'handleSave_validation',
                params,
                result: 'Validation failed: Missing information',
                requestId,
            });
            Alert.alert("提示", "请填写完整信息");
            return;
        }

        try {
            setLoading(true);

            // 业务开始日志
            logger.info({
                module: MODULE_NAME,
                operate: 'handleSave_start',
                params,
                result: 'Request initiated',
                requestId,
            });

            // 2. 调用 API 封装层（显式注入 requestId）
            const result = await saveFavoriteLocation(params, requestId);

            if (result.success) {
                logger.info({
                    module: MODULE_NAME,
                    operate: 'handleSave_success',
                    params,
                    result: 'Navigation to favorite locations',
                    requestId,
                });
                // 成功后跳转
                router.replace(ROUTES.PROFILE.FAVORITE_LOCATIONS);
            } else {
                logger.error({
                    module: MODULE_NAME,
                    operate: 'handleSave_api_error',
                    params,
                    result: JSON.stringify(result),
                    error: result.message ?? 'Unknown API Error',
                    errorType: 'BUSINESS_ERROR',
                    requestId,
                });
                Alert.alert("提交失败", result.message ?? "未知错误");
            }
        } catch (error: unknown) {
            const caughtError = error as Error;

            // 系统异常日志记录
            logger.error({
                module: MODULE_NAME,
                operate: 'handleSave_exception',
                params,
                result: 'System Exception',
                error: caughtError.message ?? 'Unknown Exception',
                errorType: 'RUNTIME_EXCEPTION',
                requestId,
            });

            Alert.alert("错误", "系统异常，请稍后再试");
        } finally {
            setLoading(false);
        }
    };

    // 返回页面所需的 state 和 actions
    return {
        label,
        setLabel,
        address,
        setAddress,
        loading,
        handleSave,
        requestId, // 导出以便 UI 组件通过 props 传递给子组件
    };
};