/**
 * @file invite-friends.tsx
 * @description 邀请好友页面。负责展示邀请码、统计数据、玩法说明，并处理分享与复制交互。
 * 注入了页面级唯一的 requestId 以确保链路追踪的完整性。
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator
} from "react-native";
// 规范：使用 react-native-safe-area-context 替代原生的 SafeAreaView
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { ChevronLeft, Copy, Share2, Gift, Info } from "lucide-react-native";

// 链路追踪与日志
import logger, { generateRequestId } from '@/utils/logger';

// 自定义 Hook 与样式
import { useInviteFriendsForm } from "@/hooks/use-invite-friends-form";
import styles, { COLORS } from "./invite-friends.style";
import { SPACING, LAYOUT_MIXINS, commonStyles } from "@/pages/style";
import { Separator } from "@/components/separator";

export default function InviteFriendsPage() {
    const router = useRouter();

    /**
     * 规范：页面级 requestId 独立化原则。
     * 使用 useMemo 确保 requestId 在组件生命周期内唯一且稳定，不随重绘改变。
     */
    const requestId = useMemo(() => generateRequestId(), []);

    /**
     * 规范：显式传递 requestId。
     * 将 requestId 注入 Hook，确保 Hook 内部的 API 调用能携带此追踪 ID。
     */
    const {
        loading,
        inviteCode,
        stats,
        handleCopyToClipboard,
        handleShare,
        handleBack
    } = useInviteFriendsForm(requestId);

    // 页面加载日志记录
    React.useEffect(() => {
        logger.info({
            module: 'InviteFriends',
            operate: 'Page_Mount',
            params: { requestId },
            result: 'Invite friends page initialized',
            requestId
        });
    }, [requestId]);

    if (loading) {
        return (
            <View style={[commonStyles.safeAreaContainer, LAYOUT_MIXINS.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={commonStyles.safeAreaContainer} edges={['top', 'left', 'right']}>
            {/* 导航栏 */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                    <ChevronLeft size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>邀请好友</Text>
                <View style={{ width: 32 }} />
            </View>

            {/* * 规范修复：ScrollView 必须添加 keyboardShouldPersistTaps="handled" 
              */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.topHeader, { backgroundColor: COLORS.primary }]}>

                    <View style={[LAYOUT_MIXINS.center, styles.heroSection]}>
                        <View style={styles.iconCircle}>
                            <Gift size={48} color={COLORS.primary} />
                        </View>
                        <Text style={styles.heroTitle}>邀请好友，各得大礼</Text>
                        <Text style={styles.heroSubTitle}>每成功邀请一位好友，立得 ￥10 优惠券</Text>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.inviteCard}>
                        <Text style={styles.cardLabel}>您的专属邀请码</Text>
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>{inviteCode || '------'}</Text>
                            <TouchableOpacity
                                onPress={handleCopyToClipboard}
                                style={styles.copyBadge}
                                activeOpacity={0.6}
                            >
                                <Copy size={16} color={COLORS.primary} />
                                <Text style={styles.copyText}>复制</Text>
                            </TouchableOpacity>
                        </View>

                        <Separator style={{ marginVertical: SPACING.lg }} />

                        <View style={styles.optimizedStatsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats?.successCount ?? 0}</Text>
                                <Text style={styles.statLabel}>成功邀请</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>￥{stats?.totalReward ?? 0}</Text>
                                <Text style={styles.statLabel}>累计奖励</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats?.pendingCoupons ?? 0}</Text>
                                <Text style={styles.statLabel}>待领取券</Text>
                            </View>
                        </View>
                    </View>

                    {/* 玩法说明部分 */}
                    <View style={styles.ruleSection}>
                        <View style={[LAYOUT_MIXINS.rowCenter, { marginBottom: SPACING.md }]}>
                            <Info size={18} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>如何获得奖励？</Text>
                        </View>

                        {[
                            { id: 1, text: "分享邀请码或链接给未注册的好友" },
                            { id: 2, text: "好友下载APP并成功完成首次拼车行程" },
                            { id: 3, text: "奖励将自动发放至您的钱包中" }
                        ].map((step) => (
                            <View key={step.id} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{step.id}</Text>
                                </View>
                                <Text style={styles.stepDesc}>{step.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={commonStyles.primaryButton}
                    onPress={handleShare}
                    activeOpacity={0.8}
                >
                    <View style={LAYOUT_MIXINS.rowCenter}>
                        <Share2 size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                        <Text style={commonStyles.primaryButtonText}>立即邀请好友</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}