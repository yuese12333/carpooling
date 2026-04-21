/**
 * @file textarea.tsx
 * @description 高性能多行文本输入组件。
 * 针对 Android 置顶对齐进行优化，集成标准化 UI 日志监控及 NativeWind 样式缓存。
 */

import * as React from "react";
import {
  TextInput,
  Platform,
  StyleSheet,
  type TextInputProps
} from "react-native";
import { cn } from "../src/utils";

/**
 * @interface TextareaProps
 * @description 文本域组件属性定义，继承标准 TextInputProps
 */
export interface TextareaProps extends TextInputProps {
  /** 自定义容器类名 (NativeWind) */
  className?: string;
}

const MODULE_NAME = 'Textarea';

/**
 * @component Textarea
 * @description 封装后的多行输入组件，确保多端表现一致性。
 */
export const Textarea: React.FC<TextareaProps> = ({
  className,
  onFocus,
  onBlur,
  ...props
}) => {

  // 2. 性能优化：缓存复杂类名计算
  const memoizedClassName = React.useMemo(() => {
    return cn(
      "border-input flex min-h-[80px] w-full rounded-md border bg-input-background px-3 py-2 text-base text-foreground",
      "dark:bg-input/30",
      "focus:border-ring",
      "disabled:opacity-50",
      Platform.OS === 'web' ? "md:text-sm" : "text-sm",
      className
    );
  }, [className]);

  // 3. 交互日志处理器：获取焦点
  const handleFocus = React.useCallback((e: any) => {
    onFocus?.(e);
  }, [onFocus, props.placeholder]);

  // 4. 交互日志处理器：失去焦点
  const handleBlur = React.useCallback((e: any) => {
    onBlur?.(e);
  }, [onBlur]);

  return (
    <TextInput
      // 强制多行模式
      multiline
      // 默认展示行数
      numberOfLines={4}
      // 修复 Android 文字不置顶问题
      textAlignVertical="top"
      // 占位符颜色统一管理
      placeholderTextColor="#a1a1aa"
      // 样式组合
      className={memoizedClassName}
      style={baseStyles.textarea}
      // 交互绑定
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
};

/**
 * 基础结构样式 - 确保渲染性能与多端布局一致性
 */
const baseStyles = StyleSheet.create({
  textarea: {
    // 确保在 Native 端即使类名注入延迟也能维持基本对齐逻辑
    ...Platform.select({
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
});