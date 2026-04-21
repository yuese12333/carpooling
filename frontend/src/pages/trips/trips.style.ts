/**
 * @file trips-style.ts
 * @description “我的行程”页面专用样式表。定义了卡片布局、Tab 切换状态及品牌色阶。
 * @version 1.1.0
 */

import { StyleSheet, Platform } from "react-native";

/**
 * 品牌及 UI 调色盘
 * 严格执行 Object.freeze 确保运行时不可篡改
 */
export const COLORS = Object.freeze({
    primary: "#10B981",         // 品牌主色 (Emerald)
    primaryLight: "rgba(16, 185, 129, 0.3)", // 交互反馈色
    primaryGhost: "rgba(16, 185, 129, 0.1)", // 极浅背景色
    warning: "#FBBF24",         // 状态提示/星级
    danger: "#EF4444",          // 警告/异常/取消
    orange: "#FB923C",          // 路线高亮

    // 灰阶定义 (基于 Tailwind Palette)
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray700: "#374151",
    gray800: "#1F2937",

    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    overlay: "rgba(249, 250, 251, 0.8)", // 卡片头部半透明遮罩

    backgroundv1: "#DCFCE7", // 页面背景色
    backgroundv2: "#FEF2F2", // 卡片背景色
});

/**
 * 投影样式预设
 */
const SHADOWS = {
    subtle: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    }
};

export default StyleSheet.create({
    /**
     * 容器级样式
     */
    safeAreaProvider: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },

    /**
     * 顶部导航与 Header
     */
    headerWrapper: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingBottom: 8,
        zIndex: 10,
        ...SHADOWS.subtle,
    },
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: Platform.OS === 'ios' ? "700" : "bold",
        color: COLORS.gray800,
    },
    backBtn: {
        padding: 4,
    },

    /**
     * Tab 切换器样式
     */
    filterContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 2,
    },
    tabItemActive: {
        borderBottomColor: COLORS.primary,
    },
    tabItemInactive: {
        borderBottomColor: COLORS.transparent,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: "700",
    },
    tabTextInactive: {
        color: COLORS.gray400,
    },

    /**
     * 列表内容与缺省态
     */
    scrollContentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.gray100,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    /**
     * 行程卡片组件样式
     */
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.gray100,
        ...SHADOWS.subtle,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.overlay,
    },
    roleBadge: {
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: "500",
        color: COLORS.gray700,
    },
    priceText: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 18,
    },

    /**
     * 路线示意组件
     */
    routeLineContainer: {
        alignItems: "center",
        paddingVertical: 4,
    },
    routeLine: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.gray200,
        marginVertical: 1,
    },

    /**
     * 卡片底部交互区
     */
    cardFooter: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    footerBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
    },
    footerBtnBorder: {
        borderRightWidth: 1,
        borderRightColor: COLORS.gray100,
    },
    footerBtnHighlight: {
        backgroundColor: COLORS.primaryLight,
    }
});