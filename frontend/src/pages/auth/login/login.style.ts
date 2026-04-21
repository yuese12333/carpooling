/**
 * @file login-page.style.ts
 * @description 登录页面专用样式表。
 * 核心职责：实现 UI 视觉表现与业务逻辑的解耦。
 * 遵循规范：
 * 1. 2.3 样式规范：禁止内联样式，强制抽离公共变量。
 * 2. 命名规范：文件名采用短横线分隔 (kebab-case)。
 */

import { StyleSheet, Platform } from 'react-native';

/**
 * 登录页面专有色彩主题常量
 * @description 抽离常用色彩，确保页面视觉一致性
 */
export const COLORS = {
    /** 主品牌色 - 翡翠绿 */
    primary: '#10B981',
    /** 主要文字颜色 - 深灰蓝 */
    textMain: '#1e293b',
    /** 次要文字颜色 - 灰蓝 */
    textSecondary: '#64748b',
    /** 禁用/提示文字颜色 */
    textMuted: '#94a3b8',
    /** 标准边框色 */
    border: '#e2e8f0',
    /** 错误/警告色 */
    error: '#ef4444',
    /** 纯白色 */
    white: '#ffffff',
    /** 输入框占位符颜色 */
    placeholder: '#cbd5e1',
};

/**
 * 导出 StyleSheet 样式实例
 */
export default StyleSheet.create({
    /** 基础根容器 */
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    /** 环境切换悬浮器 (仅用于 Mock/生产 环境切换调试) */
    envSwitcher: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 99,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    /** 环境切换文字标签 */
    envLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },

    /** 头部视觉装饰区块 */
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        position: 'relative',
        overflow: 'hidden',
    },

    /** 头部背景圆形修饰物 */
    headerCircleDecoration: {
        position: 'absolute',
        right: -20,
        top: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    /** Logo 容器：处理阴影与圆角 */
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        // 跨端阴影适配
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },

    /** Logo 符号文字 */
    logoEmoji: {
        fontSize: 30,
    },

    /** 主标题样式 */
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },

    /** 副标题样式 */
    subtitleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },

    /** 业务表单主容器 */
    formContainer: {
        padding: 24,
    },

    /** 表单输入项组合间隔 */
    inputFieldGroup: {
        marginBottom: 16,
    },

    /** 输入框控件包裹层 */
    inputControlWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.white,
    },

    /** 手机号前缀展示区 */
    phonePrefixContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        paddingRight: 8,
        marginRight: 4,
        height: 28,
    },

    /** 区号文字 */
    prefixLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginLeft: 8,
    },

    /** 弹性输入框主体 */
    flexInputField: {
        flex: 1,
        paddingHorizontal: 8,
        height: 48,
        color: COLORS.textMain,
    },

    /** 表单交互选项行 (记住我/忘记密码) */
    formOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },

    /** 复选框组合 */
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    /** 次要文字标签 */
    secondaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },

    /** 主链接样式 */
    primaryLinkText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },

    /** 主提交按钮 */
    mainSubmitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /** 按钮文本样式 */
    buttonLabelText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

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

    /** 表单校验失败提示 */
    validationErrorMessage: {
        fontSize: 12,
        color: COLORS.error,
        marginTop: 4,
        paddingLeft: 4,
    },

    /** 视觉分割线包裹层 */
    dividerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },

    /** 横向分割线 */
    horizontalLine: {
        flex: 1,
    },

    /** 分割线描述文字 */
    dividerLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginHorizontal: 12,
    },

    /** 社交登录区域容器 */
    socialActionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },

    /** 社交登录项包裹层 */
    socialItemWrapper: {
        alignItems: 'center',
        marginHorizontal: 16,
    },

    /** 社交登录图标按钮 */
    socialIconButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderColor: '#f1f5f9',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /** 社交 Emoji 文本样式 */
    socialEmojiText: {
        fontSize: 24,
    },

    /** 社交图标下方标签 */
    socialIconLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 8,
    },

    /** 页面底部跳转容器 */
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /** 底部高亮跳转文字 */
    primaryHighlightText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },

    /** 页脚内联按钮（去注册） */
    footerInlineBtn: {
        padding: 0,
        height: 'auto',
        marginLeft: 4,
    },

    /** 键盘避让容器 */
    keyboardView: {
        flex: 1,
    },

    /** 滚动内容撑起容器 */
    scrollContent: {
        flexGrow: 1,
    },
});