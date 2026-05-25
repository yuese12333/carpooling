/**
 * @file forget-password.style.ts
 * @description 找回密码页面的样式定义文件，已完成 Design Token 化重构。
 */

import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, commonStyles } from '@/pages/style';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight
    } as ViewStyle,
    flexCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.lg
    } as ViewStyle,
    card: {
        width: "100%",
        maxWidth: 450,
        minHeight: 600,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xxl,
        ...SHADOWS.lg,
        overflow: "hidden",
    } as ViewStyle,
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingTop: SPACING.xxl,
        paddingBottom: 30
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.whiteTrans[20],
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
        color: COLORS.whiteTrans[80],
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
        backgroundColor: COLORS.whiteTrans[30]
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
        borderColor: COLORS.whiteTrans[40]
    } as ViewStyle,
    stepText: {
        fontSize: 12,
        fontWeight: "bold"
    } as TextStyle,
    stepTextActive: {
        color: COLORS.primary
    } as TextStyle,
    stepTextInactive: {
        color: COLORS.whiteTrans[80]
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
        marginBottom: SPACING.sm,
        fontSize: 14
    } as TextStyle,
    inputWrapper: {
        ...commonStyles.inputWrapper,
        backgroundColor: COLORS.bgLight, // 覆盖为页面特定背景
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: "transparent",
        height: 56,
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
        ...commonStyles.primaryButton,
        marginTop: 25,
        height: 56,
        borderRadius: RADIUS.lg,
    } as ViewStyle,
    submitBtnText: {
        ...commonStyles.primaryButtonText,
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
        marginBottom: SPACING.lg,
        width: "100%"
    } as ViewStyle,
    otpInput: {
        width: "14%",
        height: 56,
        borderRadius: RADIUS.md,
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
        backgroundColor: COLORS.bgLight
    } as TextStyle,
    resendBtn: {
        alignItems: "center",
        marginBottom: SPACING.lg
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
        marginBottom: SPACING.lg
    } as ViewStyle,
    strengthContainer: {
        marginTop: SPACING.sm
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
        marginBottom: SPACING.lg
    } as ViewStyle,
    successTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.textMain,
        marginBottom: SPACING.sm
    } as TextStyle,
    successSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: "center",
        marginBottom: SPACING.xxl
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