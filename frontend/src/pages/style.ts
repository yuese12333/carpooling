/**
 * @file style.ts
 * @description 全局设计令牌 (Design Tokens) 与跨平台样式体系，包含颜色、间距、圆角及通用布局
 */

import { StyleSheet, ViewStyle, TextStyle, Platform, StatusBar, ColorValue } from 'react-native';

/**
 * 基础调色板 - 原子颜色定义
 */
interface Palette {
    red: string;
    redLight: string;
    redBorder: string;
    redDark: string;
    amber: string;
    blue: string;
    emerald: string;
    emeraldDark: string;
    emeraldLight: string;
    emeraldGhost: string;
    blueDark: string;
    blueLight: string;
    orange: string;
    purple: string;
    purpleLight: string;
    slate: Record<number, string>;
}

const PALETTE: Palette = {
    red: '#EF4444',
    redLight: '#FEF2F2',
    redBorder: '#fecaca',
    redDark: '#b91c1c',
    amber: '#FBBF24',
    blue: '#60A5FA',
    emerald: '#10B981',
    emeraldDark: '#16a34a',
    emeraldLight: '#f0fdf4',
    emeraldGhost: 'rgba(16, 185, 129, 0.1)',
    blueDark: '#3B82F6',
    blueLight: '#EFF6FF',
    orange: '#FB923C',
    purple: '#A855F7',
    purpleLight: '#FAF5FF',
    slate: {
        100: '#F3F4F6',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        800: '#1e293b',
        900: '#111827',
    }
};

/**
 * 业务颜色令牌 - 语义化映射
 */
export const COLORS = {
    primary: PALETTE.emerald,
    primaryLight: PALETTE.emeraldLight,
    primaryDark: PALETTE.emeraldDark,
    primaryGhost: PALETTE.emeraldGhost,

    white: '#FFFFFF',
    bgLight: '#F9FAFB',
    borderLight: PALETTE.slate[100],
    borderDivider: PALETTE.slate[200],
    successBg: PALETTE.emeraldLight,

    bgGreenLight: PALETTE.emeraldLight,
    bgOrangeLight: "#fff7ed",
    bgBlueLight: "#eff6ff",
    bgPurpleLight: PALETTE.purpleLight,
    overlayLight: 'rgba(249, 250, 251, 0.8)',
    transparent: 'transparent' as ColorValue,

    secondary: PALETTE.orange,
    info: PALETTE.blueDark,
    infoLight: PALETTE.blueLight,
    accent: PALETTE.purple,
    accentLight: PALETTE.purpleLight,

    textMain: PALETTE.slate[900],
    textSub: PALETTE.slate[800],
    textSecondary: PALETTE.slate[500],
    textMuted: PALETTE.slate[400],
    textPlaceholder: PALETTE.slate[300],
    textLight: 'rgba(255, 255, 255, 0.8)',
    textLighter: 'rgba(255, 255, 255, 0.6)',
    dividerLight: '#d1d5db',

    yellowBadge: "#fefce8",
    yellowIcon: "#eab308",

    whiteOverlay: "rgba(255, 255, 255, 0.15)",
    whiteBorder: "rgba(255, 255, 255, 0.2)",

    disabled: PALETTE.slate[300],
    warningBg: '#fffbeb',
    warningText: '#92400e',
    warningIcon: '#f59e0b',

    textLink: PALETTE.emerald,
    textTip: '#166534',
    bgTip: PALETTE.emeraldLight,
    borderTip: '#dcfce7',
    borderCalendar: '#f0f0f0',

    error: PALETTE.red,
    errorLight: PALETTE.redLight,
    errorBorder: PALETTE.redBorder,
    errorDark: PALETTE.redDark,

    imagePlaceholder: PALETTE.slate[100],
    tagBg: PALETTE.slate[100],

    rating: PALETTE.amber,
    overlay: 'rgba(0,0,0,0.3)',
    warning: PALETTE.amber,
    danger: PALETTE.red,
    iconDefault: PALETTE.slate[400],

    status: {
        weak: '#F87171',
        medium: PALETTE.amber,
        strong: PALETTE.blue,
        veryStrong: PALETTE.emerald,
        success: PALETTE.emerald,
        inactive: 'rgba(255, 255, 255, 0.3)',
        info: '#2563EB',
        warning: '#EA580C',
        error: '#F87171',
    },

    whiteTrans: {
        10: 'rgba(255, 255, 255, 0.1)',
        20: 'rgba(255, 255, 255, 0.2)',
        30: 'rgba(255, 255, 255, 0.3)',
        40: 'rgba(255, 255, 255, 0.4)',
        50: 'rgba(255, 255, 255, 0.5)',
        60: 'rgba(255, 255, 255, 0.6)',
        70: 'rgba(255, 255, 255, 0.7)',
        80: 'rgba(255, 255, 255, 0.8)',
    }
};

/**
 * 间距系统 - 基于 4 像素网格
 */
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

/**
 * 圆角系统
 */
export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 32,
    xxl: 48, // 修复逻辑：应大于 xl
    full: 999,
    card: 24,
};

/**
 * 尺寸常量
 */
export const SIZES = {
    navbarHeight: Platform.OS === 'ios' ? 44 : 56,
    touchTarget: 44,
    statusBarHeight: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
    buttonHeight: 56,
    inputHeight: 48,
};

/**
 * 阴影系统
 */
export const SHADOWS = {
    sm: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
        android: { elevation: 5 },
    }),
    lg: Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
        android: { elevation: 10 },
    }),
    xs: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
        android: { elevation: 2 },
    }),
    primary: Platform.select({
        ios: {
            shadowColor: PALETTE.emerald,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        android: {
            elevation: 5,
        },
    }),
};

/**
 * 通用布局混入 (Mixins)
 */
export const LAYOUT_MIXINS = {
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    inputHeight: {
        height: SIZES.inputHeight,
    } as ViewStyle,
    buttonHeight: {
        height: SIZES.buttonHeight,
    } as ViewStyle,
    cardBase: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    } as ViewStyle,
    mainCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: RADIUS.card,
        ...SHADOWS.xs,
    } as ViewStyle,
    navbar: {
        height: SIZES.navbarHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.borderDivider,
    } as ViewStyle,
    navBarBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white,
    } as ViewStyle,
    hitSlop: {
        minWidth: SIZES.touchTarget,
        minHeight: SIZES.touchTarget,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    dashedUpload: {
        width: '100%',
        height: 140,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.borderDivider,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    badgeBase: {
        paddingHorizontal: SPACING.sm + 2, // 10
        paddingVertical: SPACING.xs, // 4
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    cardShadow: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        ...SHADOWS.xs,
    } as ViewStyle,
    statsContainer: {
        flexDirection: "row",
        backgroundColor: COLORS.whiteOverlay,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
    } as ViewStyle,
    headerCard: {
        backgroundColor: COLORS.white,
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
        ...SHADOWS.sm,
    } as ViewStyle,
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.borderDivider,
    } as ViewStyle,
};

/**
 * 共享样式 StyleSheet
 */
export const commonStyles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    } as ViewStyle,

    flexOne: {
        flex: 1,
    } as ViewStyle,

    scrollContent: {
        flexGrow: 1,
    } as ViewStyle,

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.borderDivider,
        paddingHorizontal: SPACING.md,
        height: 52,
    } as ViewStyle,

    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.card + 3, // 映射到 27
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        ...SHADOWS.primary,
    } as ViewStyle,

    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        includeFontPadding: false,
        textAlignVertical: "center",
    } as TextStyle,
});