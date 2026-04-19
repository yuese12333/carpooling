/**
 * @file password-header.tsx
 * @description 找回密码流程的顶部导航与进度指示器组件。
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Check } from "lucide-react-native";
import styles, { COLORS } from '../forget-password.style';

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
    <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        {step < 4 && (
            <View style={styles.stepperContainer}>
                <View style={styles.stepperLine} />
                {[1, 2, 3].map((s) => (
                    <View
                        key={s}
                        style={[
                            styles.stepCircle,
                            step >= s ? styles.stepCircleActive : styles.stepCircleInactive
                        ]}
                    >
                        {step > s ? (
                            <Check size={14} color={COLORS.primary} strokeWidth={3} />
                        ) : (
                            <Text
                                style={[
                                    styles.stepText,
                                    step >= s ? styles.stepTextActive : styles.stepTextInactive
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