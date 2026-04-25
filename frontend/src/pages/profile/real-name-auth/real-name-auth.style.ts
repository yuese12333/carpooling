/**
 * @file real-name-auth.style.ts
 * @description 实名认证页面的专有样式定义。
 * 遵循样式常量化原则，确保 UI 在不同设备上的一致性。
 */

import { StyleSheet, Platform } from 'react-native';
import {
    COLORS as GLOBAL_COLORS,
    SPACING,
    RADIUS,
    SHADOWS,
    LAYOUT_MIXINS,
} from '@/pages/style';

/**
 * 页面专用颜色常量
 * 严格执行常量化，防止色值碎片化
 */
export const COLORS = Object.freeze({
    primary: GLOBAL_COLORS.primary,
    primaryLight: GLOBAL_COLORS.primaryLight,
    primaryGhost: GLOBAL_COLORS.primaryGhost,
    white: GLOBAL_COLORS.white,
    textMain: GLOBAL_COLORS.textMain,
    textSecondary: GLOBAL_COLORS.textSecondary,
    textMuted: GLOBAL_COLORS.textMuted,
    textPlaceholder: GLOBAL_COLORS.textPlaceholder,
    bgLight: GLOBAL_COLORS.bgLight,
    borderLight: GLOBAL_COLORS.borderLight,
    borderDivider: GLOBAL_COLORS.borderDivider,
    // 状态特定颜色映射
    statusIconBg: GLOBAL_COLORS.primaryGhost,
    indicatorColor: GLOBAL_COLORS.primary,
});

export default StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
    },
    scrollContent: {
        flexGrow: 1, // 确保 ScrollView 内容不满屏时也能触发弹性效果
    },
    statusBanner: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: SPACING.xl,
    },
    bgUnverified: {
        backgroundColor: COLORS.white,
    },
    bgVerified: {
        backgroundColor: COLORS.primaryLight,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        ...LAYOUT_MIXINS.center,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: SPACING.xs,
    },
    statusDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: Platform.select({ ios: 20, android: 22 }), // 修复跨平台行高表现
    },
    formContainer: {
        padding: SPACING.lg,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    textInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 16,
        color: COLORS.textMain,
        paddingVertical: Platform.OS === 'ios' ? 10 : 6, // 适配 Android 默认内边距差
    },
    tipsBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgLight,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.lg,
    },
    tipsText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textMuted,
        marginLeft: 8,
        lineHeight: Platform.select({ ios: 18, android: 20 }), // 适配 Android 文本渲染
    },
    verifiedCard: {
        ...LAYOUT_MIXINS.mainCard,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryGhost,
        paddingVertical: 8,
        borderRadius: RADIUS.sm,
        marginTop: SPACING.sm,
    },
    verifiedTagText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '700',
        marginLeft: 4,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: StyleSheet.hairlineWidth, // 使用 hairlineWidth 优化边框精度
        borderTopColor: COLORS.borderLight,
    },
    // 动态/逻辑辅助样式
    loadingContainer: {
        flex: 1,
        ...LAYOUT_MIXINS.center,
        backgroundColor: COLORS.white,
    },
    disabledButton: {
        opacity: 0.5, // 统一禁用透明度规范
    }
});