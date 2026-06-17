/**
 * @file use-login-form.ts
 * @description 登录页面业务逻辑 Hook。
 * 负责维护登录表单状态、执行字段校验、处理登录请求及全链路追踪日志记录。
 * 遵循规范：2.1 自定义钩子规范、2.2 全链路日志规范。
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { validatePhoneNumber, validatePassword } from '@/utils/validator';
import { useAuth } from '@/store/auth-context';
import { useEnvStore } from '@/store/env-store';
import logger, { maskSensitive } from '@/utils/logger';
import { isAuthCredentialError } from '@/utils/api-response';
import { ROUTES } from '@/router/paths';

/**
 * 登录表单业务逻辑封装钩子
 * @param {boolean} isMockMode - 是否开启 Mock 模式
 * @param {string} requestId - 由 Page 层下发的全链路追踪唯一 ID
 * @returns 包含表单状态 (state) 与操作方法 (actions) 的对象
 */
export const useLoginForm = (isMockMode: boolean, requestId: string) => {
    const router = useRouter();
    const { login } = useAuth();

    // --- 状态管理 (States) ---
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [shouldRemember, setShouldRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /** 表单校验错误状态记录 */
    const [errors, setErrors] = useState({
        phone: '',
        password: '',
        submission: ''
    });

    /**
     * 处理登录提交逻辑
     * @description 执行本地格式校验 -> 调用登录 API -> 成功后跳转并记录结构化日志
     * @returns {Promise<void>}
     */
    const handleLogin = async (): Promise<void> => {
        // 1. 本地格式前置校验
        const phoneError = validatePhoneNumber(phone);
        const passwordError = validatePassword(password);

        setErrors({
            phone: phoneError,
            password: passwordError,
            submission: ''
        });

        // 校验未通过则中断提交
        if (phoneError || passwordError) return;

        // 2. 提交业务逻辑
        setIsLoading(true);
        try {
            // 执行 API 请求
            await login(phone, password, shouldRemember);

            // 严格遵循规范：INFO 级别结构化日志记录
            logger.info({
                module: 'use-login-form',
                operate: 'submit_login',
                requestId,
                params: {
                    ...maskSensitive({ phone }),
                    isMockMode
                },
                result: 'success'
            });

            // 登录成功路由跳转：管理员自动进入用户管理
            const role = useEnvStore.getState().role;
            router.replace(role === 'admin' ? ROUTES.ADMIN.USERS : ROUTES.HOME);
        } catch (error: any) {
            const errorMessage = error.message || '网络繁忙，请稍后再试';

            // 更新 UI 错误展示
            setErrors(prev => ({ ...prev, submission: errorMessage }));

            // 凭据类失败已在 http-client / AuthContext 记录，此处不再重复打日志
            if (!isAuthCredentialError(error)) {
                logger.error({
                    module: 'use-login-form',
                    operate: 'submit_login',
                    requestId,
                    error: errorMessage,
                    errorType: 'AUTH_SUBMIT_FAILED',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        /** 表单视图状态 */
        state: {
            phone,
            password,
            shouldRemember,
            isLoading,
            errors
        },
        /** 视图交互动作 */
        actions: {
            /** 手机号变更处理：仅允许数字，并清除校验错误 */
            setPhone: (val: string) => {
                setPhone(val.replace(/\D/g, ''));
                setErrors(prev => ({ ...prev, phone: '' }));
            },
            /** 密码变更处理 */
            setPassword: (val: string) => {
                setPassword(val);
                setErrors(prev => ({ ...prev, password: '' }));
            },
            /** 是否记住我状态切换 */
            setShouldRemember,
            /** 提交表单动作 */
            handleLogin
        }
    };
};