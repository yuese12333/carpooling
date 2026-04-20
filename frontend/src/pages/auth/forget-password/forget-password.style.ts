/**
 * @file forget-password.style.ts
 * @description 找回密码页面的样式定义文件，采用模块化色板与响应式布局配置。
 */

import { StyleSheet, ViewStyle, TextStyle } from "react-native";

/** * 颜色常量定义
 */
export const COLORS = Object.freeze({
    // 主色调 (Emerald/Green)
    primary: '#10B981',
    primaryLight: '#ECFDF5',
    primaryDark: '#059669',

    // 基础色
    white: '#FFFFFF',
    bgLight: '#F9FAFB',
    bgInput: '#F9FAFB',
    borderLight: '#F3F4F6',
    borderDivider: '#E5E7EB',

    // 文字色
    textMain: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textPlaceholder: '#9CA3AF',

    // 反馈色
    error: '#EF4444',
    errorLight: '#FEF2F2',
    errorBorder: '#FEE2E2',

    // 强度校验色
    strengthWeak: '#F87171',
    strengthMedium: '#FBBF24',
    strengthStrong: '#60A5FA',
    strengthVeryStrong: '#10B981',

    // 透明度辅助色
    whiteTransparent20: 'rgba(255, 255, 255, 0.2)',
    whiteTransparent30: 'rgba(255, 255, 255, 0.3)',
    whiteTransparent40: 'rgba(255, 255, 255, 0.4)',
    whiteTransparent80: 'rgba(255, 255, 255, 0.8)',
});

/** * 找回密码页面专用样式表
 */
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight
    } as ViewStyle,
    flexCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    } as ViewStyle,
    card: {
        width: "100%",
        maxWidth: 450,
        minHeight: 600,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        overflow: "hidden",
    } as ViewStyle,
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 30
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.whiteTransparent20,
        justifyContent: "center",
        alignItems: "center",
    } as ViewStyle,
    headerContent: {
        marginTop: 30
    } as ViewStyle,
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.white
    } as TextStyle,
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.whiteTransparent80,
        marginTop: 5
    } as TextStyle,
    stepperContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        position: "relative"
    } as ViewStyle,
    stepperLine: {
        position: "absolute",
        top: 15,
        left: 10,
        right: 10,
        height: 1,
        backgroundColor: COLORS.whiteTransparent30
    } as ViewStyle,
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1
    } as ViewStyle,
    stepCircleActive: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.white
    } as ViewStyle,
    stepCircleInactive: {
        backgroundColor: "transparent",
        borderColor: COLORS.whiteTransparent40
    } as ViewStyle,
    stepText: {
        fontSize: 12,
        fontWeight: "bold"
    } as TextStyle,
    stepTextActive: {
        color: COLORS.primary
    } as TextStyle,
    stepTextInactive: {
        color: COLORS.whiteTransparent80
    } as TextStyle,
    formContent: {
        flex: 1,
        padding: 30
    } as ViewStyle,
    fullWidth: {
        width: "100%"
    } as ViewStyle,
    label: {
        color: COLORS.textMuted,
        marginBottom: 8,
        fontSize: 14
    } as TextStyle,
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.bgInput,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
        paddingHorizontal: 15,
        height: 56
    } as ViewStyle,
    inputError: {
        borderColor: COLORS.errorBorder,
        backgroundColor: COLORS.errorLight
    } as ViewStyle,
    inputIcon: {
        marginRight: 12
    } as ViewStyle,
    prefix: {
        color: COLORS.textPlaceholder,
        borderRightWidth: 1,
        borderRightColor: COLORS.borderDivider,
        paddingRight: 12,
        marginRight: 12,
        fontSize: 14
    } as TextStyle,
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textSecondary
    } as TextStyle,
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4
    } as TextStyle,
    submitBtn: {
        marginTop: 25,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    submitBtnText: {
        color: COLORS.white, // 确保是白色
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    stepHint: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: "center",
        marginBottom: 30
    } as TextStyle,
    boldText: {
        fontWeight: "bold",
        color: COLORS.textMain
    } as TextStyle,
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        width: "100%"
    } as ViewStyle,
    otpInput: {
        width: "14%",
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    } as TextStyle,
    otpInputActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        color: COLORS.primaryDark
    } as TextStyle,
    otpInputInactive: {
        borderColor: COLORS.borderLight,
        backgroundColor: COLORS.bgInput
    } as TextStyle,
    resendBtn: {
        alignItems: "center",
        marginBottom: 20
    } as ViewStyle,
    resendText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "600"
    } as TextStyle,
    disabledText: {
        color: COLORS.textPlaceholder
    } as TextStyle,
    inputGroup: {
        marginBottom: 20
    } as ViewStyle,
    strengthContainer: {
        marginTop: 10
    } as ViewStyle,
    progressBase: {
        height: 4,
        borderRadius: 2
    } as ViewStyle,
    strengthText: {
        fontSize: 10,
        textAlign: "right",
        marginTop: 4,
        fontWeight: "600"
    } as TextStyle,
    successWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    } as ViewStyle,
    successIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    } as ViewStyle,
    successTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.textMain,
        marginBottom: 8
    } as TextStyle,
    successSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: "center",
        marginBottom: 40
    } as TextStyle,
    dotContainer: {
        flexDirection: "row"
    } as ViewStyle,
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginHorizontal: 2
    } as ViewStyle,
    dotOpacity6: {
        opacity: 0.6
    } as ViewStyle,
    dotOpacity3: {
        opacity: 0.3
    } as ViewStyle,
});

export default styles;