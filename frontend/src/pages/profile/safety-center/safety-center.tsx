/**
 * @file safety-center.tsx
 * @description 安全中心页面，汇聚安全相关功能
 */

import React, { useMemo, JSX } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Phone, Shield, Bell, AlertTriangle, FileText, HelpCircle } from "lucide-react-native";

import { ROUTES } from "@/router/paths";
import { generateRequestId } from '@/utils/logger';
import { t } from '@/i18n';
import { COLORS } from "@/pages/style";

interface SafetyItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    onPress: () => void;
}

export default function SafetyCenterPage(): JSX.Element {
    const requestId = useMemo(() => generateRequestId(), []);
    const router = useRouter();

    const safetyItems: SafetyItem[] = [
        {
            icon: <Phone size={24} color={COLORS.danger} />,
            title: t('profile.emergencyContact'),
            description: "设置紧急联系人，行程开始时自动通知",
            color: COLORS.danger,
            bgColor: COLORS.errorLight,
            onPress: () => router.push(ROUTES.PROFILE.EMERGENCY_CONTACT as any),
        },
        {
            icon: <Shield size={24} color={COLORS.primary} />,
            title: "行程安全",
            description: "实时位置共享，保障出行安全",
            color: COLORS.primary,
            bgColor: COLORS.bgBlueLight,
            onPress: () => Alert.alert("提示", "行程安全功能将在您行程开始时自动开启"),
        },
        {
            icon: <Bell size={24} color={COLORS.info} />,
            title: "安全通知",
            description: "接收行程状态变更和安全提醒",
            color: COLORS.info,
            bgColor: COLORS.bgBlueLight,
            onPress: () => router.push(ROUTES.PROFILE.NOTIFICATION as any),
        },
        {
            icon: <FileText size={24} color={COLORS.textSecondary} />,
            title: "安全须知",
            description: "出行安全指南与注意事项",
            color: COLORS.textSecondary,
            bgColor: COLORS.bgGrey,
            onPress: () => router.push(ROUTES.PROFILE.HELP_CENTER as any),
        },
    ];

    const emergencyTips = [
        "行程开始前，请核对车牌号和司机信息",
        "建议将行程分享给亲友",
        "如遇紧急情况，请立即报警或联系平台客服",
        "不要在车内透露个人隐私信息",
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← {t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>安全中心</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* 紧急求助 */}
                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => Alert.alert("紧急求助", "此功能将拨打紧急联系人电话或报警")}
                >
                    <AlertTriangle size={32} color={COLORS.white} />
                    <Text style={styles.emergencyText}>紧急求助</Text>
                </TouchableOpacity>

                {/* 功能入口 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>安全功能</Text>
                    {safetyItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.itemCard}
                            onPress={item.onPress}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                                {item.icon}
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDesc}>{item.description}</Text>
                            </View>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 安全提示 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>安全提示</Text>
                    <View style={styles.tipsCard}>
                        {emergencyTips.map((tip, index) => (
                            <View key={index} style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 客服电话 */}
                <View style={styles.contactSection}>
                    <HelpCircle size={20} color={COLORS.textSecondary} />
                    <Text style={styles.contactText}>
                        如需帮助，请联系客服：400-xxx-xxxx
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: COLORS.bgGrey,
    },
    header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: 8,
        width: 80,
    },
    backText: {
        fontSize: 16,
        color: COLORS.primary,
    },
    title: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: COLORS.textPrimary,
    },
    placeholder: {
        width: 80,
    },
    content: {
        flex: 1,
    },
    emergencyButton: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        backgroundColor: COLORS.danger,
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 20,
        borderRadius: 12,
    },
    emergencyText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "700" as const,
        marginLeft: 12,
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    itemContent: {
        flex: 1,
        marginLeft: 14,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "500" as const,
        color: COLORS.textPrimary,
    },
    itemDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    arrow: {
        fontSize: 20,
        color: COLORS.textMuted,
    },
    tipsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
    },
    tipItem: {
        flexDirection: "row" as const,
        alignItems: "flex-start" as const,
        marginBottom: 12,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 6,
        marginRight: 10,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    contactSection: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        paddingVertical: 20,
        marginBottom: 20,
    },
    contactText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
};
