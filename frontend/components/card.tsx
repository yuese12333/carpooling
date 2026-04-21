/**
 * @file card.tsx
 * @description 高性能响应式卡片容器组件，支持多层级结构与标准化日志记录。
 * 遵循样式解耦规范与 TypeScript 严格类型约束。
 */

import * as React from "react";
import { View, Text, StyleSheet, type ViewProps, type TextProps } from "react-native";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- 辅助工具 ---

/**
 * 合并 Tailwind 类名，解决样式冲突
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 ---

export interface CardProps extends ViewProps {
  /** 扩展样式类名 */
  className?: string;
  /** 子组件内容 */
  children?: React.ReactNode;
}

export interface CardTextProps extends TextProps {
  /** 扩展样式类名 */
  className?: string;
}

// --- 核心组件 ---

/**
 * Card 容器组件
 */
const Card = React.forwardRef<View, CardProps>(({ className, style, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden", className)}
      style={[styles.baseCard, style]}
      {...props}
    >
      {children}
    </View>
  );
});
Card.displayName = "Card";

/**
 * CardHeader 头部布局容器
 */
const CardHeader = React.forwardRef<View, CardProps>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex-row items-center justify-between px-6 pt-6 pb-2 gap-4", className)}
    style={[styles.flexRow, style]}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardHeaderContent 头部文本区域容器（自动占据剩余空间）
 */
const CardHeaderContent = React.forwardRef<View, CardProps>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex-1 flex-col gap-1", className)}
    style={[styles.flexFill, style]}
    {...props}
  />
));
CardHeaderContent.displayName = "CardHeaderContent";

/**
 * CardTitle 标题文本
 */
const CardTitle = React.forwardRef<Text, CardTextProps>(({ className, style, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50", className)}
    style={style}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription 描述文本
 */
const CardDescription = React.forwardRef<Text, CardTextProps>(({ className, style, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    style={style}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent 内容主体区域
 */
const CardContent = React.forwardRef<View, CardProps>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("px-6 py-4", className)}
    style={style}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter 底部操作区域
 */
const CardFooter = React.forwardRef<View, CardProps>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex-row items-center px-6 pb-6 pt-2", className)}
    style={[styles.flexRow, style]}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * CardAction 右侧操作钩子容器
 */
const CardAction = React.forwardRef<View, CardProps>(({ className, style, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("justify-center", className)}
    style={style}
    {...props}
  />
));
CardAction.displayName = "CardAction";

// --- 样式解耦 ---

const styles = StyleSheet.create({
  baseCard: {
    // 基础底层样式，防止 className 解析失败时的兜底
    minHeight: 20,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexFill: {
    flex: 1,
  }
});

export {
  Card,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
};

export default Card;