/**
 * @file avatar.tsx
 * @description 高性能头像组件，支持加载状态感知、占位回退机制。
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

// --- Types ---

interface AvatarContextState {
  hasError: boolean;
  setHasError: (val: boolean) => void;
  isLoaded: boolean;
  setIsLoaded: (val: boolean) => void;
}

export interface AvatarProps extends ViewProps {
  /** 头像圆角大小，默认为 20 */
  borderRadius?: number;
  /** 背景颜色，默认为 #F4F4F5 */
  backgroundColor?: ColorValue;
}

export interface AvatarImageProps extends Omit<ImageProps, "style"> {
  style?: StyleProp<ImageStyle>;
  /** 状态变更回调，供外部链路埋点或逻辑感知使用 */
  onLoadingStatusChange?: (status: "loading" | "error" | "success") => void;
}

export interface AvatarFallbackProps extends ViewProps {
  textStyle?: StyleProp<TextStyle>;
  /** 延迟显示时间（毫秒），用于平滑网络加载瞬间的视觉闪烁 */
  delayMs?: number;
}

// --- Context ---

const AvatarContext = React.createContext<AvatarContextState | undefined>(undefined);

// --- Component: Avatar ---

/**
 * Avatar 根组件：维护内部加载状态上下文
 */
export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ style, borderRadius = 20, backgroundColor = "#F4F4F5", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);

    const contextValue = React.useMemo(
      () => ({ hasError, setHasError, isLoaded, setIsLoaded }),
      [hasError, isLoaded]
    );

    const containerStyle = React.useMemo(
      () => [
        styles.avatarContainer,
        { borderRadius, backgroundColor },
        style
      ],
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
 * AvatarImage：处理核心图片加载，移除硬编码日志逻辑
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

    if (!context) {
      return null;
    }

    const { setIsLoaded, setHasError } = context;

    const handleLoad = React.useCallback(
      (event: NativeSyntheticEvent<ImageLoadEventData>) => {
        setIsLoaded(true);
        setHasError(false);
        onLoadingStatusChange?.("success");
        onLoad?.(event);
      },
      [setIsLoaded, setHasError, onLoadingStatusChange, onLoad]
    );

    const handleError = React.useCallback(
      (event: NativeSyntheticEvent<ImageErrorEventData>) => {
        setHasError(true);
        setIsLoaded(false);
        onLoadingStatusChange?.("error");
        onError?.(event);
      },
      [setHasError, setIsLoaded, onLoadingStatusChange, onError]
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
 * AvatarFallback：加载失败或占位状态展示
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

    if (!context) {
      if (__DEV__) {
        console.warn("AvatarFallback must be used within an Avatar component.");
      }
      return null;
    }

    const { hasError, isLoaded } = context;

    // 逻辑：发生错误 OR (尚未加载成功 AND 满足延迟展示条件)
    const canRender = (hasError || !isLoaded) && shouldRender;

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
    flex: 1,
    aspectRatio: 1,
    height: "100%",
    width: "100%",
    // 使用绝对定位确保图片遮盖 Fallback
    position: "absolute",
    left: 0,
    top: 0,
  } as ImageStyle,
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
  },
  fallbackText: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

Avatar.displayName = "Avatar";
AvatarImage.displayName = "AvatarImage";
AvatarFallback.displayName = "AvatarFallback";