/**
 * @file profile.style.ts
 * @description 个人中心模块视觉样式表，包含品牌色彩体系、组件布局及适配方案。
 */

import { StyleSheet, Platform, StatusBar } from "react-native";

/**
 * 个人中心模块专属色彩体系 (基于设计系统规范)
 */
export const colors = Object.freeze({
    // 核心品牌色
    primary: "#10b981",
    danger: "#ef4444",
    success: "#22c55e",
    warning: "#fde047",

    // 内容文字色
    textPrimary: "#1f2937",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    textLight: "rgba(255,255,255,0.8)",
    textLighter: "rgba(255,255,255,0.6)",

    // 基础表面色
    white: "#ffffff",
    bgLight: "#f9fafb",
    borderLight: "#f3f4f6",
    divider: "#d1d5db",

    // 功能性装饰色
    blueLight: "#eff6ff",
    bluePrimary: "#3b82f6",
    purpleLight: "#faf5ff",
    purplePrimary: "#a855f7",
    orangeLight: "#fff7ed",
    orangePrimary: "#f97316",
    yellowBadge: "#fefce8",
    yellowIcon: "#eab308",
    redLight: "#fef2f2",

    // 透明辅助层
    whiteTransparent: "rgba(255,255,255,0.3)",
    whiteOverlay: "rgba(255,255,255,0.15)",
    whiteBorder: "rgba(255,255,255,0.2)",
    shadow: "#000",
});

/**
 * 统一样式抽象：阴影卡片容器
 */
const cardBase = {
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
};

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgLight,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        // 修正硬编码：根据平台动态处理安全距离
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: colors.whiteTransparent,
    },
    editBadge: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: colors.white,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    userTextContent: {
        flex: 1,
        marginLeft: 16,
        paddingTop: 4,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.white,
    },
    verifiedTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.whiteBorder,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    verifiedText: {
        color: colors.white,
        fontSize: 10,
        marginLeft: 2,
    },
    statsGrid: {
        flexDirection: "row",
        backgroundColor: colors.whiteOverlay,
        borderRadius: 20,
        marginTop: 24,
        paddingVertical: 16,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.whiteBorder,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.white,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textLight,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    mainContent: {
        padding: 16,
    },
    sectionCard: {
        ...cardBase,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        marginLeft: 8,
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
        borderRadius: 16,
        marginBottom: 10,
    },
    badgeUnlocked: {
        backgroundColor: colors.yellowBadge,
        opacity: 1,
    },
    badgeLocked: {
        backgroundColor: colors.bgLight,
        opacity: 0.4,
    },
    badgeEmoji: {
        fontSize: 24,
    },
    badgeLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 6,
        textAlign: "center",
    },
    carInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    carIconWrapper: {
        width: 44,
        height: 44,
        backgroundColor: colors.blueLight,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    carTextContent: {
        flex: 1,
        marginLeft: 12,
    },
    carName: {
        fontSize: 15,
        fontWeight: "500",
        color: colors.textPrimary,
    },
    carDetail: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    editText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: "600",
    },
    menuGroup: {
        marginBottom: 16,
    },
    groupHeader: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    groupTitle: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    menuCard: {
        ...cardBase,
        borderRadius: 20, // 覆盖卡片圆角
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    menuTextContent: {
        flex: 1,
        marginLeft: 12,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textPrimary,
    },
    menuSubText: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
    doneWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    doneText: {
        fontSize: 12,
        color: colors.success,
        marginLeft: 4,
    },
    versionText: {
        textAlign: "center",
        fontSize: 11,
        color: colors.divider,
        marginTop: 16,
        marginBottom: 8,
    },
    bottomSpacer: {
        height: 40,
    },
});