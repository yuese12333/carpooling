/**
 * @file favorite-locations-page.style.ts
 * @description 常用地点页面的样式定义，基于全局 Design Tokens 重构
 */

import { StyleSheet } from "react-native";
import { COLORS as GLOBAL_COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS, commonStyles } from "@/pages/style";

/**
 * 局部颜色映射
 * 映射全局 Token 到页面语义，确保 UI 链路一致性
 */
export const COLORS = Object.freeze({
    primary: GLOBAL_COLORS.primary,
    primaryLight: GLOBAL_COLORS.primaryGhost,
    textPrimary: GLOBAL_COLORS.textMain,
    textSecondary: GLOBAL_COLORS.textSecondary,
    textMuted: GLOBAL_COLORS.textMuted,
    bgLight: GLOBAL_COLORS.bgLight,
    white: GLOBAL_COLORS.white,
    border: GLOBAL_COLORS.borderLight,
    info: GLOBAL_COLORS.info,
    infoLight: GLOBAL_COLORS.infoLight,
    warning: GLOBAL_COLORS.warning,
    warningLight: GLOBAL_COLORS.warningBg,
    danger: GLOBAL_COLORS.danger,
    successBg: GLOBAL_COLORS.successBg,
    transparent: GLOBAL_COLORS.transparent,
});

/**
 * 根据地点类型获取对应的语义化颜色对
 */
export const getCategoryColor = (type: string): { main: string; light: string } => {
    switch (type) {
        case 'home':
            return { main: COLORS.info, light: COLORS.infoLight };
        case 'work':
            return { main: COLORS.warning, light: COLORS.warningLight };
        default:
            return { main: COLORS.primary, light: COLORS.primaryLight };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    navBar: {
        paddingTop: 12,
        ...LAYOUT_MIXINS.navBarBase,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    content: {
        flex: 1,
    },
    searchSection: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.sm,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    currentLocText: {
        color: COLORS.primary,
        fontSize: 13,
        marginLeft: SPACING.xs,
    },
    divider: {
        marginVertical: 12,
        backgroundColor: COLORS.border,
        height: StyleSheet.hairlineWidth, // 保持视觉上的精细分割线
    },
    listPadding: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100,
    },
    locationCard: {
        marginBottom: 12,
        padding: 12,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.white, // 确保卡片背景正确
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    locationLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    defaultBadge: {
        marginLeft: SPACING.sm,
        paddingHorizontal: 6,
        paddingVertical: 0,
        backgroundColor: COLORS.successBg,
        borderWidth: 0,
    },
    defaultText: {
        fontSize: 10,
        color: COLORS.primary,
    },
    addressText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    actionBtn: {
        padding: SPACING.sm,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        color: COLORS.textMuted,
    },
    loadingText: {
        color: COLORS.textMuted,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: COLORS.transparent,
    },
    mainAddBtn: {
        ...commonStyles.primaryButton,
        ...SHADOWS.primary,
    },
    mainAddBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    menuList: {
        marginVertical: 20,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    dangerMenuText: {
        color: COLORS.danger,
    },
    menuContainer: {
        width: 140,
        gap: 4,
    },
    dangerText: {
        color: COLORS.danger,
    },
    popoverContainer: {
        width: 140,
        gap: 4,
    },
    popoverItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: RADIUS.sm,
        gap: 12,
    },
});

export default styles;