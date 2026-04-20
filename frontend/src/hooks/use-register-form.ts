/**
 * @file use-register-form.ts
 * @description 注册页面业务逻辑 Hook，负责表单状态管理、校验、验证码倒计时及注册提交逻辑。
 * 遵循规范：链路追踪自动化方案、结构化日志输出规范、隐私保护规范。
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
    checkNickname,
    sendSmsCode,
    verifySmsCode,
    registerUser,
    RegisterRequest
} from '../api/auth';
import {
    validatePhoneNumber,
    validateNickname,
    validateVerifyCode,
    validateConfirmPassword,
    calculatePasswordStrength,
    MIN_PASSWORD_LENGTH
} from '../utils/validator';
import logger from '../utils/logger';
import { ROUTES } from '../router/paths';

/** 注册表单数据接口 */
export interface RegistrationFormData {
    nickname: string;
    phoneNumber: string;
    verifyCode: string;
    password: string;
    confirmPassword: string;
    isAgreed: boolean;
}

const COUNTDOWN_INITIAL = 60;

/**
 * 注册流程业务逻辑封装
 * @param {boolean} isMockMode - 是否启用 Mock 模式
 * @param {(...args: any[]) => Promise<void>} registerLocal - 本地存储注册信息的外部回调
 * @returns 包含状态（state）与动作（actions）的响应式对象
 */
export const useRegisterForm = (isMockMode: boolean, registerLocal: (...args: any[]) => Promise<void>, requestId: string) => {
    const router = useRouter();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- 状态管理 ---
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState<RegistrationFormData>({
        nickname: '',
        phoneNumber: '',
        verifyCode: '',
        password: '',
        confirmPassword: '',
        isAgreed: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [tempToken, setTempToken] = useState("");

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // 实时计算密码强度
    const passwordStrengthScore = useMemo(() =>
        calculatePasswordStrength(formData.password),
        [formData.password]
    );

    /** * 处理发送验证码逻辑
     */
    const handleSendCode = async () => {
        const phoneError = validatePhoneNumber(formData.phoneNumber);
        if (phoneError) {
            setFieldErrors(prev => ({ ...prev, phoneNumber: phoneError }));
            return;
        }

        setIsLoading(true);
        try {
            const success = await sendSmsCode(formData.phoneNumber, isMockMode);

            logger.info({
                module: 'register-hook',
                operate: 'sendSmsCode',
                params: { phoneNumber: formData.phoneNumber },
                result: success ? 'SUCCESS' : 'FAILED',
                requestId
            });

            if (success) {
                setCountdown(COUNTDOWN_INITIAL);
                timerRef.current = setInterval(() => {
                    setCountdown(c => {
                        if (c <= 1) {
                            if (timerRef.current) clearInterval(timerRef.current);
                            return 0;
                        }
                        return c - 1;
                    });
                }, 1000);
            }
        } catch (error: any) {
            logger.error({
                module: 'register-hook',
                operate: 'sendSmsCode',
                error: error.message,
                errorType: 'API_EXECUTION_ERROR',
                requestId
            });
            setFieldErrors(prev => ({ ...prev, general: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    /** * 处理第一步信息校验并跳转至第二步
     */
    const navigateToStepTwo = async () => {
        const errors: Record<string, string> = {
            nickname: validateNickname(formData.nickname),
            phoneNumber: validatePhoneNumber(formData.phoneNumber),
            verifyCode: validateVerifyCode(formData.verifyCode)
        };

        const activeErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== ""));
        if (Object.keys(activeErrors).length > 0) {
            return setFieldErrors(activeErrors);
        }

        setIsLoading(true);

        try {
            // 校验昵称可用性
            const nickRes = await checkNickname(formData.nickname, isMockMode);
            if (!nickRes.isAvailable) {
                return setFieldErrors({ nickname: "昵称已被占用" });
            }

            // 校验验证码有效性
            const verifyRes = await verifySmsCode(formData.phoneNumber, formData.verifyCode, isMockMode);

            logger.info({
                module: 'register-hook',
                operate: 'verifyStepOne',
                params: { nickname: formData.nickname, phoneNumber: formData.phoneNumber },
                result: verifyRes.isValid ? 'VALID' : 'INVALID',
                requestId
            });

            if (verifyRes.isValid) {
                setTempToken(verifyRes.tempToken);
                setCurrentStep(2);
                setFieldErrors({});
            }
        } catch (error: any) {
            logger.error({
                module: 'register-hook',
                operate: 'verifyStepOne',
                error: error.message,
                errorType: 'STEP_VALIDATION_ERROR',
                requestId
            });
            setFieldErrors(prev => ({ ...prev, general: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    /** * 最终注册提交逻辑 
     */
    const handleRegisterSubmit = async () => {
        const { password, confirmPassword, isAgreed, nickname, phoneNumber, verifyCode } = formData;

        const errors: Record<string, string> = {
            password: password.length < MIN_PASSWORD_LENGTH ? "密码长度不足" : "",
            confirmPassword: validateConfirmPassword(password, confirmPassword),
            isAgreed: !isAgreed ? "请同意协议" : ""
        };

        const activeErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== ""));
        if (Object.keys(activeErrors).length > 0) {
            return setFieldErrors(activeErrors);
        }

        setIsLoading(true);

        try {
            const registerParams: RegisterRequest = {
                nickname,
                phoneNumber,
                password,
                verifyCode,
                tempToken,
                agreeProtocol: isAgreed,
            };

            const result = await registerUser(registerParams, isMockMode);

            // 记录注册成功日志，严禁记录 password
            logger.info({
                module: 'register-hook',
                operate: 'finalRegisterSubmit',
                params: { nickname, phoneNumber, agreeProtocol: isAgreed },
                result: 'SUCCESS',
                requestId
            });

            // 本地存储用户信息并重定向
            await registerLocal(nickname, phoneNumber, password);
            router.replace(ROUTES.HOME);
        } catch (error: any) {
            logger.error({
                module: 'register-hook',
                operate: 'finalRegisterSubmit',
                error: error.message,
                errorType: 'REGISTER_FAILED',
                requestId
            });
            setFieldErrors(prev => ({ ...prev, general: error.message }));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 泛型表单更新函数
     * @param key 字段名
     * @param value 字段值
     */
    const updateForm = <K extends keyof RegistrationFormData>(
        key: K,
        value: RegistrationFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // 更新时自动清除该字段及全局的错误信息
        setFieldErrors(prev => ({ ...prev, [key]: '', general: '' }));
    };

    return {
        state: {
            currentStep,
            formData,
            isLoading,
            countdown,
            fieldErrors,
            passwordStrengthScore
        },
        actions: {
            updateForm,
            navigateToStepTwo,
            setCurrentStep,
            setFieldErrors,
            handleSendVerificationCode: handleSendCode,
            handleFinalRegistration: handleRegisterSubmit
        }
    };
};