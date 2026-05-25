/**
 * @file use-payment-methods-form.ts
 * @description 支付方式页面的业务逻辑 Hook，负责状态管理、乐观更新及结构化链路追踪。
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import {
    getAccountBalance,
    getPaymentMethods,
    setDefaultPaymentMethod,
    PaymentMethod
} from "@/api/payment-methods-api";

/**
 * 支付方式业务 Hook
 * @returns 页面所需的状态与交互函数
 */
export const usePaymentMethods = (requestId: string) => {
    const router = useRouter();
    const isMockMode = useEnvStore(state => state.isMockMode);

    // 2. 状态管理
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 3. 初始化数据加载
    const initPageData = useCallback(async () => {
        setIsLoading(true);
        const moduleName = 'PaymentMethodsHook';
        const operate = 'initPageData';

        try {
            const [balanceRes, methodsRes] = await Promise.all([
                getAccountBalance(requestId),
                getPaymentMethods(requestId),
            ]);

            if (balanceRes.success) {
                setBalance(balanceRes.data);
            }

            if (methodsRes.success) {
                setMethods(methodsRes.data);
            }

            if (balanceRes.success && methodsRes.success) {
                logger.info({
                    module: moduleName,
                    operate,
                    result: 'Data initialization completed',
                    requestId,
                });
            } else {
                Alert.alert("同步失败", "获取支付数据异常，请稍后重试");
            }
        } catch (error: unknown) {
            logger.error({
                module: moduleName,
                operate,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'INIT_PAGE_ERROR',
                requestId,
            });
            Alert.alert("网络异常", "请检查网络后重试");
        } finally {
            setIsLoading(false);
        }
    }, [requestId]);

    // 监听环境切换或组件挂载
    useEffect(() => {
        initPageData();
    }, [initPageData, isMockMode]);

    // 4. 业务处理函数

    /**
     * 切换默认支付方式（执行乐观更新）
     * @param id 支付方式唯一标识
     */
    const handleSetDefault = useCallback(async (id: string) => {
        const moduleName = 'PaymentMethodsHook';
        const operate = 'handleSetDefault';
        const previousMethods = [...methods];

        // 乐观更新 UI
        setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));

        try {
            const res = await setDefaultPaymentMethod(id, requestId);

            if (!res.success) {
                throw new Error(res.message);
            }

            logger.info({
                module: moduleName,
                operate,
                params: { targetId: id },
                result: 'Default payment method updated',
                requestId
            });
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Update Failed';

            // 异常回滚
            setMethods(previousMethods);

            logger.error({
                module: moduleName,
                operate,
                params: { targetId: id },
                error: errorMsg,
                errorType: 'SET_DEFAULT_FAILED',
                requestId
            });

            Alert.alert("设置失败", "无法更改默认扣款渠道");
        }
    }, [methods, requestId]);

    /**
     * 处理新增支付方式
     */
    const handleAddMethod = useCallback(() => {
        logger.info({
            module: 'PaymentMethodsHook',
            operate: 'handleAddMethod',
            params: undefined,
            result: 'Add method dialog shown',
            requestId
        });
        Alert.alert("添加支付方式", "该功能接入中，请在安全环境下操作。");
    }, [requestId]);

    /**
     * 导航返回
     */
    const goBack = useCallback(() => {
        router.back();
    }, [router]);

    return {
        // 状态
        balance,
        methods,
        isLoading,
        handleSetDefault,
        handleAddMethod,
        goBack,
        refreshData: initPageData
    };
};