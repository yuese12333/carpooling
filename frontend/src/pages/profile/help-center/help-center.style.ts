/**
 * @file help-center.style.ts
 * @description 帮助中心页面的样式定义文件，包含搜索、网格分类及 QA 列表的布局约束。
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
// 规范：严格基于全局设计体系进行样式构建
import { COLORS as GLOBAL_COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS } from "@/pages/style";

/**
 * 页面专用语义化颜色常量
 * 冻结对象防止运行时篡改
 */
export const COLORS = Object.freeze({
    ...GLOBAL_COLORS,
    accordionBg: GLOBAL_COLORS.white,
    answerBg: GLOBAL_COLORS.bgLight,
    questionText: GLOBAL_COLORS.textSub,
    answerText: GLOBAL_COLORS.textMuted,
    dividerLine: GLOBAL_COLORS.dividerLight,
});

/**
 * 局部常量，用于消除布局幻数
 */
const ICON_SIZE = 52;
const CATEGORY_WIDTH = '23%';

export default StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    } as TextStyle,

    scrollContent: {
        paddingBottom: SPACING.xl,
    } as ViewStyle,

    searchSection: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    } as ViewStyle,

    searchGreeting: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textMain,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    } as TextStyle,

    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 15,
        color: COLORS.textMain,
    } as TextStyle,

    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.md,
        justifyContent: 'space-between',
    } as ViewStyle,

    categoryItem: {
        width: CATEGORY_WIDTH,
        alignItems: 'center',
        marginBottom: SPACING.md,
    } as ViewStyle,

    iconBox: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: RADIUS.md,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.xs,
        ...SHADOWS.xs,
    } as ViewStyle,

    categoryTitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    } as TextStyle,

    sectionHeader: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    } as ViewStyle,

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    } as TextStyle,

    qaContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    } as ViewStyle,

    accordionHeader: {
        backgroundColor: COLORS.accordionBg,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.lg,
    } as ViewStyle,

    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.questionText,
        lineHeight: 22,
    } as TextStyle,

    answerContainer: {
        paddingHorizontal: 40,
        paddingBottom: SPACING.lg,
        paddingTop: SPACING.sm,
        backgroundColor: COLORS.answerBg,
    } as ViewStyle,

    answerText: {
        fontSize: 15,
        color: COLORS.answerText,
        lineHeight: 24,
    } as TextStyle,

    divider: {
        backgroundColor: COLORS.dividerLine,
    } as ViewStyle,

    serviceCardsRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        justifyContent: 'space-between',
    } as ViewStyle,

    serviceCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    } as ViewStyle,

    serviceMainText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    } as TextStyle,

    serviceSubText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2, // 允许微调边距
    } as TextStyle,
});