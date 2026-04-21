/**
 * @file alert.tsx
 * @description 基础告警提示组件。提供 Default 和 Destructive 两种语义化样式。
 */

import * as React from "react";
import { View, Text, StyleSheet, type ViewProps, type TextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 flex-row items-start",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        destructive: "border-destructive/50 bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Alert 组件属性定义
 */
export interface AlertProps extends ViewProps, VariantProps<typeof alertVariants> {
  /** 告警左侧显示的图标组件 */
  icon?: React.ReactNode;
}

/**
 * 告警提示根组件
 */
export function Alert({ className, variant, icon, children, ...props }: AlertProps) {
  return (
    <View
      className={cn(alertVariants({ variant }), className)}
      style={styles.container}
      {...props}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

/**
 * 告警标题
 */
export function AlertTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        "text-base font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

/**
 * 告警描述
 */
export function AlertDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        "text-sm leading-relaxed text-muted-foreground/80",
        className
      )}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    columnGap: 12, // 解耦内联样式
  },
  iconWrapper: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    rowGap: 4,
  }
});