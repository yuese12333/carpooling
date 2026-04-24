/**
 * @file sheet.tsx
 * @description 基于 React Native Reanimated 的高性能侧边栏（抽屉）组件。
 * 支持四个方向弹出，集成了无障碍支持与动画重绘优化。
 */

import * as React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  ViewStyle,
  ColorValue,
  StyleProp,
  TextStyle,
  ViewProps,
  TextProps,
  Text,
} from "react-native";
import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import Animated, {
  SlideInRight,
  SlideOutRight,
  SlideInLeft,
  SlideOutLeft,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
  ComplexAnimationBuilder,
} from "react-native-reanimated";

// --- 常量定义 ---

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SIDEBAR_WIDTH = 320;
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.75, MAX_SIDEBAR_WIDTH);
const DEFAULT_SHEET_HEIGHT = 300;

const COLORS = {
  overlay: "rgba(0,0,0,0.5)" as ColorValue,
  bg: "#FFFFFF" as ColorValue,
  border: "#e2e8f0" as ColorValue,
  closeIcon: "#64748b" as ColorValue,
  title: "#0f172a" as ColorValue,
  footerBorder: "#f3f4f6" as ColorValue,
};

// --- 类型定义 ---

export type SheetSide = "top" | "right" | "bottom" | "left";

interface AnimationConfig {
  entering: ComplexAnimationBuilder;
  exiting: ComplexAnimationBuilder;
  baseStyle: ViewStyle;
}

/** SheetContent 组件属性 */
export interface SheetContentProps extends DialogPrimitive.ContentProps {
  /** 弹出方向，默认为 "right" */
  side?: SheetSide;
  /** 自定义样式类（兼容 Tailwind） */
  className?: string;
  /** 覆盖底层 View 的样式 */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/** Sheet 通用容器属性 */
export interface SheetElementProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
}

/** Sheet 标题属性 */
export interface SheetTitleProps extends TextProps {
  children?: React.ReactNode;
  className?: string;
}

// --- 动画与样式变体映射 ---

const getAnimationConfig = (side: SheetSide): AnimationConfig => {
  const configs: Record<SheetSide, AnimationConfig> = {
    right: {
      entering: SlideInRight.springify().damping(20).stiffness(90),
      exiting: SlideOutRight.duration(200),
      baseStyle: styles.sideRight,
    },
    left: {
      entering: SlideInLeft.springify().damping(20).stiffness(90),
      exiting: SlideOutLeft.duration(200),
      baseStyle: styles.sideLeft,
    },
    top: {
      entering: SlideInUp.springify().damping(20).stiffness(90),
      exiting: SlideOutUp.duration(200),
      baseStyle: styles.sideTop,
    },
    bottom: {
      entering: SlideInDown.springify().damping(20).stiffness(90),
      exiting: SlideOutDown.duration(200),
      baseStyle: styles.sideBottom,
    },
  };
  return configs[side];
};

// --- 子组件实现 ---

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

/**
 * Sheet 背景遮罩
 */
const SheetOverlay = React.memo(({ className, style, ...props }: DialogPrimitive.OverlayProps) => (
  <DialogPrimitive.Overlay asChild {...props}>
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.overlay, style as StyleProp<ViewStyle>]}
    />
  </DialogPrimitive.Overlay>
));

/**
 * Sheet 内容主体
 */
const SheetContent = React.forwardRef<View, SheetContentProps>(
  ({ className, children, side = "right", style, ...props }, ref) => {
    const config = React.useMemo(() => getAnimationConfig(side), [side]);

    return (
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content ref={ref} asChild {...props}>
          <Animated.View
            entering={config.entering}
            exiting={config.exiting}
            style={[styles.baseSide, config.baseStyle, style]}
          >
            <SheetClose asChild>
              <Pressable
                style={styles.closeButton}
                hitSlop={12}
                accessibilityLabel="Close sheet"
                accessibilityRole="button"
              >
                <X size={24} color={COLORS.closeIcon} />
              </Pressable>
            </SheetClose>

            <View style={styles.contentContainer}>
              {children}
            </View>
          </Animated.View>
        </DialogPrimitive.Content>
      </SheetPortal>
    );
  }
);

/**
 * Sheet 头部容器
 */
const SheetHeader = React.memo(({ children, style, ...props }: SheetElementProps) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
));

/**
 * Sheet 标题文本
 */
const SheetTitle = React.memo(({ children, style, numberOfLines = 2, ...props }: SheetTitleProps) => (
  <Text
    style={[styles.titleText, style]}
    numberOfLines={numberOfLines}
    {...props}
  >
    {children}
  </Text>
));

/**
 * Sheet 底部容器
 */
const SheetFooter = React.memo(({ children, style, ...props }: SheetElementProps) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
));

// --- 样式定义 ---

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    zIndex: 50,
  },
  baseSide: {
    position: "absolute",
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  // 侧向变体
  sideRight: {
    top: 0,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    borderLeftWidth: 1,
  },
  sideLeft: {
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
  },
  sideTop: {
    top: 0,
    left: 0,
    right: 0,
    height: DEFAULT_SHEET_HEIGHT,
    borderBottomWidth: 1,
  },
  sideBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: DEFAULT_SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    // 使用相对安全的偏移，建议外部配合 SafeAreaView
    top: Platform.OS === "ios" ? 70 : 50,
    padding: 8,
    zIndex: 110,
  },
  contentContainer: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 80 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    color: COLORS.title,
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.footerBorder,
  },
});

SheetContent.displayName = "SheetContent";
SheetHeader.displayName = "SheetHeader";
SheetTitle.displayName = "SheetTitle";
SheetFooter.displayName = "SheetFooter";

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
};