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
 * 内部实现组件（避免直接在导出处使用匿名 forwardRef）
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
        moduleName = "CommonInput",
        ...restProps
    } = props;

    /**
     * 组件日志记录规范
     * 格式：[UI_LOG] [module:组件名] [operate:行为]
     */
    const logUIEvent = useCallback((operate: string) => {
        console.log(`[UI_LOG] [module:${moduleName}] [operate:${operate}]`);
    }, [moduleName]);

    const handleFocus = useCallback((e: any) => {
        logUIEvent("INPUT_FOCUS");
        onFocus?.(e);
    }, [onFocus, logUIEvent]);

    const handleBlur = useCallback((e: any) => {
        logUIEvent("INPUT_BLUR");
        onBlur?.(e);
    }, [onBlur, logUIEvent]);

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
     * 强制断言样式数组类型，避免类型兼容报错
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

// 设置组件名称以便于调试
InputComponent.displayName = "Input";

/**
 * 最终具名导出，确保导出的是一个已赋值的函数对象
 */
export const Input = InputComponent;