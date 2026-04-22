/**
 * @file add-location.style.ts
 * @description AddLocationPage 页面专属样式配置文件。
 */

import { StyleSheet } from "react-native";

/**
 * 页面级色彩配置表 (只读)
 * 建议后续迁移至全局 Theme 管理系统
 */
export const COLORS = Object.freeze({
    primary: "#10b981",
    textPrimary: "#1f2937",
    textSecondary: "#4b5563",
    bgLight: "#f9fafb",
    white: "#ffffff",
    iconDefault: "#9ca3af",
    shadow: "#000000",
});

/**
 * AddLocation 页面样式表
 */
export default StyleSheet.create({
    /**
     * 根容器样式
     * 需配合 react-native-safe-area-context 使用以确保内容不被遮挡
     */
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    /**
     * 主体内容区域
     */
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    /**
     * 页面标题样式
     */
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 30,
        color: COLORS.textPrimary,
    },
    /**
     * 表单卡片容器
     */
    form: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 20,
        // 增强卡片层级感
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    /**
     * 保存按钮主样式
     */
    saveBtn: {
        marginTop: 30,
        backgroundColor: COLORS.primary,
        borderRadius: 100,
        height: 52, // 微调高度以符合 44/52 黄金交互高度
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /**
     * 按钮文本样式
     */
    saveBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    /**
     * 输入框标签样式
     */
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    /**
     * 占位间距组件样式
     * 用于 ScrollView 内部组件间的逻辑隔离
     */
    spacer: {
        height: 20,
    },
    /**
     * 底部辅助间距
     * 确保在非安全区域设备上有足够的留白
     */
    footerSpacer: {
        height: 40,
    },
});