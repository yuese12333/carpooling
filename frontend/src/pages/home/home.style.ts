/**
 * @file home.style.ts
 * @description 首页组件专属样式表。
 * 包含全局调色盘定义及首页各功能模块（Header、SearchCard、QuickAction、StatsBanner、RideCard）的布局定义。
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";

/**
 * 首页业务专用颜色常量池
 * 严格禁止在 StyleSheet 中使用硬编码的十六进制颜色值
 */
export const COLORS = Object.freeze({
    // 品牌核心色
    primary: "#10B981",
    secondary: "#f97316",
    background: "#f9fafb",
    white: "#ffffff",
    black: "#000000",

    // 文本色阶
    textGray: "#9ca3af",
    textDark: "#1f2937",
    textMuted: "#6b7280",
    textLight: "#4b5563",
    textEmphasis: "#374151", // 修复原硬编码 #374151

    // 边框与分割
    border: "#f3f4f6",
    divider: "#e5e7eb",
    separator: "#d1d5db", // 修复原硬编码 #d1d5db

    // 状态反馈
    statusError: "#f87171",
    statusSuccess: "#16a34a",
    statusInfo: "#2563eb",
    statusWarning: "#ea580c",
    rating: "#facc15",

    // 辅助背景与蒙层
    bgGreenLight: "#f0fdf4",
    bgOrangeLight: "#fff7ed",
    bgBlueLight: "#eff6ff",
    bgPurpleLight: "#faf5ff",
    bgDarkOverlay: "rgba(0,0,0,0.3)",
    whiteOverlay: "rgba(255,255,255,0.2)",
    whiteOverlayMuted: "rgba(255,255,255,0.4)",
    whiteTextMuted: "rgba(255,255,255,0.7)",
});

/**
 * 首页样式表实现
 */
export default StyleSheet.create({
    // --- 基础布局 ---
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    } as ViewStyle,
    scrollContent: {
        paddingBottom: 20,
    } as ViewStyle,

    // --- 顶部状态栏与用户信息 ---
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    } as ViewStyle,
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    } as ViewStyle,
    userProfile: {
        flexDirection: "row",
        alignItems: "center",
    } as ViewStyle,
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.whiteOverlayMuted,
        marginRight: 12,
    } as ImageStyle,
    welcomeText: {
        color: COLORS.whiteTextMuted,
        fontSize: 12,
    } as TextStyle,
    userName: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 16,
    } as TextStyle,
    notificationButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.whiteOverlay,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    } as ViewStyle,
    notificationDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        backgroundColor: COLORS.statusError,
        borderRadius: 4,
    } as ViewStyle,

    // --- 搜索卡片模块 ---
    searchCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    } as ViewStyle,
    searchCardTitle: {
        color: COLORS.textDark,
        fontWeight: "600",
        marginBottom: 12,
    } as TextStyle,
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
        marginBottom: 8,
    } as ViewStyle,
    borderBottomNone: {
        borderBottomWidth: 0,
    } as ViewStyle,
    iconWrapperGreen: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.bgGreenLight,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    } as ViewStyle,
    iconWrapperOrange: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.bgOrangeLight,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    } as ViewStyle,
    textInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textDark,
        padding: 0,
    } as TextStyle,
    searchActionRow: {
        flexDirection: "row",
        gap: 8,
    } as ViewStyle,
    dateSelector: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    } as ViewStyle,
    dateText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 6,
    } as TextStyle,
    searchButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: "center",
        height: 40,
    } as ViewStyle,
    searchButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
    } as TextStyle,

    // --- 快捷操作栏 ---
    quickActionSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    } as ViewStyle,
    quickActionContainer: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        marginHorizontal: 4,
    } as ViewStyle,
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 4,
    } as TextStyle,
    quickActionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textEmphasis,
    } as TextStyle,
    quickActionSublabel: {
        fontSize: 10,
        color: COLORS.textGray,
    } as TextStyle,

    // --- 数据看板统计 ---
    statsBanner: {
        marginHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    } as ViewStyle,
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    } as ViewStyle,
    statItem: {
        alignItems: "center",
    } as ViewStyle,
    statValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    } as TextStyle,
    statLabel: {
        color: COLORS.whiteTextMuted,
        fontSize: 10,
        marginTop: 4,
    } as TextStyle,
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.whiteOverlay,
    } as ViewStyle,

    // --- 信任背书模块 ---
    trustSection: {
        paddingHorizontal: 20,
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    } as ViewStyle,
    trustBadgeBlue: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.bgGreenLight,
        borderRadius: 12,
        paddingVertical: 8,
    } as ViewStyle,
    trustBadgeBlueVariant: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.bgBlueLight,
        borderRadius: 12,
        paddingVertical: 8,
    } as ViewStyle,
    trustBadgeOrange: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.bgOrangeLight,
        borderRadius: 12,
        paddingVertical: 8,
    } as ViewStyle,
    trustTextGreen: { color: COLORS.statusSuccess, fontSize: 11, marginLeft: 4 } as TextStyle,
    trustTextBlue: { color: COLORS.statusInfo, fontSize: 11, marginLeft: 4 } as TextStyle,
    trustTextOrange: { color: COLORS.statusWarning, fontSize: 11, marginLeft: 4 } as TextStyle,

    // --- 行程列表模块 ---
    ridesSection: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    } as ViewStyle,
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.textDark,
    } as TextStyle,
    viewAllBtn: {
        flexDirection: "row",
        alignItems: "center",
    } as ViewStyle,
    viewAllText: {
        color: COLORS.primary,
        fontSize: 14,
    } as TextStyle,
    ridesList: {
        flexDirection: "column",
        gap: 12,
    } as ViewStyle,
    rideCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    } as ViewStyle,
    rideDriverRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    } as ViewStyle,
    driverAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    } as ImageStyle,
    driverInfo: {
        flex: 1,
    } as ViewStyle,
    driverName: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textDark,
    } as TextStyle,
    verifiedBadge: {
        backgroundColor: COLORS.bgGreenLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    } as ViewStyle,
    verifiedText: {
        fontSize: 10,
        color: COLORS.statusSuccess,
    } as TextStyle,
    ratingText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: 4,
    } as TextStyle,
    dotSeparator: {
        marginHorizontal: 4,
        color: COLORS.separator,
    } as TextStyle,
    tripCountText: {
        fontSize: 11,
        color: COLORS.textMuted,
    } as TextStyle,
    priceContainer: {
        alignItems: "flex-end",
    } as ViewStyle,
    priceText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "bold",
    } as TextStyle,
    priceUnit: {
        fontSize: 10,
        color: COLORS.textGray,
    } as TextStyle,
    routeContainer: {
        flexDirection: "row",
        alignItems: "center",
    } as ViewStyle,
    routeVisual: {
        alignItems: "center",
        marginRight: 10,
    } as ViewStyle,
    dotGreen: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    } as ViewStyle,
    routeLine: {
        width: 2,
        height: 16,
        backgroundColor: COLORS.divider,
        marginVertical: 2,
    } as ViewStyle,
    dotOrange: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.secondary,
        borderRadius: 4,
    } as ViewStyle,
    routeDetails: {
        flex: 1,
        gap: 4,
    } as ViewStyle,
    routePointText: {
        fontSize: 12,
        color: COLORS.textLight,
    } as TextStyle,
    seatsBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    } as ViewStyle,
    seatsText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: 4,
    } as TextStyle,

    // --- 环境切换器与通用原子类 ---
    envSwitcher: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 999,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.bgDarkOverlay,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    } as ViewStyle,
    envLabel: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "600",
        marginRight: 4,
    } as TextStyle,
    flexRowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
    } as ViewStyle,
    flexRowCenter: {
        flexDirection: "row",
        alignItems: "center",
    } as ViewStyle,
});