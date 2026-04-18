/**
 * @file use-login-form.ts
 * @description 登录页面业务逻辑 Hook。
 * 负责维护登录表单状态、执行字段校验、处理登录请求及全链路追踪日志记录。
 * 遵循规范：2.1 自定义钩子规范、2.2 全链路日志规范。
 */

import { useState } from 'react';
import { useRouter, type RelativePathString } from 'expo-router';
import { validatePhoneNumber, validatePassword } from '../utils/validator';
import { loginByPassword } from '../api/auth';
import logger from '../utils/logger';

/**
 * 登录表单业务逻辑封装钩子
 * @param {boolean} isMockMode - 是否开启 Mock 模式
 * @param {string} requestId - 由 Page 层下发的全链路追踪唯一 ID
 * @returns 包含表单状态 (state) 与操作方法 (actions) 的对象
 */
export const useLoginForm = (isMockMode: boolean, requestId: string) => {
    const router = useRouter();

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
            const payload = { phone, password, shouldRemember };

            // 执行 API 请求
            const userData = await loginByPassword(payload, isMockMode);

            // 严格遵循规范：INFO 级别结构化日志记录
            logger.info({
                module: 'use-login-form',
                operate: 'submit_login',
                requestId,
                params: {
                    phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 脱敏处理
                    isMockMode
                },
                result: 'success'
            });

            // 登录成功路由跳转
            router.replace('/home' as RelativePathString);
        } catch (error: any) {
            const errorMessage = error.message || '网络繁忙，请稍后再试';

            // 更新 UI 错误展示
            setErrors(prev => ({ ...prev, submission: errorMessage }));

            // 严格遵循规范：ERROR 级别结构化日志记录，补齐 errorType
            logger.error({
                module: 'use-login-form',
                operate: 'submit_login',
                requestId,
                error: errorMessage,
                errorType: 'AUTH_SUBMIT_FAILED'
            });
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