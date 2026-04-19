/**
 * @file avatar.tsx
 * @description 高性能头像组件，修复 ImageProps 属性透传冲突
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
} from "react-native";

// --- Types ---

interface AvatarContextState {
  hasError: boolean;
  setHasError: (val: boolean) => void;
  isLoaded: boolean;
  setIsLoaded: (val: boolean) => void;
}

export interface AvatarProps extends ViewProps {
  borderRadius?: number;
  backgroundColor?: ColorValue;
}

export interface AvatarImageProps extends Omit<ImageProps, "style"> {
  style?: StyleProp<ImageStyle>;
  /** 自定义状态回调，不应传递给原生 Image */
  onLoadingStatusChange?: (status: "loading" | "error" | "success") => void;
}

export interface AvatarFallbackProps extends ViewProps {
  textStyle?: StyleProp<TextStyle>;
  delayMs?: number;
}

// --- Context ---

const AvatarContext = React.createContext<AvatarContextState | null>(null);

// --- Component: Avatar ---

export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ style, borderRadius = 20, backgroundColor = "#F4F4F5", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);

    const contextValue = React.useMemo(
      () => ({ hasError, setHasError, isLoaded, setIsLoaded }),
      [hasError, isLoaded]
    );

    return (
      <AvatarContext.Provider value={contextValue}>
        <View
          ref={ref}
          style={[styles.avatarContainer, { borderRadius, backgroundColor }, style]}
          {...props}
        />
      </AvatarContext.Provider>
    );
  }
);

// --- Component: AvatarImage ---

export const AvatarImage = React.forwardRef<Image, AvatarImageProps>(
  (
    {
      style,
      source,
      onLoad,
      onError,
      onLoadingStatusChange, // 1. 提取自定义属性
      ...props               // 2. props 中现在只包含合法的 ImageProps
    },
    ref
  ) => {
    const context = React.useContext(AvatarContext);

    if (!context) {
      console.error("[UI_ERROR] [module:AvatarImage] [operate:Render] [error:Context missing]");
      return null;
    }

    const handleLoad = React.useCallback(
      (event: any) => {
        console.log(`[UI_LOG] [module:Avatar] [operate:LoadSuccess] [params:source=${JSON.stringify(source)}]`);
        context.setIsLoaded(true);
        onLoadingStatusChange?.("success");
        onLoad?.(event);
      },
      [context, source, onLoad, onLoadingStatusChange]
    );

    const handleError = React.useCallback(
      (event: any) => {
        console.error(`[UI_ERROR] [module:Avatar] [operate:LoadError] [error:Source=${JSON.stringify(source)}]`);
        context.setHasError(true);
        onLoadingStatusChange?.("error");
        onError?.(event);
      },
      [context, source, onError, onLoadingStatusChange]
    );

    return (
      <Image
        ref={ref}
        source={source}
        onLoad={handleLoad}
        onError={handleError}
        style={[styles.imageFull, style]}
        {...props} // 这里透传的 props 已不含 onLoadingStatusChange
      />
    );
  }
);

// --- Component: AvatarFallback ---

export const AvatarFallback = React.forwardRef<View, AvatarFallbackProps>(
  ({ style, children, textStyle, delayMs = 0, ...props }, ref) => {
    const context = React.useContext(AvatarContext);
    const [shouldRender, setShouldRender] = React.useState(delayMs === 0);

    React.useEffect(() => {
      if (delayMs > 0) {
        const timer = setTimeout(() => setShouldRender(true), delayMs);
        return () => clearTimeout(timer);
      }
    }, [delayMs]);

    if (!context) return null;
    if (context.isLoaded && !context.hasError) return null;
    if (!shouldRender) return null;

    return (
      <View
        ref={ref}
        style={[styles.fallbackContainer, style]}
        {...props}
      >
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