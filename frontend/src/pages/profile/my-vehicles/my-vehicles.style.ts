/**
 * @file my-vehicles.style.ts
 * @description 车辆管理列表页面样式定义，遵循品牌视觉规范与 RN 性能优化准则
 */

import { StyleSheet, Platform } from "react-native";

/**
 * 品牌颜色常量配置
 * 采用 Object.freeze 确保运行时不可篡改
 */
export const COLORS = Object.freeze({
    primary: "#10b981",       // 品牌主绿色 (Emerald 500)
    secondary: "#3b82f6",     // 品牌辅助蓝
    danger: "#ef4444",        // 危险/错误红
    textPrimary: "#1f2937",   // 主要文字 (Gray 800)
    textSecondary: "#4b5563", // 次要文字 (Gray 600)
    textMuted: "#9ca3af",     // 禁用/提示文字 (Gray 400)
    bgLight: "#f9fafb",       // 页面背景底色
    white: "#ffffff",         // 纯白
    border: "#f3f4f6",        // 边框/分割线
    imagePlaceholder: "#e5e7eb", // 图片加载占位
    tagBg: "#f3f4f6",         // 标签背景
    iconCircleBg: "#eff6ff",  // 图标圆圈背景
    dangerBg: "#fef2f2",      // 危险色背景 (浅红)
    overlayWhite: "rgba(255,255,255,0.9)", // 白色半透明遮罩
});

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // 导航栏容器 - 实际开发中高度应由 SafeArea 动态累加
    navbar: {
        height: Platform.OS === 'ios' ? 44 : 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    navButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 16,
    },
    // 车辆卡片外层间距
    vehicleWrapper: {
        marginBottom: 20,
    },
    vehicleCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: 24,
        backgroundColor: COLORS.white,
        // 增加阴影以提升卡片质感
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
        }),
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
    defaultBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
    },
    defaultText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusBadgeOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.overlayWhite,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
    },
    statusText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    infoSection: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    brandText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
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
        marginBottom: 16,
    },
    tagItem: {
        backgroundColor: COLORS.tagBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    separator: {
        height: 1,
        marginVertical: 4,
        backgroundColor: COLORS.border,
    },
    detailGrid: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    detailItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.iconCircleBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    iconCircleDanger: {
        backgroundColor: COLORS.dangerBg,
    },
    detailLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    tipSection: {
        marginTop: 10,
        paddingHorizontal: 8,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
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
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // 统一按钮阴影处理
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    modifyBtn: {
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    detailBtn: {
        backgroundColor: COLORS.white,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btnTextWhite: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    btnTextPrimary: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    }
});