/**
 * @file step-info-form.tsx
 * @description 用户注册流程第一步：基础信息采集表单（包含昵称、手机号及验证码校验）
 * @version 1.1.0
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Phone, ShieldCheck } from "lucide-react-native";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import logger from '@/utils/logger';
import styles from "../register.style";
import { COLORS } from '@/pages/style';
import { RegistrationFormData } from '@/hooks/use-register-form';

/**
 * @interface StepInfoFormProps
 * @description 组件属性定义
 * @property {any} state - 外部传入的表单状态对象
 * @property {any} actions - 外部传入的行为处理函数集合
 */
interface StepInfoFormProps {
    requestId: string;
    state: {
        formData: {
            nickname: string;
            phoneNumber: string;
            verifyCode: string;
        };
        fieldErrors: Record<string, string>;
        countdown: number;
        isLoading: boolean;
    };
    actions: {
        updateForm: <K extends keyof RegistrationFormData>(key: K, value: RegistrationFormData[K]) => void;
        handleSendVerificationCode: () => Promise<void>;
        navigateToStepTwo: () => Promise<void>;
    };
}

export const StepInfoForm: React.FC<StepInfoFormProps> = ({ requestId, state, actions }) => {
    const currentRequestId = requestId;

    /**
     * 处理验证码发送点击
     * 包含 Page 层的业务起点日志记录
     */
    const onSendVerifyCode = async () => {
        logger.info({
            module: 'Register',
            operate: 'SEND_VERIFY_CODE_CLICK',
            params: { phoneNumber: state.formData.phoneNumber?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
            requestId: currentRequestId
        });

        try {
            await actions.handleSendVerificationCode();
        } catch (error) {
            logger.error({
                module: 'Register',
                operate: 'SEND_VERIFY_CODE_FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                errorType: 'ASYNC_LOGIC_ERROR',
                requestId: currentRequestId
            });
        }
    };

    /**
     * 处理下一步跳转
     * 记录业务流转日志
     */
    const onStepForward = async () => {
        logger.info({
            module: 'Register',
            operate: 'NAVIGATE_TO_STEP_TWO_TRIGGER',
            params: { nickname: state.formData.nickname },
            requestId: currentRequestId
        });

        try {
            await actions.navigateToStepTwo();
        } catch (error) {
            logger.error({
                module: 'Register',
                operate: 'STEP_ONE_VALIDATION_FAILED',
                error: error instanceof Error ? error.message : 'Validation failed',
                errorType: 'BUSINESS_CHECK_ERROR',
                requestId: currentRequestId
            });
        }
    };

    return (
        <View>
            <Text style={styles.inputLabel}>昵称</Text>
            <Input
                placeholder="请输入您的昵称"
                value={state.formData.nickname}
                onChangeText={(val) => actions.updateForm('nickname', val)}
                leftIcon={<User size={18} color={COLORS.textSecondary} />}
            />
            {state.fieldErrors.nickname && (
                <Text style={styles.generalErrorText}>{state.fieldErrors.nickname}</Text>
            )}

            <Text style={[styles.inputLabel, styles.marginTopMd]}>手机号</Text>
            <Input
                placeholder="请输入11位手机号"
                keyboardType="phone-pad"
                value={state.formData.phoneNumber}
                onChangeText={(val) => actions.updateForm('phoneNumber', val.replace(/\D/g, ""))}
                leftIcon={<Phone size={18} color={COLORS.textSecondary} />}
            />
            {state.fieldErrors.phoneNumber && (
                <Text style={styles.generalErrorText}>{state.fieldErrors.phoneNumber}</Text>
            )}

            <Text style={[styles.inputLabel, styles.marginTopMd]}>验证码</Text>
            <View style={styles.verifyRow}>
                <View style={styles.flexOne}>
                    <Input
                        placeholder="6位验证码"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={state.formData.verifyCode}
                        onChangeText={(val) => actions.updateForm('verifyCode', val.replace(/\D/g, ""))}
                        leftIcon={<ShieldCheck size={18} color={COLORS.textSecondary} />}
                    />
                </View>
                <TouchableOpacity
                    onPress={onSendVerifyCode}
                    disabled={state.countdown > 0 || state.isLoading}
                    style={[
                        styles.verifyButton,
                        state.countdown > 0 ? styles.bgGray : styles.bgLightGreen
                    ]}
                >
                    <Text style={[
                        styles.verifyButtonText,
                        state.countdown > 0 ? styles.textGray : styles.textGreen
                    ]}>
                        {state.countdown > 0 ? `${state.countdown}s` : "获取验证码"}
                    </Text>
                </TouchableOpacity>
            </View>
            {state.fieldErrors.verifyCode && (
                <Text style={styles.generalErrorText}>{state.fieldErrors.verifyCode}</Text>
            )}

            <Button
                style={styles.submitButton}
                onPress={onStepForward}
                disabled={state.isLoading}
            >
                <Text style={styles.primaryButtonText}>
                    {state.isLoading ? "正在校验..." : "下一步"}
                </Text>
            </Button>
        </View>
    );
};

export default StepInfoForm;