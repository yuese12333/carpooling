/**
 * @file login.style.ts
 * @description 登录页面专用样式。已通过 Design Tokens 重构，去除冗余色值。
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, commonStyles } from '@/pages/style';

export default StyleSheet.create({
    /** 基础容器继承全局 SafeArea */
    container: commonStyles.safeAreaContainer,

    /** 键盘避让与滚动容器 */
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1 },

    /** 环境切换悬浮器 */
    envSwitcher: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 99,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.whiteTrans[80],
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
    },

    envLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },

    /** 头部视觉区块 */
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
        overflow: 'hidden',
    },

    headerCircleDecoration: {
        position: 'absolute',
        right: -20,
        top: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.whiteTrans[10],
    },

    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },

    logoEmoji: { fontSize: 30 },

    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },

    subtitleText: {
        fontSize: 14,
        color: COLORS.whiteTrans[80],
        marginTop: SPACING.xs,
    },

    /** 业务表单区域 */
    formContainer: { padding: SPACING.lg },
    inputFieldGroup: { marginBottom: SPACING.md },

    /** 继承全局输入框样式并微调 */
    inputControlWrapper: commonStyles.inputWrapper,

    phonePrefixContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: COLORS.borderDivider,
        paddingRight: SPACING.sm,
        marginRight: SPACING.xs,
        height: 28,
    },

    prefixLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginLeft: SPACING.sm,
    },

    flexInputField: {
        flex: 1,
        paddingHorizontal: SPACING.sm,
        height: 48,
        color: COLORS.textMain,
    },

    formOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    secondaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
    },

    primaryLinkText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },

    /** 按钮与交互 */
    mainSubmitButton: commonStyles.primaryButton,
    buttonLabelText: commonStyles.primaryButtonText,

    /** 错误警告边距 */
    errorAlertMargin: {
        marginBottom: 16,
    },

    /** 错误警告文本 */
    errorAlertText: {
        color: COLORS.error,
        fontSize: 13,
        textAlign: 'center',
    },

    validationErrorMessage: {
        fontSize: 12,
        color: COLORS.error,
        marginTop: SPACING.xs,
        paddingLeft: SPACING.xs,
    },

    /** 分割线 */
    dividerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    horizontalLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderDivider,
    },
    dividerLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.md,
    },

    /** 社交登录 */
    socialActionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    socialItemWrapper: {
        alignItems: 'center',
        marginHorizontal: SPACING.md,
    },
    socialIconButton: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.white,
        borderColor: COLORS.borderDivider,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialEmojiText: { fontSize: 24 },
    socialIconLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },

    /** 页脚 */
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryHighlightText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    footerInlineBtn: {
        marginLeft: SPACING.xs,
    },
});