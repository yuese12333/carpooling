/**
 * @file edit-vehicle-information.style.ts
 * @description 车辆信息编辑页面的专用样式表
 */

import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS, commonStyles } from '@/pages/style';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // 导航栏容器 - 复用全局 Navbar 布局
    navbar: {
        ...LAYOUT_MIXINS.navbar,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textMain,
        textAlign: 'center',
    },
    navButton: {
        ...LAYOUT_MIXINS.hitSlop,
    },
    saveText: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '600',
    },
    saveTextDisabled: {
        color: COLORS.textMuted,
        opacity: 0.6,
    },
    scrollContent: {
        padding: SPACING.md + 4, // 对应原 20px
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    photoUploadBox: {
        ...LAYOUT_MIXINS.dashedUpload,
    },
    cameraCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primaryLight,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.sm,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    uploadSubText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
    sectionHeader: {
        marginBottom: SPACING.md - 4,
        marginTop: SPACING.xs,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textMain,
        paddingLeft: 4,
    },
    formCard: {
        ...LAYOUT_MIXINS.mainCard,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        // 覆盖特定圆角以匹配 UI 原型
        borderRadius: RADIUS.lg,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        fontWeight: '500',
    },
    inputHint: {
        ...LAYOUT_MIXINS.rowCenter,
        marginTop: 6,
        paddingLeft: 4,
    },
    hintText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    switchItem: {
        ...LAYOUT_MIXINS.rowBetween,
        paddingVertical: 14,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    switchSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    innerSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.borderDivider,
        marginVertical: SPACING.xs,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.warningBg,
        padding: 12,
        borderRadius: RADIUS.md,
        alignItems: 'flex-start',
    },
    warningMsgText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.warningText,
        marginLeft: SPACING.sm,
        lineHeight: 18,
    },
    btnContent: {
        ...LAYOUT_MIXINS.rowCenter,
    },
    btnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    keyboardView: {
        flex: 1,
    },
    updateBtn: {
        ...commonStyles.primaryButton,
    },
    updateBtnDisabled: {
        backgroundColor: COLORS.disabled,
        elevation: 0,
        shadowOpacity: 0,
    }
});