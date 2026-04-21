/**
 * @file password-header.tsx
 * @description 找回密码流程的顶部导航与进度指示器组件。
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Check } from "lucide-react-native";
import forgetPasswordStyles, { COLORS } from '../forget-password.style';

interface PasswordHeaderProps {
    /** 当前步骤 1-4 */
    step: number;
    /** 返回回调 */
    onBack: () => void;
    /** 标题文本 */
    title: string;
    /** 副标题文本 */
    subtitle: string;
}

/**
 * 找回密码头部组件
 * @param props PasswordHeaderProps
 */
export const PasswordHeader: React.FC<PasswordHeaderProps> = ({ step, onBack, title, subtitle }) => (
    <View style={forgetPasswordStyles.header}>
        <TouchableOpacity onPress={onBack} style={forgetPasswordStyles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={forgetPasswordStyles.headerContent}>
            <Text style={forgetPasswordStyles.headerTitle}>{title}</Text>
            <Text style={forgetPasswordStyles.headerSubtitle}>{subtitle}</Text>
        </View>

        {step < 4 && (
            <View style={forgetPasswordStyles.stepperContainer}>
                <View style={forgetPasswordStyles.stepperLine} />
                {[1, 2, 3].map((s) => (
                    <View
                        key={s}
                        style={[
                            forgetPasswordStyles.stepCircle,
                            step >= s ? forgetPasswordStyles.stepCircleActive : forgetPasswordStyles.stepCircleInactive
                        ]}
                    >
                        {step > s ? (
                            <Check size={14} color={COLORS.primary} strokeWidth={3} />
                        ) : (
                            <Text
                                style={[
                                    forgetPasswordStyles.stepText,
                                    step >= s ? forgetPasswordStyles.stepTextActive : forgetPasswordStyles.stepTextInactive
                                ]}
                            >
                                {s}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        )}
    </View>
);

export default PasswordHeader;