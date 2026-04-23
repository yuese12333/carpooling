/**
 * @file vehicle-verification-detail.style.ts
 * @description 车辆认证详情页样式表 - 已重构：基于全局 Design Tokens
 */

import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, LAYOUT_MIXINS } from "@/pages/style";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // --- 导航栏 ---
    navbar: {
        ...LAYOUT_MIXINS.navbar, // 复用全局导航栏混入
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    navButton: {
        padding: SPACING.sm,
    },
    // --- 头部状态卡片 ---
    headerCard: {
        ...LAYOUT_MIXINS.headerCard,
    },
    statusIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.md,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginBottom: SPACING.sm,
    },
    statusDate: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
    },
    validBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.primaryDark, // 对应原 primaryBorder 的语义
    },
    validText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    // --- 内容区 ---
    contentPadding: {
        padding: SPACING.md, // 对应原 SPACING.xl (20px) 在新规范中映射
    },
    sectionHeader: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    infoCard: {
        ...LAYOUT_MIXINS.mainCard, // 复用主卡片布局（含阴影、圆角、内边距）
    },
    stepsList: {
        marginTop: SPACING.md,
    },
    stepItem: {
        ...LAYOUT_MIXINS.rowCenter,
        paddingVertical: SPACING.md,
    },
    stepIcon: {
        marginRight: SPACING.md,
    },
    stepText: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    stepDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    stepLine: {
        marginLeft: 36,
        ...LAYOUT_MIXINS.separator,
    },
    // --- 档案网格 ---
    archiveGrid: {
        ...LAYOUT_MIXINS.rowBetween,
    },
    archiveItem: {
        width: '48%',
        ...LAYOUT_MIXINS.cardBase,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        position: 'relative',
    },
    imagePlaceholder: {
        width: '100%',
        height: 80,
        backgroundColor: COLORS.imagePlaceholder,
        borderRadius: RADIUS.md,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.sm,
    },
    archiveLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    lockIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.overlay,
        borderRadius: RADIUS.md,
        padding: 4,
    },
    // --- 权益板块 ---
    benefitCard: {
        marginTop: SPACING.xl,
        ...LAYOUT_MIXINS.mainCard,
    },
    benefitHeader: {
        ...LAYOUT_MIXINS.rowCenter,
        marginBottom: SPACING.md,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginLeft: SPACING.sm,
    },
    benefitRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    benefitItem: {
        alignItems: 'center',
    },
    benefitIconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.sm,
    },
    benefitText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    // --- 底部提示 ---
    noticeBox: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        backgroundColor: COLORS.bgLight,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'flex-start',
    },
    noticeText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: SPACING.sm,
        lineHeight: 18,
    },
});