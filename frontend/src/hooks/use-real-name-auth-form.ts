/**
 * @file use-real-name-auth-form.ts
 * @description 实名认证页面业务逻辑 Hook，负责状态管理、初始化加载以及带链路追踪的表单提交
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getRealNameStatus, submitRealNameAuth, RealNameInfo } from '@/api/real-name-auth-api';
import logger from '@/utils/logger';

const MODULE_NAME = 'useRealNameAuthForm';

/**
 * 实名认证页面业务逻辑 Hook
 * @param {string} requestId - 由页面级 useMemo 生成的唯一链路追踪 ID
 * @returns 状态与操作方法
 */
export const useRealNameAuthForm = (requestId: string) => {
    const router = useRouter();

    // 状态管理
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [authData, setAuthData] = useState<Partial<RealNameInfo>>({});

    /**
     * 初始化加载认证状态
     */
    const fetchAuthStatus = useCallback(async () => {
        try {
            const res = await getRealNameStatus(requestId);
            if (res.success) {
                setIsVerified(res.data.isVerified);
                setAuthData(res.data);
            }
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'fetchAuthStatus_Error',
                params: { requestId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'HOOK_FETCH_ERROR',
                requestId,
            });
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchAuthStatus();
    }, [fetchAuthStatus]);

    /**
     * 处理实名认证提交
     */
    const handleVerify = async () => {
        if (!name || !idNumber) return;

        // 记录操作日志，注意隐私保护，严禁记录真实姓名和身份证号
        logger.info({
            module: MODULE_NAME,
            operate: 'handleVerify_Submit',
            params: {
                requestId,
                nameLength: name.length,
                idNumberLength: idNumber.length
            },
            result: 'User initiated verification submission',
            requestId,
        });

        setSubmitting(true);
        try {
            const res = await submitRealNameAuth({ name, idNumber }, requestId);
            if (res.success) {
                setIsVerified(true);
                setAuthData(res.data);

                logger.info({
                    module: MODULE_NAME,
                    operate: 'handleVerify_Success',
                    params: { requestId },
                    result: 'Identity verification successful',
                    requestId,
                });

                Alert.alert('提示', '认证成功');
            } else {
                logger.warn({
                    module: MODULE_NAME,
                    operate: 'handleVerify_Failed',
                    params: { requestId, message: res.message },
                    result: 'Verification rejected by backend',
                    requestId,
                });

                Alert.alert('失败', res.message || '身份核验未通过');
            }
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'handleVerify_Error',
                params: { requestId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'SUBMIT_TRANS_ERROR',
                requestId,
            });

            Alert.alert('错误', '网络请求异常，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * 处理返回跳转
     */
    const handleBack = () => {
        router.back();
    };

    return {
        // 状态
        isVerified,
        loading,
        submitting,
        name,
        idNumber,
        authData,
        // 操作方法
        setName,
        setIdNumber,
        handleVerify,
        handleBack,
    };
};