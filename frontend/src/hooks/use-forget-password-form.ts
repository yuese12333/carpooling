/**
 * @file use-forget-password-form.ts
 * @description 找回密码页面的业务逻辑 Hook，处理多步校验、验证码倒计时及密码重置逻辑。
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Alert, TextInput } from "react-native";
import { useRouter } from 'expo-router';
import { passwordApi } from '../api/password-api';
import logger from "@/utils/logger";
import { useEnvStore } from '@/store/env-store';
import {
    validatePhoneNumber,
    validatePassword,
    validateConfirmPassword,
    calculatePasswordStrength
} from "../utils/validator";
import { ROUTES } from '../router/paths';

type Step = 1 | 2 | 3 | 4;

/**
 * 找回密码业务逻辑封装 Hook
 * @returns 包含表单状态、引用、及业务处理函数
 */
export const useForgetPasswordForm = () => {
    const router = useRouter();
    // 获取全局链路跟踪 ID
    const requestId = useEnvStore.getState().currentRequestId;

    // --- 状态管理 ---
    const [step, setStep] = useState<Step>(1);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [tempToken, setTempToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- 引用管理 ---
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const codeRefs = useRef<(TextInput | null)[]>([]);

    // --- 副作用：组件销毁时清除定时器 ---
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    /** 开启验证码倒计时 */
    const startCountdown = useCallback(() => {
        setCountdown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    }, []);

    // --- 业务处理函数 ---

    /** * 流程 1: 校验手机号并发送验证码 
     * 逻辑：先检查注册状态，确认已注册后再触发短信发送
     */
    const handleInitiateReset = async () => {
        const errorMessage = validatePhoneNumber(phone);
        if (errorMessage) {
            setErrors({ phone: errorMessage });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // 步骤 A: 校验手机号
            const checkRes = await passwordApi.checkPhoneStatus(phone);
            if (checkRes.code !== 200 || !checkRes.data.isRegistered) {
                throw new Error("该手机号尚未注册");
            }

            // 步骤 B: 发送验证码
            const smsRes = await passwordApi.sendSmsCode(phone);
            if (smsRes.code === 200 && smsRes.data.success) {
                logger.info({
                    module: "Auth_ForgetPassword",
                    operate: "SEND_CODE_SUCCESS",
                    params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
                    result: "Step 2 Entered",
                    requestId
                });
                startCountdown();
                setStep(2);
            } else {
                throw new Error(smsRes.message || "发送失败");
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "请求失败";
            logger.error({
                module: "Auth_ForgetPassword",
                operate: "INITIATE_RESET_FAILED",
                params: { phone },
                result: undefined,
                error: msg,
                errorType: "BIZ_ERROR",
                requestId
            });
            Alert.alert("提示", msg);
        } finally {
            setLoading(false);
        }
    };

    /** * 流程 2: 校验验证码逻辑 
     * @param fullCode 完整的 6 位验证码字符串
     */
    const verifySmsCode = async (fullCode: string) => {
        setLoading(true);
        try {
            const res = await passwordApi.verifyCode(phone, fullCode);
            if (res.code === 200 && res.data.isValid) {
                setTempToken(res.data.tempToken);
                setStep(3);
                logger.info({
                    module: "Auth_ForgetPassword",
                    operate: "VERIFY_CODE_SUCCESS",
                    params: { phone: '***' },
                    result: "Step 3 Entered",
                    requestId
                });
            } else {
                throw new Error("验证码无效或已过期");
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "验证失败";
            logger.error({
                module: "Auth_ForgetPassword",
                operate: "VERIFY_CODE_FAILED",
                params: { phone: '***' },
                result: undefined,
                error: msg,
                errorType: "VERIFY_ERROR",
                requestId
            });
            Alert.alert("验证失败", msg);
            setCode(["", "", "", "", "", ""]);
            codeRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    /** 处理验证码输入框变化 */
    const handleCodeChange = async (index: number, value: string) => {
        const cleanValue = value.replace(/\D/g, "");
        const newCode = [...code];
        newCode[index] = cleanValue.slice(-1);
        setCode(newCode);

        if (cleanValue && index < 5) {
            codeRefs.current[index + 1]?.focus();
        }

        if (newCode.every((c) => c !== "") && index === 5) {
            await verifySmsCode(newCode.join(""));
        }
    };

    /** 处理验证码退格删除逻辑 */
    const handleKeyDown = (index: number, key: string) => {
        if (key === "Backspace" && !code[index] && index > 0) {
            codeRefs.current[index - 1]?.focus();
        }
    };

    /** 流程 3: 提交新密码重置 */
    const handleFinalSubmit = async () => {
        const errs: Record<string, string> = {};
        const pwdErr = validatePassword(password);
        const confirmErr = validateConfirmPassword(password, confirmPwd);

        if (pwdErr) errs.password = pwdErr;
        if (confirmErr) errs.confirmPwd = confirmErr;

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const res = await passwordApi.resetPassword(tempToken, password);
            if (res.code === 200) {
                logger.info({
                    module: "Auth_ForgetPassword",
                    operate: "RESET_PASSWORD_SUCCESS",
                    params: { token: '***' },
                    result: "Redirecting to Login",
                    requestId
                });
                setStep(4);
                setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 3000);
            } else {
                throw new Error(res.message || "更新失败");
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "系统错误";
            logger.error({
                module: "Auth_ForgetPassword",
                operate: "FINAL_SUBMIT_FAILED",
                params: { token: '***' },
                result: undefined,
                error: msg,
                errorType: "SUBMIT_ERROR",
                requestId
            });
            Alert.alert("错误", msg);
        } finally {
            setLoading(false);
        }
    };

    /** 密码强度计算属性 */
    const pwdStrength = useMemo(() => calculatePasswordStrength(password), [password]);

    return {
        step, setStep,
        phone, setPhone,
        code, setCode,
        password, setPassword,
        confirmPwd, setConfirmPwd,
        showPwd, setShowPwd,
        showConfirm, setShowConfirm,
        countdown,
        loading,
        errors,
        setErrors,
        pwdStrength,
        codeRefs,
        handleInitiateReset,
        handleCodeChange,
        handleKeyDown,
        handleFinalSubmit,
        verifySmsCode,
        router
    };
};