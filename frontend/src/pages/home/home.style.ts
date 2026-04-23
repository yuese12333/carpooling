/**
 * @file home.style.ts
 * @description 首页组件专属样式表。已对齐全局 Design Tokens。
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS } from "@/pages/style";

export default StyleSheet.create({
    // --- 基础布局 ---
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
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
        ...LAYOUT_MIXINS.rowBetween,
        marginBottom: 24,
    } as ViewStyle,
    userProfile: {
        ...LAYOUT_MIXINS.rowCenter,
    } as ViewStyle,
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.whiteTrans[40],
        marginRight: 12,
    } as ImageStyle,
    welcomeText: {
        color: COLORS.whiteTrans[70],
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
        backgroundColor: COLORS.whiteTrans[20],
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
        backgroundColor: COLORS.status.error,
        borderRadius: 4,
    } as ViewStyle,

    // --- 搜索卡片模块 ---
    searchCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.lg,
    } as ViewStyle,
    searchCardTitle: {
        color: COLORS.textMain,
        fontWeight: "600",
        marginBottom: 12,
    } as TextStyle,
    inputGroup: {
        ...LAYOUT_MIXINS.rowCenter,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: 8,
        marginBottom: 8,
    } as ViewStyle,
    borderBottomNone: {
        borderBottomWidth: 0,
    } as ViewStyle,
    iconWrapperGreen: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    } as ViewStyle,
    iconWrapperOrange: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.accentLight, // 橙色辅助背景
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    } as ViewStyle,
    textInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMain,
        padding: 0,
    } as TextStyle,
    searchActionRow: {
        flexDirection: "row",
        gap: 8,
    } as ViewStyle,
    dateSelector: {
        flex: 1,
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
    } as ViewStyle,
    dateText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 6,
    } as TextStyle,
    searchButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        borderRadius: RADIUS.md,
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
        borderRadius: RADIUS.lg,
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
        color: COLORS.textSub,
    } as TextStyle,
    quickActionSublabel: {
        fontSize: 10,
        color: COLORS.textMuted,
    } as TextStyle,

    // --- 数据看板统计 ---
    statsBanner: {
        marginHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
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
        color: COLORS.whiteTrans[70],
        fontSize: 10,
        marginTop: 4,
    } as TextStyle,
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.whiteTrans[20],
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
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: "center",
        backgroundColor: COLORS.primaryLight,
        borderRadius: RADIUS.md,
        paddingVertical: 8,
    } as ViewStyle,
    trustBadgeBlueVariant: {
        flex: 1,
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: "center",
        backgroundColor: COLORS.infoLight,
        borderRadius: RADIUS.md,
        paddingVertical: 8,
    } as ViewStyle,
    trustBadgeOrange: {
        flex: 1,
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: "center",
        backgroundColor: COLORS.accentLight,
        borderRadius: RADIUS.md,
        paddingVertical: 8,
    } as ViewStyle,
    trustTextGreen: { color: COLORS.status.success, fontSize: 11, marginLeft: 4 } as TextStyle,
    trustTextBlue: { color: COLORS.status.info, fontSize: 11, marginLeft: 4 } as TextStyle,
    trustTextOrange: { color: COLORS.status.warning, fontSize: 11, marginLeft: 4 } as TextStyle,

    // --- 行程列表模块 ---
    ridesSection: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    } as ViewStyle,
    sectionHeader: {
        ...LAYOUT_MIXINS.rowBetween,
        marginBottom: 12,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.textMain,
    } as TextStyle,
    viewAllBtn: {
        ...LAYOUT_MIXINS.rowCenter,
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
        borderRadius: RADIUS.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    } as ViewStyle,
    rideDriverRow: {
        ...LAYOUT_MIXINS.rowCenter,
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
        color: COLORS.textMain,
    } as TextStyle,
    verifiedBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    } as ViewStyle,
    verifiedText: {
        fontSize: 10,
        color: COLORS.status.success,
    } as TextStyle,
    ratingText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: 4,
    } as TextStyle,
    dotSeparator: {
        marginHorizontal: 4,
        color: COLORS.textPlaceholder,
    } as TextStyle,
    tripCountText: {
        fontSize: 11,
        color: COLORS.textSecondary,
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
        color: COLORS.textMuted,
    } as TextStyle,
    routeContainer: {
        ...LAYOUT_MIXINS.rowCenter,
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
        backgroundColor: COLORS.borderDivider,
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
        gap: 8,
    } as ViewStyle,
    routePointText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    } as TextStyle,
    seatsBadge: {
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.bgLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    } as ViewStyle,
    seatsText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: 4,
    } as TextStyle,

    // --- 环境切换器与通用原子类 ---
    envSwitcher: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 999,
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.overlay,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    } as ViewStyle,
    envLabel: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "600",
        marginRight: 4,
    } as TextStyle,
    flexRowBetween: {
        ...LAYOUT_MIXINS.rowBetween,
    } as ViewStyle,
    flexRowCenter: {
        ...LAYOUT_MIXINS.rowCenter,
    } as ViewStyle,
});