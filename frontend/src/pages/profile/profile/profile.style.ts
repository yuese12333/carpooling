/**
 * @file profile.style.ts
 * @description 个人中心模块视觉样式表，已重构为引用全局 Design Tokens。
 */

import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS, SIZES } from '@/pages/style';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        // 动态处理安全距离：iOS 常用 60 (含状态栏)，Android 动态获取
        paddingTop: Platform.OS === 'ios' ? 60 : SIZES.statusBarHeight + 20,
        paddingBottom: 30,
        borderBottomLeftRadius: RADIUS.xxl,
        borderBottomRightRadius: RADIUS.xxl,
    },
    userInfo: {
        ...LAYOUT_MIXINS.rowCenter,
        alignItems: "flex-start", // 覆盖 mixin 的 center 保持原样
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: COLORS.whiteTrans[30],
    },
    editBadge: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.white,
        width: 28,
        height: 28,
        borderRadius: 14,
        ...LAYOUT_MIXINS.center,
        ...SHADOWS.xs, // 复用全局阴影
        elevation: 3,  // 增强层级
    },
    userTextContent: {
        flex: 1,
        marginLeft: SPACING.md,
        paddingTop: 4,
    },
    nameRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    userName: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
    },
    verifiedTag: {
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.whiteBorder,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: SPACING.sm,
    },
    verifiedText: {
        color: COLORS.white,
        fontSize: 10,
        marginLeft: 2,
    },
    statsGrid: {
        ...LAYOUT_MIXINS.statsContainer,
        marginTop: SPACING.lg,
    },
    statItem: {
        flex: 1,
        ...LAYOUT_MIXINS.center,
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.whiteBorder,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
    },
    ratingRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    mainContent: {
        padding: SPACING.md,
    },
    sectionCard: {
        ...LAYOUT_MIXINS.cardShadow,
        borderRadius: 20, // 覆盖为特定的 20
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitleRow: {
        ...LAYOUT_MIXINS.rowCenter,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.textMain,
        marginLeft: SPACING.sm,
    },
    badgeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginHorizontal: -4,
    },
    badgeItem: {
        width: "30%",
        marginHorizontal: "1.66%",
        alignItems: "center",
        padding: 12,
        borderRadius: RADIUS.lg,
        marginBottom: 10,
    },
    badgeUnlocked: {
        backgroundColor: COLORS.yellowBadge,
        opacity: 1,
    },
    badgeLocked: {
        backgroundColor: COLORS.bgLight,
        opacity: 0.4,
    },
    badgeEmoji: {
        fontSize: 24,
    },
    badgeLabel: {
        fontSize: 10,
        color: COLORS.textSub,
        marginTop: 6,
        textAlign: "center",
    },
    carInfoRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    carIconWrapper: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.infoLight,
        borderRadius: 14,
        ...LAYOUT_MIXINS.center,
    },
    carTextContent: {
        flex: 1,
        marginLeft: 12,
    },
    carName: {
        fontSize: 15,
        fontWeight: "500",
        color: COLORS.textMain,
    },
    carDetail: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    editText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "600",
    },
    menuGroup: {
        marginBottom: SPACING.md,
    },
    groupHeader: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    groupTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    menuCard: {
        ...LAYOUT_MIXINS.cardShadow,
        borderRadius: 20,
        overflow: "hidden",
    },
    menuItem: {
        ...LAYOUT_MIXINS.rowCenter,
        paddingHorizontal: SPACING.md,
        paddingVertical: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        ...LAYOUT_MIXINS.center,
    },
    menuTextContent: {
        flex: 1,
        marginLeft: 12,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.textMain,
    },
    menuSubText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    doneWrapper: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    doneText: {
        fontSize: 12,
        color: COLORS.primary, // 原 success 为 #22c55e，与 primary #10b981 极近，建议归口
        marginLeft: 4,
    },
    versionText: {
        textAlign: "center",
        fontSize: 11,
        color: COLORS.dividerLight,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    bottomSpacer: {
        height: 40,
    },
});