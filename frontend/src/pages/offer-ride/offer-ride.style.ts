/**
 * @file offer-ride-style.ts
 * @description 拼车发布模块语义化样式表，重构版 - 遵循全局 Design Tokens
 */

import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, LAYOUT_MIXINS, commonStyles } from '@/pages/style';

export default StyleSheet.create({
    // --- 容器与通用布局 ---
    container: {
        ...commonStyles.flexOne,
        backgroundColor: COLORS.bgLight,
    },
    flexOne: {
        ...commonStyles.flexOne,
    },
    scrollSpacer: {
        height: 40,
    },

    // --- 头部样式 ---
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        ...LAYOUT_MIXINS.rowBetween,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.borderLight,
        borderRadius: 18,
        ...LAYOUT_MIXINS.center,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
        textAlign: 'center',
    },
    headerRightPlaceholder: {
        width: 40,
    },

    // --- 内容区域样式 ---
    content: {
        ...commonStyles.flexOne,
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: SPACING.md,
    },
    sectionTitleSmall: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    fieldLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: SPACING.sm,
    },

    // --- 路线绘制样式 ---
    routeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: 12,
        paddingTop: 20,
    },
    dotGreen: {
        width: 15,
        height: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 5,
    },
    dotOrange: {
        width: 15,
        height: 15,
        backgroundColor: COLORS.secondary,
        borderRadius: 5,
    },
    dotGray: {
        width: 9,
        height: 9,
        borderWidth: 2,
        borderColor: COLORS.textPlaceholder,
        borderRadius: 4,
        backgroundColor: COLORS.white,
    },
    dotGrayLight: {
        width: 9,
        height: 9,
        borderWidth: 1.5,
        borderColor: COLORS.borderDivider,
        borderRadius: 4,
        backgroundColor: 'transparent',
    },
    lineMain: {
        width: 2,
        backgroundColor: COLORS.borderLight,
        flex: 1,
        marginVertical: 10,
        minHeight: 90,
    },
    lineSmall: {
        width: 2,
        backgroundColor: COLORS.borderLight,
        height: 37,
        marginVertical: 4,
    },
    stopTimeline: {
        alignItems: 'center',
    },

    // --- 输入框通用样式 ---
    inputContainer: {
        ...commonStyles.flexOne,
        paddingRight: SPACING.sm,
    },
    inputWrapper: {
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        ...LAYOUT_MIXINS.rowCenter,
        ...LAYOUT_MIXINS.inputHeight,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    rnInput: {
        ...(commonStyles.flexOne as any),
        fontSize: 14,
        color: COLORS.textSub,
    },

    // --- 途经点样式 ---
    stopItem: {
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        padding: 12,
        ...LAYOUT_MIXINS.rowCenter,
        marginBottom: 12,
    },
    stopDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: COLORS.textMuted,
        marginRight: SPACING.sm,
    },
    stopText: {
        ...(commonStyles.flexOne as any),
        color: COLORS.textSub,
        fontSize: 14,
    },
    addStopRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    addStopInputWrapper: {
        ...commonStyles.flexOne,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        ...LAYOUT_MIXINS.rowCenter,
        ...LAYOUT_MIXINS.inputHeight,
        marginRight: SPACING.sm,
    },
    addButton: {
        backgroundColor: COLORS.bgTip,
        paddingHorizontal: SPACING.md,
        justifyContent: 'center',
        borderRadius: RADIUS.md,
    },
    addButtonText: {
        color: COLORS.primary,
        fontWeight: '500',
    },

    // --- 时间选择器样式 ---
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    selectTriggerContent: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    selectValueWrapper: {
        marginLeft: SPACING.sm,
    },
    recurringSection: {
        ...LAYOUT_MIXINS.rowBetween,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingHorizontal: 4,
    },
    recurringInfo: {
        ...commonStyles.flexOne,
    },
    calendarContainer: {
        marginTop: 10,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderCalendar,
        minHeight: 340,
    },
    timeSelector: {
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        ...LAYOUT_MIXINS.inputHeight,
        ...LAYOUT_MIXINS.rowCenter,
    },
    timeIcon: {
        marginRight: SPACING.sm,
    },
    timeText: {
        ...(commonStyles.flexOne as any), // 或者断言为 TextStyle
        color: COLORS.textSub,
        fontWeight: '500',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.md,
    },
    timeChip: {
        width: '23%',
        paddingVertical: 12,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        ...LAYOUT_MIXINS.center,
        marginRight: '2%',
        marginBottom: SPACING.sm,
    },
    timeChipActive: {
        backgroundColor: COLORS.primary,
    },
    timeChipText: {
        fontSize: 14,
        color: COLORS.textSub,
        fontWeight: '500',
    },
    timeChipTextActive: {
        color: COLORS.white,
    },

    // --- 重复设置样式 ---
    recurringRow: {
        marginTop: SPACING.md,
        ...LAYOUT_MIXINS.rowBetween,
        backgroundColor: COLORS.bgLight,
        padding: 12,
        borderRadius: RADIUS.md,
    },
    recurringTitle: {
        fontSize: 14,
        color: COLORS.textSub,
        fontWeight: '500',
    },
    recurringSub: {
        fontSize: 12,
        color: COLORS.textMuted,
    },

    // --- 计数器与价格样式 ---
    counterContainer: {
        ...LAYOUT_MIXINS.rowBetween,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
    },
    counterBtn: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        ...LAYOUT_MIXINS.center,
    },
    counterBtnPlus: {
        backgroundColor: COLORS.primary,
    },
    counterBtnText: {
        fontSize: 18,
        color: COLORS.textSub,
    },
    counterBtnTextPlus: {
        fontSize: 18,
        color: COLORS.white,
    },
    counterDisplay: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    counterIcon: {
        marginRight: 4,
    },
    counterValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    priceInputWrapper: {
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.sm,
        ...LAYOUT_MIXINS.inputHeight,
        ...LAYOUT_MIXINS.rowCenter,
    },
    priceInput: {
        ...(commonStyles.flexOne as any),
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.textMain,
        paddingHorizontal: SPACING.sm,
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 2,
        minWidth: 30,
    },
    tipBox: {
        marginTop: 12,
        backgroundColor: COLORS.bgTip,
        padding: 12,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderTip,
    },
    tipText: {
        fontSize: 12,
        color: COLORS.textTip,
        lineHeight: 18,
    },

    // --- 备注样式 ---
    noteHeader: {
        ...LAYOUT_MIXINS.rowCenter,
        marginBottom: 12,
    },
    noteIcon: {
        marginRight: SPACING.sm,
    },
    textareaCustom: {
        minHeight: 100,
        fontSize: 14,
        padding: 12,
        textAlignVertical: 'top',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    tagText: {
        fontSize: 12,
        color: COLORS.textSub,
    },

    // --- 底部按钮样式 ---
    footer: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    publishBtn: {
        width: '100%',
        ...LAYOUT_MIXINS.buttonHeight,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        ...LAYOUT_MIXINS.center,
    },
    successBtn: {
        backgroundColor: COLORS.primary,
        ...LAYOUT_MIXINS.buttonHeight,
        borderRadius: RADIUS.lg,
        ...LAYOUT_MIXINS.rowCenter,
        justifyContent: 'center',
    },
    successIcon: {
        marginRight: SPACING.sm,
    },
    publishBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    disabledText: {
        color: COLORS.textMuted,
    },
});