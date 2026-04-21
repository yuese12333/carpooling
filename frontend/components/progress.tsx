/**
 * @file progress.tsx
 * @description 高性能进度条组件。支持响应式动画、暗黑模式感知，并具备完善的 UI 生命周期日志记录。
 */

import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  type ViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from "react-native-reanimated";
import logger from "@/utils/logger";
import { useEnvStore } from '@/store/env-store';

/**
 * @interface ProgressProps
 * @description 进度条组件属性
 */
export interface ProgressProps extends ViewProps {
  /** 当前进度值，范围 0 - 100 */
  value?: number;
  /** 内部进度指示器的额外样式 */
  indicatorStyle?: StyleProp<ViewStyle>;
  /** 用于日志追踪的模块标识 */
  moduleName?: string;
}

/**
 * 动画物理参数常量，避免在渲染逻辑中重复声明
 */
const SPRING_CONFIG = {
  damping: 50,
  stiffness: 95,
};

/**
 * 颜色常量配置
 */
const COLORS = {
  trackLight: "#e2e8f0",
  trackDark: "#1e293b",
  indicatorLight: "#2563eb",
  indicatorDark: "#3b82f6",
};

/**
 * 进度条组件
 */
export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  indicatorStyle,
  style,
  moduleName = "ProgressUI",
  ...props
}) => {
  const isDark = useColorScheme() === "dark";

  /**
   * 异常值处理与日志记录
   */
  const safeValue = useMemo(() => {
    if (value < 0 || value > 100) {
      const requestId = useEnvStore.getState().currentRequestId;
      logger.error({
        module: moduleName,
        operate: "value_check",
        params: { value },
        result: undefined,
        error: `Value ${value} is out of range 0-100`,
        errorType: "VALIDATION_ERROR",
        requestId: requestId,
      });
    }
    return Math.min(Math.max(value, 0), 100);
  }, [value, moduleName]);

  // 1. 驱动动画：使用纯数值并引用静态配置
  const animatedWidth = useDerivedValue(() => {
    return withSpring(safeValue, SPRING_CONFIG);
  }, [safeValue]);

  // 2. 动画样式：映射为百分比，由原生动画引擎执行
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  /**
   * 样式组合优化：利用 useMemo 避免每次渲染产生新数组引用
   */
  const combinedTrackStyle = useMemo(() => [
    styles.track,
    isDark ? styles.trackDark : styles.trackLight,
    style,
  ], [isDark, style]);

  const combinedIndicatorStyle = useMemo(() => [
    styles.indicator,
    isDark ? styles.indicatorDark : styles.indicatorLight,
    indicatorStyle,
    animatedIndicatorStyle,
  ], [isDark, indicatorStyle, animatedIndicatorStyle]);

  return (
    <View
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      style={combinedTrackStyle}
      {...props}
    >
      <Animated.View style={combinedIndicatorStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 8,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 999,
  },
  trackLight: {
    backgroundColor: COLORS.trackLight,
  },
  trackDark: {
    backgroundColor: COLORS.trackDark,
  },
  indicator: {
    height: "100%",
    borderRadius: 999,
  },
  indicatorLight: {
    backgroundColor: COLORS.indicatorLight,
  },
  indicatorDark: {
    backgroundColor: COLORS.indicatorDark,
  },
});

Progress.displayName = "Progress";