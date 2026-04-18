/**
 * @file button.tsx
 * @description 严谨的通用点击组件，支持多种样式变体与加载状态。
 */

import * as React from "react";
import { Pressable, Text, ActivityIndicator, type GestureResponderEvent } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../src/utils";
import logger from "../src/utils/logger";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-md active:opacity-70 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand",
        destructive: "bg-red-600",
        outline: "border border-slate-200 bg-white",
        secondary: "bg-slate-100",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-slate-900",
      secondary: "text-slate-900",
      ghost: "text-slate-900",
      link: "text-blue-600 underline",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable>,
  VariantProps<typeof buttonVariants> {
  /** 兼容 Web 端的点击回调 */
  onClick?: () => void;
  /** 是否处于加载中状态 */
  loading?: boolean;
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, onClick, onPress, loading, disabled, ...props }, ref) => {

    /**
     * 统一点击处理逻辑，注入日志追踪
     */
    const handlePress = React.useCallback((event: GestureResponderEvent) => {
      if (loading || disabled) return;

      logger.info({
        module: 'Button',
        operate: 'press',
        params: { variant: variant || 'default', size: size || 'default' }
      });

      if (onPress) {
        onPress(event);
      } else if (onClick) {
        onClick();
      }
    }, [onPress, onClick, loading, disabled, variant, size]);

    // 缓存样式计算结果
    const containerStyle = React.useMemo(() =>
      cn(buttonVariants({ variant, size, className })),
      [variant, size, className]
    );

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={loading || disabled}
        className={containerStyle}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'default' ? '#FFFFFF' : '#999999'} />
        ) : typeof children === "string" ? (
          <Text className={cn(buttonTextVariants({ variant }))}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";