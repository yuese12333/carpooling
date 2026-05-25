/**
 * @file register-style.ts
 * @description 用户注册模块样式表。已完成重构，完全复用全局 Design Tokens。
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, commonStyles } from '@/pages/style';

const styles = StyleSheet.create({
    ...commonStyles, // 继承 flexOne, scrollContent 等通用容器

    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    /** 头部背景区域 */
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 44 : SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.whiteTrans[20],
        borderRadius: RADIUS.xl / 2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.lg,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "bold",
    },
    mockBadge: {
        marginLeft: SPACING.md,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        backgroundColor: COLORS.whiteTrans[30],
        borderRadius: RADIUS.xs,
    },
    mockText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.whiteTrans[70],
        fontSize: 14,
        marginBottom: SPACING.lg,
    },

    /** 注册步骤条 */
    stepWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.sm,
    },
    stepItem: {
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    stepCircleActive: {
        backgroundColor: COLORS.whiteTrans[20],
        borderColor: COLORS.white,
    },
    stepCircleCompleted: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.white,
    },
    stepCircleInactive: {
        borderColor: COLORS.status.inactive,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: RADIUS.xs,
    },
    stepDotActive: {
        backgroundColor: COLORS.white,
    },
    stepDotInactive: {
        backgroundColor: COLORS.status.inactive,
    },
    stepLabel: {
        fontSize: 10,
        marginTop: SPACING.xs,
    },
    stepLabelActive: {
        color: COLORS.white,
    },
    stepLabelInactive: {
        color: COLORS.whiteTrans[50],
    },
    stepConnector: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.status.inactive,
        marginHorizontal: SPACING.md,
    },
    stepConnectorFill: {
        height: "100%",
        backgroundColor: COLORS.white,
    },

    /** 表单区域 */
    formContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xl,
    },
    inputLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    marginTopMd: {
        marginTop: SPACING.md,
    },

    /** 验证码组件 */
    verifyRow: {
        flexDirection: "row",
    },
    verifyButton: {
        justifyContent: "center",
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        marginLeft: SPACING.sm,
    },
    bgLightGreen: {
        backgroundColor: COLORS.primaryLight,
    },
    bgGray: {
        backgroundColor: COLORS.borderLight,
    },
    verifyButtonText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    textGreen: {
        color: COLORS.primaryDark,
    },
    textGray: {
        color: COLORS.textMuted,
    },

    /** 密码强度指示器 */
    strengthContainer: {
        marginTop: SPACING.md,
    },
    strengthProgress: {
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 4,
    },

    /** 用户协议 */
    agreementRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.lg,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: RADIUS.xs,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxInactive: {
        borderColor: COLORS.borderDivider,
    },
    agreementText: {
        marginLeft: SPACING.sm,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    agreementLink: {
        color: COLORS.primary,
    },

    /** 提交按钮复用 */
    submitButton: {
        ...commonStyles.primaryButton,
        marginTop: SPACING.xxl,
    },

    /** 异常信息反馈 */
    generalErrorBox: {
        marginTop: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.errorLight,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.errorBorder,
    },
    generalErrorText: {
        color: COLORS.errorDark,
        fontSize: 12,
        textAlign: "center",
    },

    /** 底部跳转 */
    footer: {
        marginTop: SPACING.xxl,
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: SPACING.lg,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: SPACING.xs,
    },
});

export default styles;