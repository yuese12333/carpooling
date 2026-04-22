/**
 * @file edit-location.style.ts
 * @description 编辑地点页面的样式抽离、颜色系统及阴影规范定义
 */

import { StyleSheet } from "react-native";

/**
 * 核心颜色常量系统
 * 采用 Object.freeze 确保样式变量在运行时不可篡改
 */
export const COLORS = Object.freeze({
    primary: "#10b981",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    bgLight: "#f9fafb",
    white: "#ffffff",
    shadow: "#000000",
    iconDefault: "#9ca3af",
});

/**
 * 编辑地点页面专用样式表
 */
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    /**
     * 内容主体容器
     */
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    /**
     * 表单卡片容器
     * 集成了基于 iOS 的 shadow 和 Android 的 elevation 方案
     */
    formCard: {
        backgroundColor: COLORS.white,
        padding: 24,
        borderRadius: 24,
        // iOS 阴影
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        // Android 阴影
        elevation: 2,
    },
    /**
     * 输入项间距
     */
    inputSpacer: {
        height: 24,
    },
    /**
     * 底部操作区域
     * 注意：外部组件使用时必须包裹在 SafeAreaView 中
     */
    footer: {
        marginTop: 'auto',
        paddingHorizontal: 24,
        paddingBottom: 20, // 基础边距，配合 react-native-safe-area-context 使用
    },
    /**
     * 主更新按钮样式
     */
    updateBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 100,
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // 按钮深度感阴影
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    btnIcon: {
        marginRight: 8,
    },
    /**
     * 次要取消按钮
     */
    cancelBtn: {
        marginTop: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
});