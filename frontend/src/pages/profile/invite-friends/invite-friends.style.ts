/**
 * @file invite-friends.style.ts
 * @description 邀请好友页面的样式定义，严格执行设计令牌规范
 */

import { StyleSheet, Platform } from 'react-native';
// 导入全局设计令牌作为基础
import { COLORS as GLOBAL_COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS } from "@/pages/style";

/**
 * 页面级颜色常量 - 严格执行颜色常量化，禁止硬编码
 */
export const COLORS = Object.freeze({
    primary: GLOBAL_COLORS.primary,
    primaryGhost: GLOBAL_COLORS.primaryGhost,
    white: GLOBAL_COLORS.white,
    bgLight: GLOBAL_COLORS.bgLight,
    borderDivider: GLOBAL_COLORS.borderDivider,
    borderLight: GLOBAL_COLORS.borderLight,
    textMain: GLOBAL_COLORS.textMain,
    textSub: GLOBAL_COLORS.textSub,
    textSecondary: GLOBAL_COLORS.textSecondary,
    textLighter: GLOBAL_COLORS.textLighter,
    transparent: 'transparent',
});

export default StyleSheet.create({
    scrollContent: {
        paddingBottom: 120,
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
    topHeader: {
        paddingBottom: SPACING.xxl,
        borderBottomLeftRadius: RADIUS.xxl,
        borderBottomRightRadius: RADIUS.xxl,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    heroSection: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    heroSubTitle: {
        fontSize: 14,
        color: COLORS.textLighter,
    },
    mainContent: {
        paddingHorizontal: SPACING.md,
        marginTop: -SPACING.xl, // 向上偏移使卡片悬浮
    },
    inviteCard: {
        ...LAYOUT_MIXINS.mainCard,
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        ...SHADOWS.lg,
    },
    cardLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgLight,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
        borderStyle: 'dashed',
    },
    codeText: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 2,
    },
    copyBadge: {
        marginLeft: SPACING.md,
        paddingLeft: SPACING.md,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.borderDivider,
        flexDirection: 'row',
        alignItems: 'center',
    },
    copyText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    optimizedStatsContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.lg,
        marginTop: SPACING.xs,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: COLORS.borderDivider,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    ruleSection: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
        marginLeft: 8,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primaryGhost,
        ...LAYOUT_MIXINS.center,
        marginRight: SPACING.md,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    stepDesc: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSub,
        lineHeight: 22,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    }
});