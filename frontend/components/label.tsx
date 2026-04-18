/**
 * @file label.tsx
 * @description 核心文本标签组件。
 * 修复了 forwardRef 导出可能导致的 "Component is not a function" 错误。
 * 遵循规范：1.1 具名导出、2.3 样式解耦、3.1 UI 日志规范。
 */

import * as React from "react";
import { Text, StyleSheet, type TextProps } from "react-native";
import { cssInterop } from "nativewind";
import { cn } from "../src/utils";
import logger from "../src/utils/logger";

// 映射 NativeWind 属性
cssInterop(Text, { className: "style" });

/**
 * Label 组件属性接口
 */
export interface LabelProps extends TextProps {
  /** 额外的容器样式类名 */
  className?: string;
  /** 组件是否处于禁用状态 */
  disabled?: boolean;
}

/**
 * 核心文本标签组件
 * * 使用直接具名导出，确保 import { Label } 获取到的是正确的组件函数/对象
 */
export const Label = React.forwardRef<Text, LabelProps>(
  ({ className, disabled = false, style, ...props }, ref) => {

    // 1. 生命周期审计日志
    React.useEffect(() => {
      logger.info({
        module: "Label",
        operate: "mount",
        params: { disabled }
      });
    }, [disabled]);

    // 2. 性能感知：缓存样式计算
    const labelStyle = React.useMemo(() => {
      return [
        styles.base,
        disabled && styles.disabled,
        style, // 允许外部样式覆盖
      ];
    }, [disabled, style]);

    return (
      <Text
        ref={ref}
        accessible
        accessibilityRole="text"
        accessibilityState={{ disabled }}
        className={cn(
          "text-sm font-medium text-foreground",
          disabled && "opacity-50",
          className
        )}
        style={labelStyle}
        {...props}
      />
    );
  }
);

/** 显式定义显示名称 */
Label.displayName = "Label";

/**
 * 样式解耦定义
 */
const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
});