/**
 * @file tabs.tsx
 * @description 基于 React Native 的选项卡切换组件，支持受控与非受控模式，具备高性能重绘优化。
 */

import * as React from "react";
import {
  View,
  Pressable,
  Text,
  Platform,
  StyleSheet,
  type ViewProps,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type PressableStateCallbackType
} from "react-native";

// --- 类型定义 ---

interface TabsContextValue {
  /** 当前选中的选项卡值 */
  value: string;
  /** 切换选项卡的回调函数 */
  onValueChange: (val: string) => void;
}

/** Tabs 组件属性 */
export interface TabsProps extends ViewProps {
  /** 受控模式下的当前值 */
  value?: string;
  /** 非受控模式下的初始默认值 */
  defaultValue?: string;
  /** 值改变时的回调 */
  onValueChange?: (val: string) => void;
  children?: React.ReactNode;
}

/** TabsTrigger 组件属性 */
export interface TabsTriggerProps extends PressableProps {
  /** 触发器对应的唯一标识值 */
  value: string;
  /** 自定义文本样式 */
  textStyle?: StyleProp<TextStyle>;
  /** 自定义选中状态下的文本样式 */
  activeTextStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

/** TabsContent 组件属性 */
export interface TabsContentProps extends ViewProps {
  /** 触发器对应的唯一标识值，匹配时显示内容 */
  value: string;
  children?: React.ReactNode;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

/**
 * 内部 Hook：获取 Tabs 上下文，确保组件在 Provider 内部使用
 */
function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be rendered within the Tabs component");
  }
  return context;
}

// --- 组件实现 ---

/**
 * Tabs 根组件
 */
export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  style,
  ...props
}: TabsProps) {
  const [value, setValue] = React.useState(valueProp || defaultValue || "");

  // 确定当前的激活值（优先受控模式）
  const activeValue = valueProp !== undefined ? valueProp : value;

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (val !== activeValue) {
        setValue(val);
        onValueChange?.(val);
      }
    },
    [activeValue, onValueChange]
  );

  // 性能优化：缓存 Context Value，避免 Provider 重绘导致所有子组件无效渲染
  const contextValue = React.useMemo(
    () => ({
      value: activeValue,
      onValueChange: handleValueChange,
    }),
    [activeValue, handleValueChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <View style={[styles.tabsContainer, style]} {...props} />
    </TabsContext.Provider>
  );
}

/**
 * TabsList: 存放 TabsTrigger 的容器
 */
export function TabsList({ style, ...props }: ViewProps) {
  return <View style={[styles.tabsList, style]} {...props} />;
}

/**
 * TabsTrigger: 切换选项卡的触发按钮
 */
export function TabsTrigger({
  style,
  value,
  children,
  textStyle,
  activeTextStyle,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  // 处理 Pressable 的动态样式
  const getTriggerStyle = React.useCallback(
    (state: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.trigger,
      isActive && styles.triggerActive,
      state.pressed && styles.triggerPressed,
      // 3. 此时类型已经完全匹配，不再报错
      typeof style === "function" ? style(state) : style,
    ],
    [isActive, style]
  );
  return (
    <Pressable
      onPress={() => onValueChange(value)}
      android_ripple={styles.rippleConfig}
      style={getTriggerStyle}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.triggerText,
            textStyle,
            isActive && styles.triggerTextActive,
            isActive && activeTextStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/**
 * TabsContent: 对应选中的内容容器
 */
export function TabsContent({ value, style, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();

  // 若不匹配则不渲染，减少视图层级
  if (activeValue !== value) {
    return null;
  }

  return <View style={[styles.content, style]} {...props} />;
}

// --- 样式定义 ---

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "column",
    width: "100%",
  },
  tabsList: {
    flexDirection: "row",
    height: 64,
    width: "100%",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  trigger: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginHorizontal: 2,
    backgroundColor: "transparent",
  },
  triggerActive: {
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  triggerPressed: {
    opacity: 0.8,
  },
  triggerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  triggerTextActive: {
    fontWeight: "700",
    color: "#1e293b",
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  rippleConfig: {
    color: "rgba(0,0,0,0.05)",
  },
});