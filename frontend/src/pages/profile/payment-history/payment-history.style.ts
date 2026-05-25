/**
 * @file payment-history.style.ts
 * @description 支付历史页面的专用样式定义。遵循响应式布局与设计系统规范。
 */

import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS } from "../../style";

/**
 * 导出 COLORS 供页面逻辑（如图标颜色、ActivityIndicator 等）动态消费
 */
export { COLORS };

interface Styles {
    container: ViewStyle;
    header: ViewStyle;
    backButton: ViewStyle;
    headerTitle: TextStyle;
    filterButton: ViewStyle;
    scrollContent: ViewStyle;
    statsContainer: ViewStyle;
    statsCard: ViewStyle;
    statsLabel: TextStyle;
    statsValue: TextStyle;
    calendarTag: ViewStyle;
    calendarText: TextStyle;
    tabsContainer: ViewStyle;
    listContainer: ViewStyle;
    historyCard: ViewStyle;
    cardHeader: ViewStyle;
    iconContainer: ViewStyle;
    titleWrapper: ViewStyle;
    historyTitle: TextStyle;
    historyDate: TextStyle;
    amountWrapper: ViewStyle;
    cardSeparator: ViewStyle;
    cardFooter: ViewStyle;
    methodInfo: ViewStyle;
    methodText: TextStyle;
    receiptBtn: ViewStyle;
    receiptText: TextStyle;
    emptyState: ViewStyle;
    emptyText: TextStyle;
    bottomNote: TextStyle;
    filterSheet: ViewStyle;
    filterSection: ViewStyle;
    filterLabel: TextStyle;
    filterBtn: ViewStyle;
    buttonGroup: ViewStyle;
    checkboxGroup: ViewStyle;
    checkboxItem: ViewStyle;
    typeIcon: ViewStyle;
    amountText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    header: {
        ...LAYOUT_MIXINS.navbar,
        backgroundColor: COLORS.white,
    },
    backButton: {
        ...LAYOUT_MIXINS.hitSlop,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    filterButton: {
        ...LAYOUT_MIXINS.hitSlop,
    },
    scrollContent: {
        // 预留足够滚动空间，避免被底部导航遮挡
        paddingBottom: SPACING.xxl,
    },
    statsContainer: {
        padding: SPACING.md,
    },
    statsCard: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.card,
        padding: SPACING.lg,
        ...SHADOWS.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statsLabel: {
        color: COLORS.textLighter,
        fontSize: 13,
        marginBottom: SPACING.xs,
    },
    statsValue: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800",
    },
    calendarTag: {
        backgroundColor: COLORS.whiteTrans[20],
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    calendarText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 6,
    },
    tabsContainer: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    listContainer: {
        paddingHorizontal: SPACING.md,
    },
    historyCard: {
        ...LAYOUT_MIXINS.mainCard,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.lg,
        ...SHADOWS.xs,
    },
    cardHeader: {
        ...LAYOUT_MIXINS.rowBetween,
        alignItems: "flex-start",
    },
    iconContainer: {
        flexDirection: "row",
        flex: 1,
    },
    titleWrapper: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.textMain,
        marginBottom: SPACING.xs,
    },
    historyDate: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    amountWrapper: {
        alignItems: "flex-end",
    },
    cardSeparator: {
        ...LAYOUT_MIXINS.separator,
        marginVertical: SPACING.md,
    },
    cardFooter: {
        ...LAYOUT_MIXINS.rowBetween,
    },
    methodInfo: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    methodText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: SPACING.xs,
    },
    receiptBtn: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    receiptText: {
        fontSize: 12,
        color: COLORS.info,
        fontWeight: "600",
        marginHorizontal: SPACING.xs,
    },
    emptyState: {
        padding: SPACING.xxl * 2, // 使用原子化间距
        alignItems: "center",
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    bottomNote: {
        textAlign: "center",
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: SPACING.lg,
    },
    filterSheet: {
        borderTopLeftRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.lg,
        // 物理 Padding 已移除，应由页面层 useSafeAreaInsets 动态注入以符合规范
    },
    filterSection: {
        paddingVertical: SPACING.lg,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: SPACING.md,
        color: COLORS.textMain,
    },
    filterBtn: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
        height: 40,
        width: 100,
        borderRadius: RADIUS.full, // 统一使用 RADIUS 系统
        alignItems: "center",
        justifyContent: "center",
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: SPACING.md,
        paddingVertical: SPACING.md,
    },
    checkboxGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    checkboxItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.borderLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
    },
    amountText: {
        fontSize: 16,
        fontWeight: "700",
    },
});

export default styles;