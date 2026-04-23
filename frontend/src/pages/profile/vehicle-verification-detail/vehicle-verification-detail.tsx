/**
 * @file vehicle-verification-detail.tsx
 * @description 车辆认证详情页面入口，负责初始化链路追踪并注入业务逻辑
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import {
    ChevronLeft,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    FileText,
    Camera,
    Zap,
    Star,
    Lock
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 工程化组件与工具
import { useVehicleVerificationDetail } from "@/hooks/use-vehicle-verification-form";
import { generateRequestId } from '@/utils/logger';
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/separator";
import styles, { COLORS } from "./vehicle-verification-detail.style";

/**
 * 车辆认证详情页面组件
 */
export default function VehicleVerificationPage() {
    // 1. RequestId 独立化原则：在页面入口生成并保持稳定
    const requestId = useMemo(() => generateRequestId(), []);

    // 2. 显式传递与注入：将 ID 注入业务 Hook
    const { loading, detail, handleBack } = useVehicleVerificationDetail(requestId);

    // 辅助渲染逻辑
    const getBenefitConfig = (type: string) => {
        switch (type) {
            case 'badge':
                return { bgColor: COLORS.primaryLight, icon: <Star size={20} color={COLORS.primary} /> };
            case 'order':
                return { bgColor: COLORS.infoLight, icon: <Zap size={20} color={COLORS.info} /> };
            case 'safety':
                return { bgColor: COLORS.warningLight, icon: <ShieldCheck size={20} color={COLORS.warning} /> };
            default:
                return { bgColor: COLORS.bgLight, icon: undefined };
        }
    };

    // 状态守卫：加载中状态
    if (loading && !detail) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    // 状态守卫：无数据状态
    if (!detail) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 导航栏 */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>认证详情</Text>
                <View style={{ width: 32 }} />
            </View>

            {/* ScrollView 修复：添加 keyboardShouldPersistTaps */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* 1. 状态头部 */}
                <View style={styles.headerCard}>
                    <View style={styles.statusIconWrapper}>
                        <ShieldCheck size={48} color={COLORS.white} />
                    </View>
                    <Text style={styles.statusTitle}>
                        {detail.status === 'passed' ? '审核已通过' : '审核中'}
                    </Text>
                    <Text style={styles.statusDate}>核验时间：{detail.verifyDate}</Text>
                    {detail.isValidLongTerm && (
                        <Badge variant="secondary" style={styles.validBadge}>
                            <Text style={styles.validText}>长期有效</Text>
                        </Badge>
                    )}
                </View>

                <View style={styles.contentPadding}>
                    {/* 2. 核验指标 */}
                    <Card style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>核验指标</Text>
                        <View style={styles.stepsList}>
                            {detail.steps.map((step, index) => (
                                <View key={step.id}>
                                    <View style={styles.stepItem}>
                                        <View style={styles.stepIcon}>
                                            <CheckCircle2 size={20} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.stepText}>
                                            <Text style={styles.stepLabel}>{step.label}</Text>
                                            <Text style={styles.stepDesc}>{step.desc}</Text>
                                        </View>
                                    </View>
                                    {index < detail.steps.length - 1 && <Separator style={styles.stepLine} />}
                                </View>
                            ))}
                        </View>
                    </Card>

                    {/* 3. 认证档案 */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>认证档案</Text>
                    </View>

                    <View style={styles.archiveGrid}>
                        <TouchableOpacity activeOpacity={0.7} style={styles.archiveItem}>
                            <View style={styles.imagePlaceholder}>
                                <FileText size={24} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.archiveLabel}>行驶证主页</Text>
                            <View style={styles.lockIcon}><Lock size={10} color={COLORS.white} /></View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} style={styles.archiveItem}>
                            <View style={styles.imagePlaceholder}>
                                <Camera size={24} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.archiveLabel}>45度车身照</Text>
                            <View style={styles.lockIcon}><Lock size={10} color={COLORS.white} /></View>
                        </TouchableOpacity>
                    </View>

                    {/* 4. 认证权益 */}
                    <Card style={styles.benefitCard}>
                        <View style={styles.benefitHeader}>
                            <Zap size={18} color={COLORS.warning} />
                            <Text style={styles.benefitTitle}>认证车主权益</Text>
                        </View>

                        <View style={styles.benefitRow}>
                            {detail.benefits.map((benefit) => {
                                const config = getBenefitConfig(benefit.type);
                                return (
                                    <View key={benefit.id} style={styles.benefitItem}>
                                        <View style={[styles.benefitIconBox, { backgroundColor: config.bgColor }]}>
                                            {config.icon}
                                        </View>
                                        <Text style={styles.benefitText}>{benefit.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>

                    {/* 5. 注意事项 */}
                    <View style={styles.noticeBox}>
                        <AlertCircle size={16} color={COLORS.textMuted} />
                        <Text style={styles.noticeText}>
                            如车辆信息发生变更，请务必重新发起认证，以免影响您的正常接单。
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}