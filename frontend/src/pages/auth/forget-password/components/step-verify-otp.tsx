/**
 * @file step-verify-otp.tsx
 * @description 找回密码流程第二步：短信验证码输入组件。支持自动焦点切换与退格处理。
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import forgetPasswordStyles from '../forget-password.style';
import { COLORS } from '@/pages/style'
import { Button } from "@/../components/button";
import logger from '@/utils/logger';

interface StepVerifyOtpProps {
    /** 脱敏后的手机号 */
    phone: string;
    /** 6位验证码数组 */
    code: string[];
    /** 倒计时秒数 */
    countdown: number;
    /** 提交或发送中的加载状态 */
    loading: boolean;
    /** 输入框引用集合，用于焦点控制 */
    codeRefs: React.MutableRefObject<(TextInput | null)[]>;
    /** 验证码变更回调 @param index 位数索引 @param val 输入值 */
    onCodeChange: (index: number, val: string) => void;
    /** 按键监听回调（主要处理退格） @param index 位数索引 @param key 按键名称 */
    onKeyDown: (index: number, key: string) => void;
    /** 重新发送验证码回调 */
    onResend: () => void;
    /** 手动提交校验回调 */
    onSubmit: () => void;
    /** 全链路追踪 ID */
    requestId: string;
}

/**
 * 验证码输入步骤组件
 * @param props StepVerifyOtpProps
 */
export const StepVerifyOtp: React.FC<StepVerifyOtpProps> = ({
    phone, code, countdown, loading, codeRefs, onCodeChange, onKeyDown, onResend, onSubmit, requestId
}) => {

    /** 处理重新发送点击日志记录 */
    const handleResendPress = () => {
        logger.info({
            module: 'Auth_ForgetPassword',
            operate: 'CLICK_RESEND_CODE',
            params: { phone: '***' },
            result: 'Action Triggered',
            requestId
        });
        onResend();
    };

    return (
        <View style={forgetPasswordStyles.fullWidth}>
            <Text style={forgetPasswordStyles.stepHint}>
                验证码已发送至 <Text style={forgetPasswordStyles.boldText}>{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
            </Text>

            <View style={forgetPasswordStyles.otpContainer}>
                {code.map((digit, i) => (
                    <TextInput
                        key={i}
                        ref={(el) => { codeRefs.current[i] = el; }}
                        style={[
                            forgetPasswordStyles.otpInput,
                            digit ? forgetPasswordStyles.otpInputActive : forgetPasswordStyles.otpInputInactive
                        ]}
                        keyboardType="number-pad"
                        placeholderTextColor={COLORS.textPlaceholder}
                        maxLength={1}
                        value={digit}
                        onKeyPress={({ nativeEvent }) => onKeyDown(i, nativeEvent.key)}
                        onChangeText={(val) => onCodeChange(i, val)}
                        autoFocus={i === 0}
                    />
                ))}
            </View>

            <TouchableOpacity
                disabled={countdown > 0 || loading}
                onPress={handleResendPress}
                style={forgetPasswordStyles.resendBtn}
                activeOpacity={0.7}
            >
                <Text style={[forgetPasswordStyles.resendText, countdown > 0 && forgetPasswordStyles.disabledText]}>
                    {countdown > 0 ? `${countdown}s 后重新发送` : "重新获取验证码"}
                </Text>
            </TouchableOpacity>

            <Button
                disabled={code.some(c => !c) || loading}
                onPress={onSubmit}
                loading={loading}
                style={forgetPasswordStyles.submitBtn}
            >
                确认验证
            </Button>
        </View>
    );
};

export default StepVerifyOtp;