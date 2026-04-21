/**
 * @file offer-ride-style.ts
 * @description 拼车发布模块语义化样式表，遵循设计系统变量规范
 */

import { StyleSheet } from "react-native";

/**
 * 语义化颜色常量定义，严禁在组件内使用硬编码色值
 */
export const COLORS = Object.freeze({
    // 品牌色与状态色
    primary: '#10B981',      // 绿色 (Success/Primary)
    secondary: '#3b82f6',    // 蓝色 (Time/Info)
    warning: '#fb923c',      // 橙色 (Destination/Warning)
    danger: '#ef4444',       // 红色

    // 背景色
    background: '#f9fafb',   // 页面背景
    card: '#ffffff',         // 卡片背景
    inputBg: '#f9fafb',      // 输入框背景
    buttonDisabled: '#f3f4f6',
    tagBg: '#f3f4f6',
    tipBg: '#f0fdf4',
    calendarBg: '#ffffff',

    // 文字颜色
    textPrimary: '#1f2937',  // 深灰/黑
    textSecondary: '#4b5563', // 中灰
    textTertiary: '#9ca3af',  // 浅灰
    textButtonGrey: '#EFEFF4',
    textLight: '#ffffff',     // 白色文字
    textLink: '#10B981',
    textTip: '#166534',

    // 边框与线条
    border: '#f3f4f6',
    borderLight: '#d1d5db',
    borderExtraLight: '#E5E7EB',
    borderTip: '#dcfce7',
    borderCalendar: '#f0f0f0',
});

/**
 * 导出拼车发布页标准化样式对象
 */
export default StyleSheet.create({
    // --- 容器与通用布局 ---
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flexOne: {
        flex: 1,
    },
    scrollSpacer: {
        height: 40,
    },

    // --- 头部样式 ---
    header: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.buttonDisabled,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },

    // --- 内容区域样式 ---
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    sectionTitleSmall: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    fieldLabel: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: 8,
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
        backgroundColor: COLORS.warning,
        borderRadius: 5,
    },
    dotGray: {
        width: 9,
        height: 9,
        borderWidth: 2,
        borderColor: COLORS.borderLight,
        borderRadius: 4,
        backgroundColor: COLORS.card,
    },
    dotGrayLight: {
        width: 9,
        height: 9,
        borderWidth: 1.5,
        borderColor: COLORS.borderExtraLight,
        borderRadius: 4,
        backgroundColor: 'transparent',
    },
    lineMain: {
        width: 2,
        backgroundColor: COLORS.border,
        flex: 1,
        marginVertical: 10,
        minHeight: 90,
    },
    lineSmall: {
        width: 2,
        backgroundColor: COLORS.border,
        height: 37,
        marginVertical: 4,
    },
    stopTimeline: {
        alignItems: 'center',
    },

    // --- 输入框通用样式 ---
    inputContainer: {
        flex: 1,
        paddingRight: 8,
    },
    inputWrapper: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 8,
    },
    rnInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // --- 途经点样式 ---
    stopItem: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stopDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: COLORS.textTertiary,
        marginRight: 8,
    },
    stopText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    addStopRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    addStopInputWrapper: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        marginRight: 8,
    },
    addButton: {
        backgroundColor: COLORS.tipBg,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectValueWrapper: {
        marginLeft: 8,
    },
    recurringSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 4,
    },

    recurringInfo: {
        flex: 1,
    },
    calendarContainer: {
        marginTop: 10,
        backgroundColor: COLORS.calendarBg,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderCalendar,
        minHeight: 340,
    },
    timeSelector: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeIcon: {
        marginRight: 8,
    },
    timeText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
    },
    timeChip: {
        width: '23%',
        paddingVertical: 12,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: '2%',
        marginBottom: 8,
    },
    timeChipActive: {
        backgroundColor: COLORS.primary,
    },
    timeChipText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timeChipTextActive: {
        color: COLORS.textLight,
    },

    // --- 重复设置样式 ---
    recurringRow: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.inputBg,
        padding: 12,
        borderRadius: 12,
    },
    recurringTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    recurringSub: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },

    // --- 计数器与价格样式 ---
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 8,
    },
    counterBtn: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterBtnPlus: {
        backgroundColor: COLORS.primary,
    },
    counterBtnText: {
        fontSize: 18,
        color: COLORS.textSecondary,
    },
    counterBtnTextPlus: {
        fontSize: 18,
        color: COLORS.textLight,
    },
    counterDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterIcon: {
        marginRight: 4,
    },
    counterValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    priceInputWrapper: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 8,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.textPrimary,
        paddingHorizontal: 8,
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginLeft: 2,
        minWidth: 30,
    },
    tipBox: {
        marginTop: 12,
        backgroundColor: COLORS.tipBg,
        padding: 12,
        borderRadius: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    noteIcon: {
        marginRight: 8,
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
        color: COLORS.textSecondary,
    },

    // --- 底部按钮样式 ---
    footer: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    publishBtn: {
        width: '100%',
        height: 56, // 给定高度或 padding
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        marginRight: 8,
    },
    publishBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    disabledText: {
        color: COLORS.textTertiary,
    },
});