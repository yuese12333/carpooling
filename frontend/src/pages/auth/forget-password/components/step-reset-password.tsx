/**
 * @file step-reset-password.tsx
 * @description 找回密码流程第三步：设置新密码界面。包含强度检测显示、双重确认逻辑及可见性切换。
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Lock, Eye, EyeOff } from "lucide-react-native";
import forgetPasswordStyles from '@/pages/auth/forget-password/forget-password.style';
import { COLORS } from '@/pages/style'
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import { Progress } from "@/components/progress";
import { MIN_PASSWORD_LENGTH } from '@/utils/validator';

/** 强度信息接口定义 */
interface StrengthInfo {
    /** 提示文本 */
    text: string;
    /** 进度条颜色 */
    color: string;
    /** 文本颜色 */
    textColor: string;
}

interface StepResetPasswordProps {
    /** 当前输入的密码 */
    password: string;
    /** 确认密码输入 */
    confirmPwd: string;
    /** 是否显示密码明文 */
    showPwd: boolean;
    /** 是否显示确认密码明文 */
    showConfirm: boolean;
    /** 表单错误集合 */
    errors: Record<string, string>;
    /** 密码强度数值 (0-100) */
    pwdStrength: number;
    /** 提交加载状态 */
    loading: boolean;
    /** 切换密码可见性回调 */
    onTogglePwd: () => void;
    /** 切换确认密码可见性回调 */
    onToggleConfirm: () => void;
    /** 密码变更回调 */
    onPasswordChange: (val: string) => void;
    /** 确认密码变更回调 */
    onConfirmPwdChange: (val: string) => void;
    /** 提交保存回调 */
    onSubmit: () => void;
    /** 强度视觉信息配置 */
    strengthInfo: StrengthInfo;
}

/**
 * 重置密码步骤组件
 * @param props StepResetPasswordProps
 * @returns React.FC
 */
export const StepResetPassword: React.FC<StepResetPasswordProps> = ({
    password,
    confirmPwd,
    showPwd,
    showConfirm,
    errors,
    pwdStrength,
    loading,
    onTogglePwd,
    onToggleConfirm,
    onPasswordChange,
    onConfirmPwdChange,
    onSubmit,
    strengthInfo
}) => (
    <View style={forgetPasswordStyles.fullWidth}>
        {/* 新密码输入区块 */}
        <View style={forgetPasswordStyles.inputGroup}>
            <Label style={forgetPasswordStyles.label}>新密码</Label>
            <View style={[forgetPasswordStyles.inputWrapper, errors.password && forgetPasswordStyles.inputError]}>
                <Lock size={18} color={COLORS.textPlaceholder} style={forgetPasswordStyles.inputIcon} />
                <TextInput
                    secureTextEntry={!showPwd}
                    placeholder={`设置新密码（至少${MIN_PASSWORD_LENGTH}位）`}
                    placeholderTextColor={COLORS.textPlaceholder}
                    style={forgetPasswordStyles.input}
                    value={password}
                    onChangeText={onPasswordChange}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={onTogglePwd}
                    activeOpacity={0.6}
                    accessibilityLabel="切换密码显示"
                >
                    {showPwd ? (
                        <EyeOff size={18} color={COLORS.textPlaceholder} />
                    ) : (
                        <Eye size={18} color={COLORS.textPlaceholder} />
                    )}
                </TouchableOpacity>
            </View>

            {/* 密码强度动态指示器 */}
            {password.length > 0 && (
                <View style={forgetPasswordStyles.strengthContainer}>
                    <Progress
                        value={pwdStrength}
                        style={[forgetPasswordStyles.progressBase, { backgroundColor: strengthInfo.color }]}
                    />
                    <Text style={[forgetPasswordStyles.strengthText, { color: strengthInfo.textColor }]}>
                        安全性：{strengthInfo.text}
                    </Text>
                </View>
            )}
            {errors.password && <Text style={forgetPasswordStyles.errorText}>{errors.password}</Text>}
        </View>

        {/* 确认密码输入区块 */}
        <View style={forgetPasswordStyles.inputGroup}>
            <Label style={forgetPasswordStyles.label}>确认新密码</Label>
            <View style={[forgetPasswordStyles.inputWrapper, errors.confirmPwd && forgetPasswordStyles.inputError]}>
                <Lock size={18} color={COLORS.textPlaceholder} style={forgetPasswordStyles.inputIcon} />
                <TextInput
                    secureTextEntry={!showConfirm}
                    placeholder="再次输入以确认"
                    placeholderTextColor={COLORS.textPlaceholder}
                    style={forgetPasswordStyles.input}
                    value={confirmPwd}
                    onChangeText={onConfirmPwdChange}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={onToggleConfirm}
                    activeOpacity={0.6}
                    accessibilityLabel="切换确认密码显示"
                >
                    {showConfirm ? (
                        <EyeOff size={18} color={COLORS.textPlaceholder} />
                    ) : (
                        <Eye size={18} color={COLORS.textPlaceholder} />
                    )}
                </TouchableOpacity>
            </View>
            {errors.confirmPwd && <Text style={forgetPasswordStyles.errorText}>{errors.confirmPwd}</Text>}
        </View>

        {/* 提交动作按钮 */}
        <Button
            onPress={onSubmit}
            loading={loading}
            style={forgetPasswordStyles.submitBtn}
        >
            <Text style={forgetPasswordStyles.submitBtnText}>保存设置</Text>
        </Button>
    </View>
);

export default StepResetPassword;