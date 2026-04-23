/**
 * @file edit-vehicle-information.style.ts
 * @description 车辆信息编辑页面的专用样式表，包含严谨的跨平台适配逻辑与色彩系统
 */

import { StyleSheet, Platform } from "react-native";

/**
 * 语义化颜色系统
 * 严格执行禁止硬编码要求
 */
export const COLORS = Object.freeze({
    primary: "#10b981",
    primaryLight: "#ecfdf5",
    textPrimary: "#1f2937",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    bgLight: "#f9fafb",
    white: "#ffffff",
    border: "#f3f4f6",
    error: "#ef4444",
    warningBg: "#fffbeb",
    warningText: "#92400e",
    warningIcon: "#f59e0b",
    disabled: "#d1d5db", // 新增：标准禁用色
    transparentWhite: "rgba(255, 255, 255, 0.5)",
});

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    // 导航栏容器 - 适配不同平台高度感官
    navbar: {
        height: Platform.OS === 'ios' ? 44 : 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: StyleSheet.hairlineWidth, // 使用 hairlineWidth 提升边缘精致感
        borderBottomColor: COLORS.border,
    },
    navTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    navButton: {
        minWidth: 44, // 保证热区符合人类工效学
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
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
        padding: 20,
        // 配合 keyboardShouldPersistTaps="handled" 确保底部不被遮挡
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoUploadBox: {
        width: '100%',
        height: 140,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    uploadSubText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        paddingLeft: 4,
    },
    formCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        marginBottom: 20,
        // 卡片微阴影
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputHint: {
        flexDirection: 'row',
        alignItems: 'center',
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
        gap: 12, // React Native 0.71+ 支持 gap 属性
    },
    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    switchSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    innerSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.warningBg,
        padding: 12,
        borderRadius: 12,
        alignItems: 'flex-start', // 文本多行时对齐基准
    },
    warningMsgText: { // 重命名避免与 COLORS 冲突
        flex: 1,
        fontSize: 12,
        color: COLORS.warningText,
        marginLeft: 8,
        lineHeight: 18,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
        backgroundColor: COLORS.primary,
        borderRadius: 27, // 精确为高度的一半
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // 按钮增强视觉深度
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    updateBtnDisabled: {
        backgroundColor: COLORS.disabled,
        elevation: 0, // 禁用时去除投影
        shadowOpacity: 0,
    }
});