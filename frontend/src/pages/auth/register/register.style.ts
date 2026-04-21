/**
 * @file register-style.ts
 * @description 用户注册模块样式表。遵循前端 RN 专项规范 2.3，包含主题色定义、组件布局及跨端样式补偿。
 * @version 1.0.0
 */

import { StyleSheet, Platform } from 'react-native';

/**
 * 注册模块专属颜色常量池
 * @description 严格遵循 UX 调色板，禁止在组件内直接使用 Hex 码
 */
export const COLORS = Object.freeze({
    // 主色调
    primary: '#10b981',
    primaryLight: '#f0fdf4',
    secondary: '#16a34a',

    // 基础色
    white: '#ffffff',
    grayBackground: '#f3f4f6',
    border: '#d1d5db',

    // 文字色
    textMain: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',

    // 反馈色
    error: '#ef4444',
    errorLight: '#fef2f2',
    errorBorder: '#fecaca',
    errorDark: '#b91c1c',

    // 透明度辅助色（用于叠加层）
    whiteTransparent20: 'rgba(255, 255, 255, 0.2)',
    whiteTransparent30: 'rgba(255, 255, 255, 0.3)',
    whiteTransparent50: 'rgba(255, 255, 255, 0.5)',
    whiteMuted: 'rgba(255, 255, 255, 0.7)',
});

/**
 * 注册页面样式定义
 */
const styles = StyleSheet.create({
    /** 基础容器布局 */
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    flexOne: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

    /** 头部背景与返回区域 */
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 44 : 32, // 针对 iOS 状态栏的简单补偿
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.whiteTransparent20,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "bold",
    },
    mockBadge: {
        marginLeft: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: COLORS.whiteTransparent30,
        borderRadius: 4,
    },
    mockText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.whiteMuted,
        fontSize: 14,
        marginBottom: 24,
    },

    /** 注册步骤条 (Step Indicator) */
    stepWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    stepItem: {
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    stepCircleActive: {
        backgroundColor: COLORS.whiteTransparent20,
        borderColor: COLORS.white,
    },
    stepCircleCompleted: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.white,
    },
    stepCircleInactive: {
        borderColor: COLORS.whiteTransparent30,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stepDotActive: {
        backgroundColor: COLORS.white,
    },
    stepDotInactive: {
        backgroundColor: COLORS.whiteTransparent30,
    },
    stepLabel: {
        fontSize: 10,
        marginTop: 4,
    },
    stepLabelActive: {
        color: COLORS.white,
    },
    stepLabelInactive: {
        color: COLORS.whiteTransparent50,
    },
    stepConnector: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.whiteTransparent30,
        marginHorizontal: 16,
    },
    stepConnectorFill: {
        height: "100%",
        backgroundColor: COLORS.white,
    },

    /** 表单输入区域 */
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    inputLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    marginTopMd: {
        marginTop: 16,
    },

    /** 验证码业务组件样式 */
    verifyRow: {
        flexDirection: "row",
    },
    verifyButton: {
        justifyContent: "center",
        paddingHorizontal: 16,
        borderRadius: 12,
        marginLeft: 8,
    },
    bgLightGreen: {
        backgroundColor: COLORS.primaryLight,
    },
    bgGray: {
        backgroundColor: COLORS.grayBackground,
    },
    verifyButtonText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    textGreen: {
        color: COLORS.secondary,
    },
    textGray: {
        color: COLORS.textMuted,
    },

    /** 密码强度指示器 */
    strengthContainer: {
        marginTop: 12,
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

    /** 用户协议勾选区 */
    agreementRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxInactive: {
        borderColor: COLORS.border,
    },
    agreementText: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    agreementLink: {
        color: COLORS.primary,
    },

    /** 提交动作区域 */
    submitButton: {
        marginTop: 40,
        backgroundColor: COLORS.primary,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
        // 修正 Android 字体垂直居中偏离问题
        includeFontPadding: false,
        textAlignVertical: "center",
    },

    /** 异常信息反馈 */
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
    },
    generalErrorBox: {
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.errorLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.errorBorder,
    },
    generalErrorText: {
        color: COLORS.errorDark,
        fontSize: 12,
        textAlign: "center",
    },

    /** 底部辅助跳转 */
    footer: {
        marginTop: 40,
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 24,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 4,
    },
});

export default styles;