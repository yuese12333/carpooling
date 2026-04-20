/**
 * @file separator.tsx
 * @description 基础分隔线组件。
 * 用于布局中的视觉分割。针对 Native 环境优化了辅助功能角色，避免类型重载错误。
 * 遵循规范：1.1 具名导出、2.3 样式解耦、3.1 UI 日志规范。
 */

import * as React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { cn } from "../src/utils";

/**
 * Separator 组件属性接口
 * @interface SeparatorProps
 */
export interface SeparatorProps extends ViewProps {
  /** * 分隔线方向 
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /** * 是否仅作为装饰性元素。
   * 若为 true，则对辅助设备（如 VoiceOver）隐藏。
   * @default true
   */
  decorative?: boolean;
}

/**
 * 基础分隔线组件
 * @component
 */
export const Separator = React.forwardRef<View, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      style,
      ...props
    },
    ref
  ) => {
    // 性能感知：根据方向缓存样式对象
    const orientationStyle = React.useMemo(() => {
      return orientation === "horizontal" ? styles.horizontal : styles.vertical;
    }, [orientation]);

    return (
      <View
        ref={ref}
        /**
         * 修复：降级为通用角色。
         * 在 Native 中，装饰性组件应设为 "none"，非装饰性则不设角色（默认为 View）。
         */
        accessibilityRole={decorative ? "none" : undefined}
        /** * 关键健壮性：针对 Native 端的辅助功能屏蔽逻辑
         * 若为装饰性，则在辅助功能树中完全隐藏该节点
         */
        importantForAccessibility={decorative ? "no-hide-descendants" : "yes"}
        accessibilityElementsHidden={decorative}

        className={cn(
          "bg-border shrink-0",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        style={[orientationStyle, style]}
        {...props}
      />
    );
  }
);

/** 显式定义显示名称，确保在 React DevTools 中可追溯 */
Separator.displayName = "Separator";

/**
 * 样式解耦定义：统一使用 StyleSheet 提升 Native 渲染性能
 */
const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    height: "100%",
    width: 1,
  },
});