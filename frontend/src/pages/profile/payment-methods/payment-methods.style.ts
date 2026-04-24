/**
 * @file payment-methods.style.ts
 * @description 支付方式页面专属样式表。深度集成全局 Design Tokens，确保 UI 一致性与响应式布局。
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { COLORS, SPACING, RADIUS, LAYOUT_MIXINS, SHADOWS, commonStyles } from '@/pages/style';

/**
 * 样式类型定义，确保样式属性的严谨性
 */
interface PaymentMethodsStyles {
    container: ViewStyle;
    navbar: ViewStyle;
    navBack: ViewStyle;
    navTitle: TextStyle;
    scrollContent: ViewStyle;
    balanceCardInner: ViewStyle;
    balanceHeader: ViewStyle;
    balanceLabelRow: ViewStyle;
    balanceLabel: TextStyle;
    balanceAmount: TextStyle;
    balanceActions: ViewStyle;
    balanceActionBtn: ViewStyle;
    balanceActionText: TextStyle;
    balanceDivider: ViewStyle;
    sectionHeader: ViewStyle;
    sectionTitle: TextStyle;
    sectionSub: TextStyle;
    methodItem: ViewStyle;
    methodItemActive: ViewStyle;
    iconBox: ViewStyle;
    methodInfo: ViewStyle;
    methodNameRow: ViewStyle;
    methodName: TextStyle;
    defaultBadge: ViewStyle;
    defaultBadgeText: TextStyle;
    methodSub: TextStyle;
    checkArea: ViewStyle;
    addBtn: ViewStyle;
    addBtnText: TextStyle;
    securityBox: ViewStyle;
    securityText: TextStyle;
    settingCard: ViewStyle;
    settingItem: ViewStyle;
    settingLabel: TextStyle;
    settingRight: ViewStyle;
    settingValue: TextStyle;
    footer: ViewStyle;
    footerBtn: ViewStyle;
    footerBtnText: TextStyle;
    bottomSpacer: ViewStyle;
    infoBtn: ViewStyle;
}

export default StyleSheet.create<PaymentMethodsStyles>({
    container: {
        ...commonStyles.safeAreaContainer,
        backgroundColor: COLORS.bgLight,
    },
    navbar: {
        ...LAYOUT_MIXINS.navBarBase,
        // 使用预设高度或 Token，避免硬编码
        height: 56,
    },
    navBack: {
        ...LAYOUT_MIXINS.hitSlop,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    scrollContent: {
        ...commonStyles.scrollContent,
        padding: SPACING.md,
    },
    // 余额卡片容器样式
    balanceCardInner: {
        padding: SPACING.lg,
        borderRadius: RADIUS.card,
    },
    balanceHeader: {
        ...LAYOUT_MIXINS.rowBetween,
    },
    balanceLabelRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    balanceLabel: {
        color: COLORS.whiteTrans[80],
        fontSize: 13,
        marginLeft: SPACING.xs + 2,
    },
    balanceAmount: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '700',
        marginVertical: SPACING.lg, // 替换硬编码 20
        letterSpacing: -0.5,
    },
    balanceActions: {
        ...LAYOUT_MIXINS.rowCenter,
        marginTop: SPACING.sm,
        backgroundColor: COLORS.whiteTrans[20],
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.xs,
    },
    balanceActionBtn: {
        flex: 1,
        ...LAYOUT_MIXINS.center,
    },
    balanceActionText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    balanceDivider: {
        width: 1,
        height: 20, // 视觉分割线通常保持固定
        backgroundColor: COLORS.whiteTrans[30],
    },
    sectionHeader: {
        marginBottom: SPACING.sm, // 规范化间距
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    sectionSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
    methodItem: {
        ...LAYOUT_MIXINS.rowCenter,
        padding: SPACING.md,
        marginBottom: SPACING.sm, // 规范化间距
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.transparent,
        backgroundColor: COLORS.white,
    },
    methodItemActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.borderLight,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        ...LAYOUT_MIXINS.center,
    },
    methodInfo: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    methodNameRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    methodName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    defaultBadge: {
        ...LAYOUT_MIXINS.badgeBase,
        marginLeft: SPACING.sm,
        backgroundColor: COLORS.primary,
        height: 18,
    },
    defaultBadgeText: {
        fontSize: 10,
        color: COLORS.white,
    },
    methodSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
    checkArea: {
        paddingLeft: SPACING.sm,
    },
    addBtn: {
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: 'center',
        padding: SPACING.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.disabled,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.sm,
    },
    addBtnText: {
        marginLeft: SPACING.sm,
        fontSize: 14,
        color: COLORS.textSub,
        fontWeight: '500',
    },
    securityBox: {
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    securityText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: SPACING.xs,
    },
    settingCard: {
        ...LAYOUT_MIXINS.cardBase,
        padding: SPACING.xs,
        borderRadius: RADIUS.lg,
    },
    settingItem: {
        ...LAYOUT_MIXINS.rowBetween,
        padding: SPACING.md,
    },
    settingLabel: {
        fontSize: 14,
        color: COLORS.textMain,
        fontWeight: '500',
    },
    settingRight: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    settingValue: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginRight: SPACING.xs,
    },
    footer: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    footerBtn: {
        ...commonStyles.primaryButton,
    },
    footerBtnText: {
        ...commonStyles.primaryButtonText,
    },
    bottomSpacer: {
        height: SPACING.xxl,
    },
    infoBtn: {
        ...LAYOUT_MIXINS.hitSlop,
        backgroundColor: COLORS.whiteTrans[20],
        borderRadius: RADIUS.sm,
    },
});