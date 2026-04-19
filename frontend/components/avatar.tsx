/**
 * @file avatar.tsx
 * @description 高性能头像组件，支持加载状态感知、占位回退机制及统一链路日志记录
 */

import * as React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  type ViewProps,
  type ImageProps,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  type NativeSyntheticEvent,
  type ImageLoadEventData,
  type ImageErrorEventData,
} from "react-native";
import logger from "@/utils/logger";
import { useEnvStore } from "@/store/env-store";

// --- Types ---

/**
 * Avatar 内部状态上下文
 */
interface AvatarContextState {
  hasError: boolean;
  setHasError: (val: boolean) => void;
  isLoaded: boolean;
  setIsLoaded: (val: boolean) => void;
}

/**
 * 容器组件属性
 */
export interface AvatarProps extends ViewProps {
  /** 头像圆角大小，默认为 20 */
  borderRadius?: number;
  /** 背景颜色，默认为 #F4F4F5 */
  backgroundColor?: ColorValue;
}

/**
 * 图片组件属性
 */
export interface AvatarImageProps extends Omit<ImageProps, "style"> {
  /** 显式声明样式支持 */
  style?: StyleProp<ImageStyle>;
  /** 状态变更回调：loading (初始) | error (失败) | success (成功) */
  onLoadingStatusChange?: (status: "loading" | "error" | "success") => void;
}

/**
 * 后备显示组件属性
 */
export interface AvatarFallbackProps extends ViewProps {
  /** 文本样式 */
  textStyle?: StyleProp<TextStyle>;
  /** 延迟显示时间（毫秒），用于防止网络极快时的闪烁 */
  delayMs?: number;
}

// --- Context ---

const AvatarContext = React.createContext<AvatarContextState | undefined>(undefined);

// --- Component: Avatar ---

/**
 * Avatar 根组件，提供状态管理上下文
 */
export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ style, borderRadius = 20, backgroundColor = "#F4F4F5", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);

    // 缓存上下文对象，避免 Context 消费者非必要重绘
    const contextValue = React.useMemo(
      () => ({ hasError, setHasError, isLoaded, setIsLoaded }),
      [hasError, isLoaded]
    );

    // 动态容器样式缓存
    const containerStyle = React.useMemo(
      () => [styles.avatarContainer, { borderRadius, backgroundColor }, style],
      [borderRadius, backgroundColor, style]
    );

    return (
      <AvatarContext.Provider value={contextValue}>
        <View ref={ref} style={containerStyle} {...props} />
      </AvatarContext.Provider>
    );
  }
);

// --- Component: AvatarImage ---

/**
 * Avatar 核心图片组件，处理加载逻辑
 */
export const AvatarImage = React.forwardRef<Image, AvatarImageProps>(
  (
    {
      style,
      source,
      onLoad,
      onError,
      onLoadingStatusChange,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(AvatarContext);
    const requestId = useEnvStore.getState().currentRequestId;

    if (!context) {
      logger.error({
        module: "AvatarImage",
        operate: "Render",
        error: "AvatarContext missing, Image must be wrapped in <Avatar />",
        requestId,
      });
      return null;
    }

    const { setIsLoaded, setHasError } = context;

    const handleLoad = React.useCallback(
      (event: NativeSyntheticEvent<ImageLoadEventData>) => {
        logger.info({
          module: "Avatar",
          operate: "LoadSuccess",
          params: { source: typeof source === "object" ? source : "require_resource" },
          requestId,
        });
        setIsLoaded(true);
        onLoadingStatusChange?.("success");
        onLoad?.(event);
      },
      [setIsLoaded, onLoadingStatusChange, onLoad, source, requestId]
    );

    const handleError = React.useCallback(
      (event: NativeSyntheticEvent<ImageErrorEventData>) => {
        logger.error({
          module: "Avatar",
          operate: "LoadError",
          error: "Image resource failed to load",
          params: { source: typeof source === "object" ? source : "require_resource" },
          requestId,
        });
        setHasError(true);
        onLoadingStatusChange?.("error");
        onError?.(event);
      },
      [setHasError, onLoadingStatusChange, onError, source, requestId]
    );

    return (
      <Image
        ref={ref}
        source={source}
        onLoad={handleLoad}
        onError={handleError}
        style={[styles.imageFull, style]}
        {...props}
      />
    );
  }
);

// --- Component: AvatarFallback ---

/**
 * 兜底组件，在加载中或加载失败时显示
 */
export const AvatarFallback = React.forwardRef<View, AvatarFallbackProps>(
  ({ style, children, textStyle, delayMs = 0, ...props }, ref) => {
    const context = React.useContext(AvatarContext);
    const [shouldRender, setShouldRender] = React.useState(delayMs === 0);

    React.useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      if (delayMs > 0) {
        timer = setTimeout(() => setShouldRender(true), delayMs);
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [delayMs]);

    if (!context) return null;

    // 渲染逻辑：仅在图片未加载成功或发生错误，且满足延迟策略时展示
    const canRender = (context.hasError || !context.isLoaded) && shouldRender;
    if (!canRender) return null;

    return (
      <View ref={ref} style={[styles.fallbackContainer, style]} {...props}>
        {typeof children === "string" ? (
          <Text style={[styles.fallbackText, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    );
  }
);

// --- Styles ---

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    height: 40,
    width: 40,
    flexShrink: 0,
    overflow: "hidden",
  },
  imageFull: {
    aspectRatio: 1,
    height: "100%",
    width: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  } as ImageStyle,
  fallbackContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
  },
  fallbackText: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});

Avatar.displayName = "Avatar";
AvatarImage.displayName = "AvatarImage";
AvatarFallback.displayName = "AvatarFallback";