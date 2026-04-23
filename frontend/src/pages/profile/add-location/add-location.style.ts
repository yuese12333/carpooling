/**
 * @file add-location.style.ts
 * @description AddLocationPage 页面专属样式配置文件。
 * 已完成重构：接入全局 Design Tokens 与 Layout Mixins。
 */

import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, LAYOUT_MIXINS, commonStyles } from "@/pages/style";

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
     * 页面标题样式
     */
    navBar: {
        paddingTop: 12,
        ...LAYOUT_MIXINS.navBarBase,
        paddingBottom: 12,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    /**
     * 主体内容区域
     */
    content: {
        flex: 1,
        paddingHorizontal: 20, // 保持原页面特定间距
        paddingVertical: SPACING.md,
    },
    /**
     * 表单卡片容器
     */
    form: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: RADIUS.xxl,
        ...SHADOWS.xs, // 引用全局 XS 阴影实现卡片层级感
    },
    /**
     * 保存按钮主样式
     */
    saveBtn: {
        marginTop: 30,
        ...commonStyles.primaryButton,
    },
    /**
     * 按钮文本样式
     */
    saveBtnText: {
        ...commonStyles.primaryButtonText,
    },
    /**
     * 输入框标签样式
     */
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
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