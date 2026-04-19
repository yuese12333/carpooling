/**
 * @file badge.tsx
 * @description 高性能徽章组件，支持多种语义化变体。
 * 适配 NativeWind 样式系统，并集成标准化 UI 生命周期监控。
 */

import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils";
import logger from '@/utils/logger';

/**
 * 徽章容器样式变体定义
 */
const badgeVariants = cva(
  "inline-flex flex-row items-center justify-center rounded-md border px-2 py-0.5",
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
 * @description 徽章组件属性
 */
export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>,
  VariantProps<typeof badgeVariants> {
  /** 徽章显示的文本内容，优先于 children */
  label?: string;
}

const MODULE_NAME = 'Badge';

/**
 * @component Badge
 * @description 基于 NativeWind 的通用徽章组件
 */
const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  label,
  children,
  ...props
}) => {

  // 1. 记录组件挂载/渲染日志
  React.useEffect(() => {
    logger.info({
      module: MODULE_NAME,
      operate: 'COMPONENT_MOUNT',
      params: { variant: variant || 'default', hasLabel: !!label }
    });
  }, []);

  // 2. 性能优化：缓存类名计算结果
  const containerClassName = React.useMemo(() =>
    cn(badgeVariants({ variant }), className),
    [variant, className]);

  const textClassName = React.useMemo(() =>
    badgeTextVariants({ variant }),
    [variant]);

  // 3. 异常边界：捕获非法 children 渲染
  const renderContent = () => {
    try {
      if (label) {
        return <Text className={textClassName}>{label}</Text>;
      }
      if (typeof children === 'string') {
        return <Text className={textClassName}>{children}</Text>;
      }
      return children;
    } catch (error) {
      logger.error({
        module: MODULE_NAME,
        operate: 'RENDER_CONTENT_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  };

  return (
    <View
      className={containerClassName}
      style={baseStyles.container} // 注入基础兜底样式
      {...props}
    >
      {renderContent()}
    </View>
  );
};

/**
 * 基础样式定义 - 确保在没有 Tailwind 环境下组件不坍塌
 */
const baseStyles = StyleSheet.create({
  container: {
    minHeight: 20,
    minWidth: 40,
  }
});

// 导出组件及变体定义
export { Badge, badgeVariants };