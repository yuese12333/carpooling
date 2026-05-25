/**
 * @file find-ride-style.ts
 * @description 拼车行程搜索列表页面样式表，已接入全局 Design Tokens
 */

import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, LAYOUT_MIXINS } from '@/pages/style';

const styles = StyleSheet.create({
    // --- 页面基础容器 ---
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },

    // --- 顶部导航区域 ---
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    topBar: {
        ...LAYOUT_MIXINS.rowBetween,
        paddingVertical: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.borderLight,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // --- 搜索输入区域 ---
    searchContainer: {
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    searchRow: {
        ...LAYOUT_MIXINS.rowCenter,
        paddingHorizontal: 4,
    },
    input: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 15,
        color: COLORS.textSub,
        paddingVertical: 4,
    },
    searchDivider: {
        height: 1,
        backgroundColor: COLORS.borderDivider,
        marginLeft: 28,
        marginVertical: SPACING.sm,
    },
    searchSubmit: {
        backgroundColor: COLORS.primary,
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
    },

    // --- 筛选与排序 ---
    filterScroll: {
        flexDirection: 'row',
    },
    filterTag: {
        marginRight: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
    },
    filterTagActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.white,
    },
    sortDropdown: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    sortOption: {
        marginRight: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    sortOptionActive: {
        backgroundColor: COLORS.primaryLight,
    },
    sortText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sortTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // --- 列表与卡片 ---
    listContainer: {
        flex: 1,
        paddingHorizontal: SPACING.md,
    },
    listContent: {
        paddingTop: SPACING.md,
        paddingBottom: 40,
    },
    resultCount: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.card,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
    },
    fullBadge: {
        backgroundColor: COLORS.borderLight,
        alignItems: 'center',
        paddingVertical: 6,
    },
    fullBadgeText: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cardContent: {
        padding: SPACING.md,
    },

    // --- 司机信息模块 ---
    driverRow: {
        ...LAYOUT_MIXINS.rowCenter,
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 48,
        height: 48,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 20,
        height: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedIcon: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: 'bold',
    },
    driverMeta: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    nameRow: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    driverName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
        marginRight: SPACING.sm,
    },
    carText: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    ratingRow: {
        ...LAYOUT_MIXINS.rowCenter,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    verticalDivider: {
        width: 1,
        height: 12,
        backgroundColor: COLORS.borderDivider,
        marginHorizontal: SPACING.sm,
    },
    tripCount: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currencySymbol: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    priceValue: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '900',
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 2,
    },

    // --- 路线视觉模块 ---
    routeRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    routeVisualContainer: {
        alignItems: 'center',
        width: 20,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    dotGreen: {
        width: 10,
        height: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
        zIndex: 1,
    },
    dotOrange: {
        width: 10,
        height: 10,
        backgroundColor: COLORS.secondary,
        borderRadius: 5,
        zIndex: 1,
    },
    dashLine: {
        position: 'absolute',
        top: 10,
        bottom: 10,
        width: 1,
        backgroundColor: COLORS.borderDivider,
        zIndex: 0,
    },
    routeTextContainer: {
        flex: 1,
        marginLeft: SPACING.sm,
        height: 60,
        justifyContent: 'space-between',
    },
    addressBlock: {
        height: 20,
        justifyContent: 'center',
    },
    addressHeader: {
        ...LAYOUT_MIXINS.rowBetween,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSub,
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: SPACING.sm,
    },

    // --- 卡片底部 ---
    cardFooter: {
        ...LAYOUT_MIXINS.rowBetween,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: SPACING.sm,
    },
    tagGroup: {
        flexDirection: 'row',
    },
    infoTagBlue: {
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.infoLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        marginRight: SPACING.sm,
    },
    tagTextBlue: {
        fontSize: 10,
        color: COLORS.info,
        fontWeight: '700',
        marginLeft: 4,
    },
    infoTagPurple: {
        ...LAYOUT_MIXINS.rowCenter,
        backgroundColor: COLORS.accentLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    tagTextPurple: {
        fontSize: 10,
        color: COLORS.accent,
        fontWeight: '700',
        marginLeft: 4,
    },
});

export default styles;