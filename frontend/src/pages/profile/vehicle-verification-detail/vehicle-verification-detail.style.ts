/**
 * @file vehicle-verification-detail.style.ts
 * @description 车辆认证详情页样式表，包含标准颜色体系、跨平台阴影处理及响应式布局配置
 */

import { StyleSheet, Platform } from "react-native";

/**
 * 颜色常量定义 - 严格遵循原子化色彩规范
 */
export const COLORS = Object.freeze({
    primary: "#10b981",
    primaryLight: "#ecfdf5",
    primaryBorder: "#d1fae5",

    warning: "#f59e0b",
    warningLight: "#fff7ed",

    info: "#3b82f6",
    infoLight: "#eff6ff",

    textPrimary: "#1f2937",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",

    bgLight: "#f9fafb",
    white: "#ffffff",
    border: "#f3f4f6",
    placeholder: "#f3f4f6",

    overlayDark: "rgba(0,0,0,0.2)",
    noticeBg: "#f8fafc",
});

/**
 * 布局常量
 */
const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
};

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // --- 导航栏 ---
    navbar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    navButton: {
        padding: SPACING.sm,
    },
    // --- 头部状态卡片 ---
    headerCard: {
        backgroundColor: COLORS.white,
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        // 跨平台阴影适配
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    statusIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
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
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primaryBorder,
    },
    validText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    // --- 内容区 ---
    contentPadding: {
        padding: SPACING.xl,
    },
    sectionHeader: {
        marginTop: SPACING.xxl,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    infoCard: {
        padding: SPACING.xl,
        borderRadius: 20,
        backgroundColor: COLORS.white,
    },
    stepsList: {
        marginTop: SPACING.lg,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    stepIcon: {
        marginRight: SPACING.lg,
    },
    stepText: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    stepDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    stepLine: {
        marginLeft: 36,
        height: 1, // 修复原代码缺失高度的问题
        backgroundColor: COLORS.border,
    },
    // --- 档案网格 ---
    archiveGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    archiveItem: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imagePlaceholder: {
        width: '100%',
        height: 80,
        backgroundColor: COLORS.placeholder,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: COLORS.overlayDark,
        borderRadius: 10,
        padding: 4,
    },
    // --- 权益板块 ---
    benefitCard: {
        marginTop: SPACING.xxl,
        padding: SPACING.xl,
        borderRadius: 20,
        backgroundColor: COLORS.white,
    },
    benefitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
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
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: SPACING.xxl,
        backgroundColor: COLORS.noticeBg,
        padding: SPACING.md,
        borderRadius: 12,
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