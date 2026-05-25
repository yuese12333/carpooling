/**
 * @file edit-location.style.ts
 * @description 编辑地点页面的样式重构 - 基于全局 Design Tokens
 */

import { StyleSheet } from "react-native";
import { COLORS, SPACING, LAYOUT_MIXINS, commonStyles } from '@/pages/style';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    keyboardAvoiding: {
        flex: 1,
    },
    scrollGrow: {
        flexGrow: 1,
    },
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
     * 内容主体容器
     */
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },

    /**
     * 表单卡片容器
     * 继承全局 mainCard 混合样式，确保全平台阴影一致性
     */
    formCard: {
        ...LAYOUT_MIXINS.mainCard,
    },
    /**
     * 输入项间距
     */
    inputSpacer: {
        height: SPACING.lg,
    },
    /**
     * 底部操作区域
     */
    footer: {
        marginTop: 'auto',
        paddingHorizontal: SPACING.lg,
        paddingBottom: 20,
    },
    /**
     * 主更新按钮样式
     */
    updateBtn: {
        ...commonStyles.primaryButton,
        ...LAYOUT_MIXINS.rowCenter,
    },
    btnText: {
        ...commonStyles.primaryButtonText,
    },
    btnIcon: {
        marginRight: SPACING.sm,
    },
    /**
     * 次要取消按钮
     */
    cancelBtn: {
        marginTop: 12,
        height: 50,
        ...LAYOUT_MIXINS.center,
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
});