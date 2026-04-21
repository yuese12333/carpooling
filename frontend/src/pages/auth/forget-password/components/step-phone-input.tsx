/**
 * @file step-phone-input.tsx
 * @description 找回密码第一步：手机号输入与校验。
 */
import React from 'react';
import { View, Text, TextInput, ActivityIndicator, } from 'react-native';
import { Phone } from "lucide-react-native";
import forgetPasswordStyles, { COLORS } from '../forget-password.style';
import { Button } from "@/../components/button";
import { Label } from "@/../components/label";

interface StepPhoneInputProps {
    /** 手机号 */
    phone: string;
    /** 错误信息 */
    error?: string;
    /** 加载状态 */
    loading: boolean;
    /** 变更回调 */
    onChangePhone: (val: string) => void;
    /** 提交下一步 */
    onSubmit: () => void;
}

/**
 * 手机号输入步骤组件
 * @param props StepPhoneInputProps
 */
export const StepPhoneInput: React.FC<StepPhoneInputProps> = ({
    phone,
    error,
    loading,
    onChangePhone,
    onSubmit
}) => (
    <View style={forgetPasswordStyles.fullWidth}>
        <Label style={forgetPasswordStyles.label}>手机号码</Label>
        <View style={[forgetPasswordStyles.inputWrapper, error && forgetPasswordStyles.inputError]}>
            <Phone size={18} color={COLORS.textPlaceholder} style={forgetPasswordStyles.inputIcon} />
            <Text style={forgetPasswordStyles.prefix}>+86</Text>
            <TextInput
                placeholder="请输入注册手机号"
                placeholderTextColor={COLORS.textPlaceholder}
                style={forgetPasswordStyles.input}
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={onChangePhone}
            />
        </View>
        {error && <Text style={forgetPasswordStyles.errorText}>{error}</Text>}

        <Button
            onPress={onSubmit}
            loading={loading}
            style={forgetPasswordStyles.submitBtn}
        >
            {loading ? (
                <ActivityIndicator color={COLORS.white} />
            ) : (
                <Text style={forgetPasswordStyles.submitBtnText}>下一步</Text>
            )}
        </Button>
    </View>
);

export default StepPhoneInput;