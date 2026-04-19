/**
 * @file find-ride-style.ts
 * @description 拼车行程搜索列表页面样式表，采用分块架构组织 UI 规范
 */

import { StyleSheet } from "react-native";

/**
 * 颜色常量定义（品牌色与原子级颜色规范）
 */
export const COLORS = Object.freeze({
    // 品牌色与状态色
    primary: '#10B981',      // 翠绿色
    secondary: '#FB923C',    // 橙色
    info: '#3B82F6',         // 蓝色
    accent: '#A855F7',       // 紫色
    warning: '#FBBF24',      // 黄色

    // 背景色
    bgMain: '#F9FAFB',
    bgWhite: '#FFFFFF',
    bgGray: '#F3F4F6',
    bgLightGreen: '#DCFCE7',
    bgLightBlue: '#EFF6FF',
    bgLightPurple: '#FAF5FF',

    // 文字颜色
    textPrimary: '#1F2937',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
    textPlaceholder: '#9CA3AF',
    textWhite: '#FFFFFF',
    textInfo: '#2563EB',
    textAccent: '#9333EA',

    // 边框与线
    borderLight: '#F3F4F6',
    borderDefault: '#E5E7EB',
    dividerLine: '#F9FAFB', // 修正命名避免与样式键重名
});

/**
 * 布局与间距规范定义
 */
const LAYOUT = Object.freeze({
    radiusFull: 99,
    radiusCard: 24,
    radiusInner: 12,
    spacingBase: 16,
    spacingSm: 12,
});

const styles = StyleSheet.create({
    // --- 页面基础容器 ---
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },

    // --- 顶部导航区域 ---
    header: {
        backgroundColor: COLORS.bgWhite,
        paddingHorizontal: LAYOUT.spacingBase,
        paddingBottom: LAYOUT.spacingSm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: LAYOUT.spacingSm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.bgGray,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // --- 搜索输入区域 ---
    searchContainer: {
        backgroundColor: COLORS.bgMain,
        borderRadius: LAYOUT.radiusInner,
        padding: LAYOUT.spacingSm,
        marginBottom: LAYOUT.spacingSm,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    input: {
        flex: 1,
        marginLeft: LAYOUT.spacingSm,
        fontSize: 15,
        color: COLORS.textSecondary,
        paddingVertical: 4,
    },
    searchDivider: { // 重命名为 searchDivider 见名知意
        height: 1,
        backgroundColor: COLORS.borderDefault,
        marginLeft: 28,
        marginVertical: 8,
    },
    searchSubmit: {
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: LAYOUT.radiusInner,
    },

    // --- 筛选与排序 ---
    filterScroll: {
        flexDirection: 'row',
    },
    filterTag: {
        marginRight: 8,
        paddingHorizontal: LAYOUT.spacingBase,
        paddingVertical: 8,
        borderRadius: LAYOUT.radiusFull,
        backgroundColor: COLORS.bgWhite,
        borderWidth: 1,
        borderColor: COLORS.borderDefault,
    },
    filterTagActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textMuted,
    },
    filterTextActive: {
        color: COLORS.textWhite,
    },
    sortDropdown: {
        backgroundColor: COLORS.bgWhite,
        paddingHorizontal: LAYOUT.spacingBase,
        paddingVertical: LAYOUT.spacingSm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    sortOption: {
        marginRight: LAYOUT.spacingSm,
        paddingHorizontal: LAYOUT.spacingBase,
        paddingVertical: 6,
        borderRadius: LAYOUT.radiusFull,
    },
    sortOptionActive: {
        backgroundColor: COLORS.bgLightGreen,
    },
    sortText: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    sortTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // --- 列表与卡片 ---
    listContainer: {
        flex: 1,
        paddingHorizontal: LAYOUT.spacingBase,
    },
    listContent: {
        paddingTop: LAYOUT.spacingBase,
        paddingBottom: 40,
    },
    resultCount: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: LAYOUT.spacingBase,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.bgWhite,
        borderRadius: LAYOUT.radiusCard,
        marginBottom: LAYOUT.spacingBase,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
    },
    fullBadge: {
        backgroundColor: COLORS.bgGray,
        alignItems: 'center',
        paddingVertical: 6,
    },
    fullBadgeText: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    cardContent: {
        padding: LAYOUT.spacingBase,
    },

    // --- 司机信息模块 ---
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: LAYOUT.spacingBase,
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
        borderColor: COLORS.bgWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedIcon: {
        color: COLORS.textWhite,
        fontSize: 8,
        fontWeight: 'bold',
    },
    driverMeta: {
        flex: 1,
        marginLeft: LAYOUT.spacingSm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginRight: 8,
    },
    carText: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    verticalDivider: {
        width: 1,
        height: 12,
        backgroundColor: COLORS.borderDefault,
        marginHorizontal: 8,
    },
    tripCount: {
        fontSize: 12,
        color: COLORS.textLight,
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
        color: COLORS.textLight,
        marginLeft: 2,
    },

    // --- 路线视觉模块 ---
    routeRow: {
        flexDirection: 'row',
        marginBottom: LAYOUT.spacingBase,
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
        backgroundColor: COLORS.borderDefault,
        zIndex: 0,
    },
    routeTextContainer: {
        flex: 1,
        marginLeft: LAYOUT.spacingSm,
        height: 60,
        justifyContent: 'space-between',
    },
    addressBlock: {
        height: 20,
        justifyContent: 'center',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 8,
    },

    // --- 卡片底部 ---
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: COLORS.dividerLine,
        paddingTop: LAYOUT.spacingSm,
    },
    tagGroup: {
        flexDirection: 'row',
    },
    infoTagBlue: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgLightBlue,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    tagTextBlue: {
        fontSize: 10,
        color: COLORS.textInfo,
        fontWeight: '700',
        marginLeft: 4,
    },
    infoTagPurple: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgLightPurple,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagTextPurple: {
        fontSize: 10,
        color: COLORS.textAccent,
        fontWeight: '700',
        marginLeft: 4,
    },
});

export default styles;