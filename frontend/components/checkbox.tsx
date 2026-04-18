/**
 * @file checkbox.tsx
 * @description 高性能复选框 UI 组件。
 * 支持受控模式，内置完善的交互日志记录与 Web/Mobile 语义化支持。
 * 遵循规范：1.1 具名导出、2.3 样式分离、3.1 结构化日志。
 */

import * as React from "react";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "../src/utils";
import logger from "../src/utils/logger";

/**
 * Checkbox 组件属性接口定义
 */
export interface CheckboxProps {
  /** 是否处于选中状态 */
  checked?: boolean;
  /** 状态变更回调函数 @param checked 变更后的状态 */
  onCheckedChange?: (checked: boolean) => void;
  /** 是否禁用交互 */
  disabled?: boolean;
  /** 额外的容器样式类名（支持 Tailwind） */
  className?: string;
  /** 审计日志模块标识，默认为 "Checkbox" */
  moduleName?: string;
}

/**
 * 高性能通用 Checkbox 组件
 * * @component
 * @example
 * <Checkbox checked={true} onCheckedChange={(val) => console.log(val)} />
 */
export const Checkbox = React.memo(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  moduleName = "Checkbox",
}: CheckboxProps) => {

  /**
   * 处理点击逻辑
   * 采用 useCallback 确保传递给 Pressable 的函数引用稳定
   */
  const handlePress = useCallback(() => {
    if (disabled) return;

    const nextState = !checked;

    // 1. 记录标准交互日志
    logger.info({
      module: moduleName,
      operate: 'onCheckedChange',
      params: { from: checked, to: nextState },
      result: 'triggered'
    });

    // 2. 执行回调并捕获外部副作用异常
    try {
      if (typeof onCheckedChange === 'function') {
        onCheckedChange(nextState);
      }
    } catch (error) {
      logger.error({
        module: moduleName,
        operate: 'handlePress_Callback',
        error: error instanceof Error ? error.message : String(error),
        errorType: 'CALLBACK_EXECUTION_ERROR'
      });
    }
  }, [checked, disabled, onCheckedChange, moduleName]);

  /**
   * 样式组合计算
   * 将样式对象缓存，避免 Render 阶段创建新数组导致子组件重绘
   */
  const combinedStyles = useMemo(() => [
    styles.base,
    checked ? styles.checked : styles.unchecked,
    disabled && styles.disabled
  ], [checked, disabled]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={combinedStyles}
      className={cn(className)}
    >
      {/* 渲染意图：仅在选中时渲染内部 Check 图标，减少视图层级 */}
      {checked && (
        <Check
          size={14}
          color={COLORS.white}
          strokeWidth={4}
        />
      )}
    </Pressable>
  );
});

Checkbox.displayName = "Checkbox";

/**
 * 内部私有常量与样式
 */
const COLORS = {
  primary: '#10B981',
  white: '#FFFFFF',
  border: '#E2E8F0',
  disabled: '#F1F5F9',
  disabledBorder: '#CBD5E1'
};

const styles = StyleSheet.create({
  base: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  checked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabledBorder,
    opacity: 0.6,
  },
});