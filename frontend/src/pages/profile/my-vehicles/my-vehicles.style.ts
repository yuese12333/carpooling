/**
 * @file my-vehicles.style.ts
 * @description 车辆管理列表页面样式定义，深度集成全局 Design Tokens
 */

import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS } from "@/pages/style";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // 导航栏容器 - 继承全局 Mixin
    navbar: {
        ...LAYOUT_MIXINS.navbar,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    navButton: {
        padding: SPACING.xs,
        ...LAYOUT_MIXINS.hitSlop,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    // 车辆卡片外层间距
    vehicleWrapper: {
        marginBottom: SPACING.lg,
    },
    vehicleCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: RADIUS.card,
        backgroundColor: COLORS.white,
        ...SHADOWS.xs, // 引用全局轻阴影
    },
    imageContainer: {
        position: 'relative',
        height: 180,
        width: '100%',
    },
    carImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.imagePlaceholder,
    },
    carImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.imagePlaceholder,
    },
    iconMarginSm: {
        marginRight: 4,
    },
    iconMarginMd: {
        marginRight: 8,
    },
    secondaryActionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.sm,
    },
    secondaryActionSpacer: {
        marginLeft: SPACING.md,
    },
    textAction: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },
    textActionDanger: {
        fontSize: 13,
        color: COLORS.danger,
        fontWeight: '600',
    },
    defaultBadge: {
        position: 'absolute',
        top: SPACING.md - 4, // 12px
        left: SPACING.md - 4,
        backgroundColor: COLORS.primary,
        ...LAYOUT_MIXINS.badgeBase,
        zIndex: 10,
    },
    defaultText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusBadgeOverlay: {
        position: 'absolute',
        bottom: SPACING.md - 4,
        right: SPACING.md - 4,
        zIndex: 10,
    },
    statusBadge: {
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.overlayLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADIUS.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.borderDivider,
    },
    statusText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    infoSection: {
        padding: SPACING.lg, // 20px 对应 lg
    },
    titleRow: {
        ...LAYOUT_MIXINS.rowBetween,
        alignItems: 'flex-start',
        marginBottom: SPACING.md - 4, // 12px
    },
    brandText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    plateText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 2,
        letterSpacing: 1,
    },
    tagGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.md,
    },
    tagItem: {
        backgroundColor: COLORS.tagBg,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.xs + 2, // 6px
        marginRight: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    tagText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    separator: {
        height: 1,
        marginVertical: SPACING.xs,
        backgroundColor: COLORS.borderDivider,
    },
    detailGrid: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
    },
    detailItem: {
        flex: 1,
        ...LAYOUT_MIXINS.rowCenter,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.bgBlueLight,
        ...LAYOUT_MIXINS.center,
        marginRight: 10,
    },
    iconCircleDanger: {
        backgroundColor: COLORS.errorLight,
    },
    detailLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    tipSection: {
        marginTop: 10,
        paddingHorizontal: SPACING.sm,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 6,
    },
    tipDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 60,
    },
    baseBtn: {
        flex: 1,
        height: 54,
        borderRadius: RADIUS.lg,
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: 'center',
    },
    modifyBtn: {
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.sm,
        ...SHADOWS.primary,
    },
    detailBtn: {
        backgroundColor: COLORS.white,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
    },
    btnTextWhite: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    btnTextPrimary: {
        color: COLORS.textMain,
        fontSize: 16,
        fontWeight: '600',
    }
});