/**
 * @file switch.tsx
 * @description 高性能受控开关组件。
 */

import * as React from "react";
import {
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  StyleProp,
} from "react-native";

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

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const ANIM_DURATION = 250;

/**
 * @component Switch
 * @description 标准化受控开关，支持颜色与位移同步插值动画。
 */
export const Switch = React.memo<SwitchProps>(({
  checked = false,
  onCheckedChange,
  disabled = false,
  style,
  testID
}) => {
  // 1. 动画值初始化
  const thumbAnim = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  // 2. 监听外部状态变更并驱动动画
  React.useEffect(() => {
    Animated.timing(thumbAnim, {
      toValue: checked ? 1 : 0,
      duration: ANIM_DURATION,
      useNativeDriver: false, // 颜色插值在 RN 中不支持 Native Driver
    }).start();
  }, [checked, thumbAnim]);

  // 3. 性能优化：缓存交互回调，移除交互日志
  const handlePress = React.useCallback(() => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
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

  // 5. 样式合并
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
});

/**
 * 样式定义
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

Switch.displayName = "Switch";