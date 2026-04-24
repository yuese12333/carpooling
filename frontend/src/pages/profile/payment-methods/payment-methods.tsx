/**
 * @file payment-methods.tsx
 * @description 支付方式管理页面。支持余额展示、支付渠道切换及安全设置。
 * 集成了严谨的链路追踪 (RequestId) 与结构化日志审计。
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets
} from "react-native-safe-area-context"; // 规范：统一使用 context 版本
import {
    ChevronLeft,
    Plus,
    CreditCard,
    Wallet,
    CheckCircle2,
    Circle,
    History,
    ShieldCheck,
    ChevronRight,
    Info
} from "lucide-react-native";
import { ROUTES } from "@/router/paths";
import { useRouter } from 'expo-router';

// 引入工具与日志规范
import logger, { generateRequestId } from '@/utils/logger';

// 导入 UI 组件
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/separator";

// 导入样式与 Hook
import styles from "./payment-methods.style";
import { COLORS } from "@/pages/style";
import { usePaymentMethods } from "@/hooks/use-payment-methods-form";

export default function PaymentMethodsPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 1. 链路追踪原则：自生成页面级唯一 requestId，确保生命周期内稳定
    const requestId = useMemo(() => generateRequestId(), []);

    // 2. 调用业务 Hook，并遵循“显式传递”原则（Hook 内部已适配 requestId）
    const {
        balance,
        methods,
        handleSetDefault,
        handleAddMethod,
        goBack
    } = usePaymentMethods(requestId);

    /**
     * 处理跳转记录日志
     * @param path 目标路径
     * @param label 业务操作描述
     */
    const handleNavigation = (path: string, label: string) => {
        logger.info({
            module: 'PaymentMethodsPage',
            operate: `MapsTo:${label}`,
            params: { path },
            result: 'Success',
            requestId
        });
        router.push(path as any);
    };

    return (
        // 规范：使用 react-native-safe-area-context 提供的组件
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* 自定义导航栏 */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={goBack} style={styles.navBack}>
                    <ChevronLeft size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>支付方式</Text>
                <TouchableOpacity
                    onPress={() => handleNavigation(ROUTES.PROFILE.PAYMENT_HISTORY, 'PaymentHistory')}
                    style={styles.infoBtn}
                >
                    <History size={20} color={COLORS.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                // 规范修复：修复键盘弹出时点击被“吞掉”的问题
                keyboardShouldPersistTaps="handled"
            >
                {/* 余额卡片 */}
                <Card
                    className="bg-emerald-500 border-0 shadow-lg shadow-emerald-200 mb-8"
                    style={styles.balanceCardInner}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Wallet size={25} color="white" opacity={0.8} />
                            <Text className="text-white opacity-80 text-sm ml-2">账户余额 (元)</Text>
                        </View>
                        <TouchableOpacity
                            className="p-1.5 bg-white/10 rounded-lg"
                            onPress={() => {
                                logger.info({
                                    module: 'PaymentMethodsPage',
                                    operate: 'ClickBalanceInfo',
                                    requestId
                                });
                            }}
                        >
                            <Info size={20} color="white" opacity={0.6} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white text-2xl font-bold my-5 tracking-tight">
                        ¥ {balance.toFixed(2)}
                    </Text>

                    <View className="flex-row items-center mt-2 bg-white/20 rounded-xl py-1">
                        <TouchableOpacity className="flex-1 items-center">
                            <Text className="text-white font-semibold text-base">充值</Text>
                        </TouchableOpacity>
                        <View style={styles.balanceDivider} />
                        <TouchableOpacity className="flex-1 items-center">
                            <Text className="text-white font-semibold text-base">提现</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>已绑定支付方式</Text>
                    <Text style={styles.sectionSub}>选择默认扣款渠道</Text>
                </View>

                {methods.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Card style={[
                            styles.methodItem,
                            item.isDefault && styles.methodItemActive
                        ]}>
                            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                                <CreditCard size={20} color={item.color} />
                            </View>

                            <View style={styles.methodInfo}>
                                <View style={styles.methodNameRow}>
                                    <Text style={styles.methodName}>{item.name}</Text>
                                    {item.isDefault && (
                                        <Badge variant="secondary" style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>默认</Text>
                                        </Badge>
                                    )}
                                </View>
                                <Text style={styles.methodSub}>{item.sub}</Text>
                            </View>

                            <View style={styles.checkArea}>
                                {item.isDefault ? (
                                    <CheckCircle2 size={22} color={COLORS.primary} />
                                ) : (
                                    <Circle size={22} color={COLORS.textMuted} />
                                )}
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleAddMethod}
                    activeOpacity={0.7}
                >
                    <Plus size={20} color={COLORS.textSecondary} />
                    <Text style={styles.addBtnText}>添加银行卡或支付方式</Text>
                </TouchableOpacity>

                <View style={styles.securityBox}>
                    <ShieldCheck size={14} color={COLORS.textMuted} />
                    <Text style={styles.securityText}>支付环境已通过系统加密保护，确保您的资金安全</Text>
                </View>

                <Card style={styles.settingCard}>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>小额免密支付</Text>
                        <View style={styles.settingRight}>
                            <Text style={styles.settingValue}>已开启</Text>
                            <ChevronRight size={16} color={COLORS.textMuted} />
                        </View>
                    </TouchableOpacity>
                    <Separator />
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingLabel}>自动扣款管理</Text>
                        <ChevronRight size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </Card>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* 底部固定区域，适配安全区底部高度 */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Button
                    className="w-full h-12 rounded-full"
                    style={styles.footerBtn}
                    onPress={goBack}
                >
                    <Text style={styles.footerBtnText}>完成设置</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}