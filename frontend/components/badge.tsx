/**
 * @file badge.tsx
 * @description 高性能徽章组件，支持多种语义化变体。
 * 采用原子化设计，剔除业务耦合日志，适配 NativeWind 样式系统。
 */

import * as React from "react";
import { View, Text, StyleSheet, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils";

/**
 * 徽章容器样式变体定义
 */
const badgeVariants = cva(
  "inline-flex flex-row items-center justify-center rounded-md px-2 py-0.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 shadow-sm active:opacity-80 dark:bg-slate-50",
        secondary: "border-transparent bg-slate-100 active:opacity-80 dark:bg-slate-800",
        destructive: "border-transparent bg-red-600 active:opacity-80 dark:bg-red-900",
        outline: "border-slate-200 bg-transparent dark:border-slate-800",
        success: "border-transparent bg-green-500 active:opacity-80",
        warning: "border-transparent bg-yellow-500 active:opacity-80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * 徽章文本样式变体定义
 */
const badgeTextVariants = cva(
  "text-xs font-medium",
  {
    variants: {
      variant: {
        default: "text-slate-50 dark:text-slate-900",
        secondary: "text-slate-900 dark:text-slate-50",
        destructive: "text-white",
        outline: "text-slate-950 dark:text-slate-50",
        success: "text-white",
        warning: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * @interface BadgeProps
 * @description 徽章组件属性定义
 */
export interface BadgeProps
  extends ViewProps,
  VariantProps<typeof badgeVariants> {
  /** 徽章显示的文本内容，优先于 children */
  label?: string;
  /** 可选：透传给内部 Text 组件的类名 */
  textClassName?: string;
}

/**
 * @component Badge
 * @description 纯净、高性能的通用徽章组件
 */
const Badge = React.forwardRef<View, BadgeProps>(({
  className,
  variant,
  label,
  children,
  textClassName: textClassNameProp,
  style,
  ...props
}, ref) => {

  // 1. 缓存容器类名计算结果，减少重绘开销
  const containerClassName = React.useMemo(() =>
    cn(badgeVariants({ variant }), className),
    [variant, className]);

  // 2. 缓存文本类名计算结果
  const textClassName = React.useMemo(() =>
    cn(badgeTextVariants({ variant }), textClassNameProp),
    [variant, textClassNameProp]);

  // 3. 渲染逻辑：优先使用 label，其次支持 string children 或自定义元素
  const renderContent = () => {
    if (label) {
      return <Text className={textClassName}>{label}</Text>;
    }

    if (typeof children === 'string') {
      return <Text className={textClassName}>{children}</Text>;
    }

    return children;
  };

  return (
    <View
      ref={ref}
      className={containerClassName}
      style={[styles.base, style]} // 合并基础样式与外部 style
      {...props}
    >
      {renderContent()}
    </View>
  );
});

/**
 * 基础兜底样式
 * 仅用于定义 NativeWind 无法覆盖的运行时关键尺寸约束
 */
const styles = StyleSheet.create({
  base: {
    minHeight: 20,
    minWidth: 40,
  }
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };