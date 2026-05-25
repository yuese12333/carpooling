/**
 * @file trips-style.ts
 * @description “我的行程”页面专用样式表。
 * 已基于全局 Design Tokens 重构，保持 UI 表现 100% 一致。
 */

import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS, commonStyles } from '@/pages/style';

export default StyleSheet.create({
    /**
     * 容器级样式
     */
    safeAreaProvider: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },

    /**
     * 顶部导航与 Header
     */
    headerWrapper: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        zIndex: 10,
        ...SHADOWS.xs,
    },
    navBar: LAYOUT_MIXINS.rowBetween,

    navTitle: {
        fontSize: 18,
        fontWeight: Platform.OS === 'ios' ? "700" : "bold",
        color: COLORS.textMain,
        marginTop: SPACING.md,
        alignItems: 'center',
    },
    backBtn: {
        padding: SPACING.xs,
    },

    /**
     * Tab 切换器样式
     */
    filterContainer: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        alignItems: "center",
    },
    tabRow: LAYOUT_MIXINS.rowBetween,

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
        color: COLORS.textMuted,
    },

    /**
     * 列表内容与缺省态
     */
    scrollContentContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flexGrow: 1,
    },
    emptyContainer: {
        ...LAYOUT_MIXINS.center,
        paddingVertical: 80,
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.borderLight,
        borderRadius: 40,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.md,
    },

    /**
     * 行程卡片组件样式
     */
    cardContainer: {
        ...LAYOUT_MIXINS.cardBase,
        borderRadius: RADIUS.card,
        marginBottom: SPACING.md,
        overflow: "hidden",
        ...SHADOWS.xs,
    },
    cardHeader: {
        ...LAYOUT_MIXINS.rowBetween,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        backgroundColor: COLORS.overlayLight,
    },
    roleBadge: {
        backgroundColor: COLORS.borderLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: "500",
        color: COLORS.textSub,
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
        paddingVertical: SPACING.xs,
    },
    routeLine: {
        width: 1,
        height: 34,
        backgroundColor: COLORS.borderDivider,
        marginVertical: 1,
    },

    /**
     * 卡片底部交互区
     */
    cardFooter: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    footerBtn: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: "center",
    },
    footerBtnBorder: {
        borderRightWidth: 1,
        borderRightColor: COLORS.borderLight,
    },
    footerBtnHighlight: {
        backgroundColor: COLORS.primaryLight,
    }
});