/**
 * @file step-password-form.tsx
 * @description 用户注册流程第二步：密码设置、强度校验及协议签署
 * @version 1.1.0
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, Check } from "lucide-react-native";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Progress } from "@/components/progress";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import styles, { COLORS } from "../register.style";
import { RegistrationFormData } from '@/hooks/use-register-form';

/**
 * @interface StepPasswordFormProps
 * @description 密码表单组件属性定义
 */
interface StepPasswordFormProps {
    state: {
        formData: {
            password: string;
            confirmPassword: string;
            isAgreed: boolean;
        };
        fieldErrors: {
            password?: string;
            confirmPassword?: string;
            isAgreed?: string;
            general?: string;
        };
        passwordStrengthScore: number;
        isLoading: boolean;
    };
    actions: {
        updateForm: <K extends keyof RegistrationFormData>(key: K, value: RegistrationFormData[K]) => void;
        handleFinalRegistration: () => Promise<void>;
    };
}

export const StepPasswordForm: React.FC<StepPasswordFormProps> = ({ state, actions }) => {
    // 强制获取全局链路 ID，严禁在此 generate
    const currentRequestId = useEnvStore.getState().currentRequestId;

    /**
     * 切换协议勾选状态
     * 记录用户交互行为日志
     */
    const handleToggleAgreement = () => {
        const nextStatus = !state.formData.isAgreed;
        actions.updateForm('isAgreed', nextStatus);

        logger.info({
            module: 'Register',
            operate: 'TOGGLE_AGREEMENT',
            params: { isAgreed: nextStatus },
            requestId: currentRequestId
        });
    };

    /**
     * 执行最终注册提交
     * 包含业务起点日志、链路追踪及异常拦截
     */
    const onSubmitRegistration = async () => {
        logger.info({
            module: 'Register',
            operate: 'SUBMIT_REGISTRATION_TRIGGER',
            params: {
                hasPassword: !!state.formData.password,
                isAgreed: state.formData.isAgreed
            },
            requestId: currentRequestId
        });

        try {
            await actions.handleFinalRegistration();

            logger.info({
                module: 'Register',
                operate: 'SUBMIT_REGISTRATION_SUCCESS',
                result: 'SUCCESS',
                requestId: currentRequestId
            });
        } catch (error) {
            logger.error({
                module: 'Register',
                operate: 'SUBMIT_REGISTRATION_ERROR',
                error: error instanceof Error ? error.message : 'Unknown registration error',
                errorType: 'FINAL_SUBMIT_FAILED',
                requestId: currentRequestId
            });
        }
    };

    return (
        <View>
            <Text style={styles.inputLabel}>设置密码</Text>
            <Input
                secureTextEntry
                placeholder="8-20位，含字母和数字"
                value={state.formData.password}
                onChangeText={(val) => actions.updateForm('password', val)}
                leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
            />
            {state.fieldErrors.password && (
                <Text style={styles.errorText}>{state.fieldErrors.password}</Text>
            )}

            {state.formData.password.length > 0 && (
                <View style={styles.strengthContainer}>
                    <Progress
                        value={state.passwordStrengthScore}
                        style={styles.strengthProgress}
                    />
                    <Text style={styles.strengthLabel}>密码强度</Text>
                </View>
            )}

            <Text style={[styles.inputLabel, styles.marginTopMd]}>确认密码</Text>
            <Input
                secureTextEntry
                placeholder="请再次输入密码"
                value={state.formData.confirmPassword}
                onChangeText={(val) => actions.updateForm('confirmPassword', val)}
                leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
            />
            {state.fieldErrors.confirmPassword && (
                <Text style={styles.errorText}>{state.fieldErrors.confirmPassword}</Text>
            )}

            <TouchableOpacity
                onPress={handleToggleAgreement}
                style={styles.agreementRow}
                activeOpacity={0.8}
            >
                <View style={[
                    styles.checkbox,
                    state.formData.isAgreed ? styles.checkboxActive : styles.checkboxInactive
                ]}>
                    {state.formData.isAgreed && <Check size={12} color="white" strokeWidth={4} />}
                </View>
                <Text style={styles.agreementText}>
                    我已阅读并同意 <Text style={styles.agreementLink}>《用户协议》</Text>
                </Text>
            </TouchableOpacity>
            {state.fieldErrors.isAgreed && (
                <Text style={styles.errorText}>{state.fieldErrors.isAgreed}</Text>
            )}

            {state.fieldErrors.general && (
                <View style={styles.generalErrorBox}>
                    <Text style={styles.generalErrorText}>{state.fieldErrors.general}</Text>
                </View>
            )}

            <Button
                disabled={state.isLoading}
                style={styles.submitButton}
                onPress={onSubmitRegistration}
            >
                <Text style={styles.buttonText}>
                    {state.isLoading ? "正在提交注册..." : "完成注册"}
                </Text>
            </Button>
        </View>
    );
};