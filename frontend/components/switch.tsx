/**
 * @file switch.tsx
 * @description 高性能受控开关组件。
 * 包含平滑的颜色插值动画、触感反馈优化及标准化 UI 日志监控。
 */

import * as React from "react";
import {
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  StyleProp
} from "react-native";
import logger from '@/utils/logger';

/**
 * @interface SwitchProps
 * @description 开关组件属性定义
 */
export interface SwitchProps {
  /** 是否选中 */
  checked?: boolean;
  /** 状态改变回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 是否禁用交互 */
  disabled?: boolean;
  /** 容器自定义样式 */
  style?: StyleProp<ViewStyle>;
  /** 测试标识符 */
  testID?: string;
}

const MODULE_NAME = 'Switch';
const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const ANIM_DURATION = 250;

/**
 * @component Switch
 * @description 标准化受控开关，支持颜色与位移同步插值动画。
 */
export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  style,
  testID
}) => {
  // 1. 动画值初始化 (0: 未选中, 1: 选中)
  const thumbAnim = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  // 2. 监听外部状态变更并驱动动画
  React.useEffect(() => {
    logger.info({
      module: MODULE_NAME,
      operate: 'ANIMATION_TRIGGER',
      params: { toValue: checked, duration: ANIM_DURATION }
    });

    Animated.timing(thumbAnim, {
      toValue: checked ? 1 : 0,
      duration: ANIM_DURATION,
      useNativeDriver: false, // 颜色插值与位移在部分 RN 版本不支持原生驱动组合
    }).start((result) => {
      if (!result.finished) {
        logger.warn({
          module: MODULE_NAME,
          operate: 'ANIMATION_INTERRUPTED',
          params: { checked }
        });
      }
    });
  }, [checked, thumbAnim]);

  // 3. 性能优化：缓存交互回调
  const handlePress = React.useCallback(() => {
    if (disabled) return;

    const nextValue = !checked;

    // UI 日志记录
    logger.info({
      module: MODULE_NAME,
      operate: 'USER_INTERACTION_PRESS',
      params: {
        currentStatus: checked,
        nextStatus: nextValue,
        disabled
      }
    });

    onCheckedChange?.(nextValue);
  }, [checked, disabled, onCheckedChange]);

  // 4. 插值逻辑计算
  const translateX = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, TRACK_WIDTH - THUMB_SIZE - 2],
  });

  const backgroundColor = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#10B981"],
  });

  // 5. 样式合并优化
  const containerStyle = React.useMemo(() => [
    styles.track,
    style,
    disabled && styles.disabledOpacity
  ], [style, disabled]);

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={handlePress}
      style={containerStyle}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
    >
      <Animated.View style={[styles.trackBg, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }] }
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

/**
 * 样式定义 - 与逻辑解耦
 */
const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  trackBg: {
    flex: 1,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    // 阴影适配
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabledOpacity: {
    opacity: 0.5,
  },
});