/**
 * @file use-edit-location-form.ts
 * @description 编辑地点页面的业务逻辑 Hook，集成链路追踪与标准化日志记录
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ROUTES } from '@/router/paths';
import { updateLocationApi } from '@/api/edit-location-api';
import logger from '@/utils/logger';

const MODULE_NAME = 'UseEditLocationForm';

/**
 * 编辑地点逻辑 Hook
 * @returns 页面状态与交互方法
 */
export const useEditLocationForm = (requestId: string) => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // 1. 状态管理
    const [label, setLabel] = useState((params.label as string) || "");
    const [address, setAddress] = useState((params.address as string) || "");
    const [loading, setLoading] = useState(false);

    // 2. 业务处理函数

    /**
     * 处理提交更新逻辑
     */
    const handleUpdate = async () => {
        // 数据校验
        if (!label || !address) {
            Alert.alert("提示", "信息不能为空");
            return;
        }

        try {
            setLoading(true);

            // 日志记录：操作开始
            logger.info({
                module: MODULE_NAME,
                operate: 'handleUpdate_Start',
                params: { id: params.id }, // 仅记录ID，保护隐私
                result: 'Initiating update request',
                requestId
            });

            // 调用接口：显式传递 requestId
            const response = await updateLocationApi({
                id: params.id as string,
                label,
                address
            }, requestId);

            if (response.success) {
                logger.info({
                    module: MODULE_NAME,
                    operate: 'handleUpdate_Success',
                    params: { id: params.id },
                    result: 'Update successful, navigating back',
                    requestId
                });

                Alert.alert("成功", "地点信息已更新", [
                    {
                        text: "确定",
                        onPress: () => router.replace(ROUTES.PROFILE.FAVORITE_LOCATIONS)
                    }
                ]);
            } else {
                // 接口返回业务错误
                logger.error({
                    module: MODULE_NAME,
                    operate: 'handleUpdate_BusinessError',
                    params: { id: params.id },
                    error: response.message,
                    errorType: 'BUSINESS_ERROR',
                    requestId
                });
                Alert.alert("更新失败", response.message || "未知错误");
            }
        } catch (error: any) {
            // 系统级别错误捕获（兜底）
            logger.error({
                module: MODULE_NAME,
                operate: 'handleUpdate_SystemError',
                params: { id: params.id },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'SYSTEM_ERROR',
                requestId
            });
            Alert.alert("错误", "网络请求失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理取消操作
     */
    const handleCancel = () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'handleCancel',
            params: undefined,
            result: 'User cancelled editing',
            requestId
        });
        router.back();
    };

    // 3. 返回页面所需的属性和方法
    return {
        formData: {
            label,
            address,
        },
        status: {
            loading,
            requestId, // 将 requestId 暴露，以便子组件 props 消费
        },
        methods: {
            setLabel,
            setAddress,
            handleUpdate,
            handleCancel,
        }
    };
};