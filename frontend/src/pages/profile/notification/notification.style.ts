/**
 * @file notification.style.ts
 * @description 消息通知页面的专属样式表，遵循 UI 规范与原子化布局
 */

import { StyleSheet } from "react-native";
import {
    COLORS as GLOBAL_COLORS,
    SPACING,
    RADIUS,
    SHADOWS,
    LAYOUT_MIXINS
} from "@/pages/style";

/**
 * 局部常量配置
 * 严格禁止在此处直接定义 Hex 颜色，必须引用 GLOBAL_COLORS
 */
export const COLORS = Object.freeze({
    primary: GLOBAL_COLORS.primary,
    primaryLight: GLOBAL_COLORS.primaryLight,
    secondary: GLOBAL_COLORS.secondary,
    info: GLOBAL_COLORS.info,
    error: GLOBAL_COLORS.error,
    white: GLOBAL_COLORS.white,
    textMain: GLOBAL_COLORS.textMain,
    textSecondary: GLOBAL_COLORS.textSecondary,
    textMuted: GLOBAL_COLORS.textMuted,
    textPlaceholder: GLOBAL_COLORS.textPlaceholder,
    bgBlueLight: GLOBAL_COLORS.bgBlueLight,
    bgOrangeLight: GLOBAL_COLORS.bgOrangeLight,
    bgGrayLight: GLOBAL_COLORS.imagePlaceholder,
    tabActive: GLOBAL_COLORS.primary,
});

export default StyleSheet.create({
    /** 头部标题 */
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    /** Tab 容器 */
    tabsWrapper: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        // 修复：使用原子化间隔
        paddingBottom: SPACING.xs,
    },
    /** 列表内容容器 */
    listContent: {
        padding: SPACING.md,
    },
    /** 通知卡片 */
    notificationCard: {
        ...LAYOUT_MIXINS.rowCenter,
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        ...SHADOWS.xs,
    },
    /** 图标外层容器 */
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.sm,
        ...LAYOUT_MIXINS.center,
        position: 'relative',
    },
    /** 未读红点 */
    unreadDot: {
        position: 'absolute',
        top: -SPACING.xs / 2, // 消除魔法值
        right: -SPACING.xs / 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.error,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    /** 主体内容区 */
    contentMain: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    /** 通知标题 */
    notifTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: SPACING.xs,
    },
    /** 时间文本 */
    timeText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    /** 通知摘要内容 */
    notifContent: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    /** 空状态容器 */
    emptyContainer: {
        ...LAYOUT_MIXINS.center,
        // 修复：使用比例或栅格间隔
        marginTop: SPACING.xl * 3,
    },
    /** 空状态文本 */
    emptyText: {
        color: COLORS.textMuted,
        marginTop: SPACING.md,
    },
    /** 列表项间隔 */
    separator: {
        height: SPACING.md,
    },
    /** 全屏加载容器 */
    loadingContainer: {
        ...LAYOUT_MIXINS.center,
        flex: 1,
    }
});