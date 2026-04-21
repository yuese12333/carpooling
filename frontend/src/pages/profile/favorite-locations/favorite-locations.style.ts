/**
 * @file favorite-locations-page.style.ts
 * @description 常用地点页面的样式定义，包含颜色常量、动态颜色计算逻辑及样式表
 */

import { StyleSheet } from "react-native";

/**
 * 颜色常量定义
 * 严格执行禁止硬编码要求，确保 UI 链路视觉一致性
 */
export const COLORS = Object.freeze({
    primary: "#10b981",
    primaryLight: "#10b98115", // 用于图标背景
    textPrimary: "#1f2937",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    bgLight: "#f9fafb",
    white: "#ffffff",
    border: "#f3f4f6",
    info: "#3b82f6",
    infoLight: "#3b82f615",
    warning: "#f59e0b",
    warningLight: "#f59e0b15",
    danger: "#ef4444",
    successBg: "#f0fdf4",
    transparent: "transparent",
});

/**
 * 根据地点类型获取对应的语义化颜色对
 * @param type - 地点类别 ('home' | 'work' | 'other')
 * @returns 包含主色调与浅色背景色的对象
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

/**
 * 样式表定义
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    backBtn: {
        padding: 4
    },
    content: {
        flex: 1,
    },
    searchSection: {
        padding: 16,
        backgroundColor: COLORS.white,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 8,
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
        marginLeft: 4,
    },
    divider: {
        marginVertical: 12,
        backgroundColor: COLORS.border,
    },
    listPadding: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    locationCard: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 16,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
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
        marginLeft: 8,
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
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
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
        backgroundColor: COLORS.primary,
        borderRadius: 100,
        height: 54,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainAddBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    menuList: {
        marginVertical: 20,
        backgroundColor: COLORS.bgLight,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
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
        borderRadius: 8,
        gap: 12,
    },
});

export default styles;