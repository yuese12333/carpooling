/**
 * @file input.tsx
 * @description 高性能通用文本输入框组件。
 */

import React, { useCallback, useMemo, forwardRef } from "react";
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    Platform,
    type TextInputProps,
    type StyleProp,
    type ViewStyle,
    type TextStyle
} from "react-native";

/**
 * @interface InputProps
 * @description 增强型输入框组件属性定义
 */
export interface InputProps extends TextInputProps {
    /** 左侧装饰组件或图标 */
    leftIcon?: React.ReactNode;
    /** 右侧装饰组件或图标 */
    rightIcon?: React.ReactNode;
    /** 整个输入框容器的自定义样式 */
    containerStyle?: StyleProp<ViewStyle>;
    /** 底部显示的错误文本内容 */
    errorText?: string;
    /** 用于日志埋点的模块名称 */
    moduleName?: string;
}

/**
 * UI 样式常量
 */
const UI_THEME = {
    BORDER: "#E2E8F0",
    BG: "#FFFFFF",
    ERROR: "#EF4444",
    TEXT: "#0F172A",
    PLACEHOLDER: "#94A3B8"
};

/**
 * 内部实现组件
 */
const InputComponent = forwardRef<TextInput, InputProps>((props, ref) => {
    const {
        style,
        leftIcon,
        rightIcon,
        containerStyle,
        errorText,
        multiline,
        onFocus,
        onBlur,
        moduleName: _moduleName,
        ...restProps
    } = props;

    const handleFocus = useCallback((e: any) => {
        onFocus?.(e);
    }, [onFocus]);

    const handleBlur = useCallback((e: any) => {
        onBlur?.(e);
    }, [onBlur]);

    /**
     * 容器样式缓存
     */
    const containerMergedStyle = useMemo(() => [
        styles.container,
        multiline ? styles.containerMultiline : styles.containerSingle,
        !!errorText && styles.containerError,
        containerStyle
    ] as StyleProp<ViewStyle>, [multiline, errorText, containerStyle]);

    /**
     * 样式数组类型断言
     */
    const inputMergedStyle = useMemo(() => [
        styles.inputBase,
        !multiline && styles.inputSingle,
        style
    ] as StyleProp<TextStyle>, [multiline, style]);

    return (
        <View style={styles.wrapper}>
            <View style={containerMergedStyle}>
                {leftIcon && (
                    <View style={[styles.iconContainer, multiline && styles.iconTopOffset]}>
                        {leftIcon}
                    </View>
                )}

                <TextInput
                    ref={ref}
                    style={inputMergedStyle}
                    multiline={multiline}
                    textAlignVertical={multiline ? "top" : "center"}
                    placeholderTextColor={UI_THEME.PLACEHOLDER}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...restProps}
                />

                {rightIcon && (
                    <View style={[styles.iconContainerLeft, multiline && styles.iconTopOffset]}>
                        {rightIcon}
                    </View>
                )}
            </View>

            {!!errorText && (
                <Text style={styles.errorLabel}>{errorText}</Text>
            )}
        </View>
    );
});

/**
 * 样式定义
 */
const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        marginVertical: 4,
    },
    container: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: UI_THEME.BORDER,
        borderRadius: 8,
        backgroundColor: UI_THEME.BG,
        paddingHorizontal: 12,
    },
    containerSingle: {
        height: 48,
        alignItems: "center",
    },
    containerMultiline: {
        minHeight: 100,
        paddingVertical: 10,
        alignItems: "flex-start",
    },
    containerError: {
        borderColor: UI_THEME.ERROR,
    },
    inputBase: {
        flex: 1,
        fontSize: 16,
        color: UI_THEME.TEXT,
        padding: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none' as any,
            },
            default: {},
        }),
    },
    inputSingle: {
        height: "100%",
    },
    iconContainer: {
        marginRight: 10,
        justifyContent: 'center',
    },
    iconContainerLeft: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    iconTopOffset: {
        marginTop: 2,
    },
    errorLabel: {
        color: UI_THEME.ERROR,
        fontSize: 12,
        marginTop: 4,
        paddingLeft: 4,
    }
});

InputComponent.displayName = "Input";

export const Input = InputComponent;