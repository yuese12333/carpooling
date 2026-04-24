/**
 * @file receipt-detail.style.ts
 * @description 凭证详情页面的专属样式表，采用原子化设计思想与全局设计系统变量
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, LAYOUT_MIXINS, SHADOWS } from '@/pages/style';

// 导出颜色常量，确保 ActivityIndicator 等内联组件引用一致性
export { COLORS };

// 局部常量定义，避免样式对象内部硬编码
const SUCCESS_ICON_SIZE = 60;
const FOOTER_CIRCLE_SIZE = 12;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.borderLight,
    },
    loadingContainer: {
        ...LAYOUT_MIXINS.center,
        flex: 1,
        backgroundColor: COLORS.borderLight,
    },
    header: {
        ...LAYOUT_MIXINS.navBarBase,
        paddingVertical: SPACING.sm + 2, // 对应原 12px，使符合栅格系统
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    headerRight: {
        padding: SPACING.xs,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },
    receiptWrapper: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    receiptCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xs,
        ...SHADOWS.sm,
    },
    receiptHeader: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    successIconBg: {
        width: SUCCESS_ICON_SIZE,
        height: SUCCESS_ICON_SIZE,
        borderRadius: SUCCESS_ICON_SIZE / 2, // 确保完美圆形
        backgroundColor: COLORS.primary,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.md,
    },
    merchantName: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: SPACING.md,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    amountValue: {
        fontSize: 40,
        fontWeight: '800',
        color: COLORS.textMain,
    },
    dottedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    dottedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
        borderStyle: 'dashed',
    },
    leftCutout: {
        width: 20,
        height: 20,
        borderRadius: RADIUS.full || 10,
        backgroundColor: COLORS.borderLight,
        marginLeft: -10,
    },
    rightCutout: {
        width: 20,
        height: 20,
        borderRadius: RADIUS.full || 10,
        backgroundColor: COLORS.borderLight,
        marginRight: -10,
    },
    receiptBody: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    routeBox: {
        flexDirection: 'row',
        marginBottom: SPACING.xs,
    },
    routeLine: {
        alignItems: 'center',
        width: 20,
        paddingVertical: SPACING.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: RADIUS.xs,
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.xs,
    },
    routeTexts: {
        flex: 1,
        marginLeft: 12,
    },
    locationText: {
        fontSize: 14,
        color: COLORS.textMain,
        fontWeight: '500',
    },
    bodySeparator: {
        marginVertical: SPACING.lg,
        backgroundColor: COLORS.borderLight,
        height: StyleSheet.hairlineWidth,
    },
    infoRow: {
        ...LAYOUT_MIXINS.rowBetween,
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    infoValue: {
        fontSize: 13,
        color: COLORS.textMain,
        fontWeight: '500',
    },
    rowRight: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    receiptFooterDecorator: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: -6, // 视觉偏移量：使下方锯齿装饰圆点与卡片主体无缝衔接
    },
    footerCircle: {
        width: FOOTER_CIRCLE_SIZE,
        height: FOOTER_CIRCLE_SIZE,
        borderRadius: FOOTER_CIRCLE_SIZE / 2,
        backgroundColor: COLORS.white,
    },
    actionContainer: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
    },
    buttonRow: {
        ...LAYOUT_MIXINS.rowBetween,
    },
    actionBtn: {
        width: '48%',
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.white,
        ...LAYOUT_MIXINS.center,
        ...SHADOWS.xs,
    },
    supportLink: {
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: 'center',
        marginTop: SPACING.lg,
    },
    supportText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginLeft: SPACING.sm - 2,
    },
});