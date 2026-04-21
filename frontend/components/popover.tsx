/**
 * @file popover.tsx
 * @description 基于 @rn-primitives/popover 封装的高性能气泡卡片组件。
 * 优化了 TypeScript 类型约束、跨平台阴影表现及动画进入/退出的一致性。
 */

import * as React from 'react';
import { Platform, StyleSheet, ViewStyle, Pressable, View } from 'react-native';
import * as PopoverPrimitive from '@rn-primitives/popover';
import Animated, { Keyframe } from 'react-native-reanimated';
import { cn } from '../src/utils';

// --- 类型定义 (Typing) ---

/** Popover 根组件属性 */
interface PopoverProps extends PopoverPrimitive.RootProps {
    children: React.ReactNode;
    /** 控制气泡显示状态 */
    open?: boolean;
    /** 状态变更回调 */
    onOpenChange?: (open: boolean) => void;
}

/** Popover 内容区属性 */
interface PopoverContentProps extends PopoverPrimitive.ContentProps {
    className?: string;
    /** 自定义容器样式 */
    style?: ViewStyle;
    /** 子元素 */
    children?: React.ReactNode;
}

// --- 动画常量 (Animations) ---

/** * 渐显并微弱放大的入场动画 
 * 范围: 0.95 -> 1.0，时长: 100ms
 */
const EnteringAnimation = new Keyframe({
    0: {
        opacity: 0,
        transform: [{ scale: 0.95 }],
    },
    100: {
        opacity: 1,
        transform: [{ scale: 1 }],
    },
}).duration(100);

/** * 渐隐并微弱缩小的退场动画 
 * 时长: 50ms
 */
const ExitingAnimation = new Keyframe({
    0: {
        opacity: 1,
        transform: [{ scale: 1 }],
    },
    100: {
        opacity: 0,
        transform: [{ scale: 0.95 }],
    },
}).duration(50);

// --- 组件实现 (Components) ---

/**
 * Popover 根组件
 * 负责管理气泡的开启/关闭状态。
 */
const Popover = PopoverPrimitive.Root as React.FC<PopoverProps>;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverPortal = PopoverPrimitive.Portal;

/**
 * Popover 内容组件
 * 封装了 Portal、Overlay 遮罩层以及基于 Reanimated 的入场动画。
 */
const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    PopoverContentProps
>(({ className, align = 'center', sideOffset = 4, children, style, ...props }, ref) => {

    // 缓存样式合并逻辑，避免 Render 阶段产生新对象引用
    const flattenedStyle = React.useMemo(() => {
        return StyleSheet.flatten([styles.content, style]) as ViewStyle;
    }, [style]);

    return (
        <PopoverPortal>
            <PopoverPrimitive.Overlay asChild>
                <Pressable
                    style={styles.overlayPressable}
                    accessibilityRole="button"
                    accessibilityLabel="Close popover"
                >
                    <Animated.View
                        entering={EnteringAnimation}
                        exiting={ExitingAnimation}
                        style={styles.backdrop}
                    />
                </Pressable>
            </PopoverPrimitive.Overlay>

            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                {...props}
                style={flattenedStyle}
                className={cn("bg-white rounded-xl border border-slate-200", className)}
            >
                <Animated.View
                    entering={EnteringAnimation}
                    exiting={ExitingAnimation}
                    style={styles.innerContainer}
                >
                    {children}
                </Animated.View>
            </PopoverPrimitive.Content>
        </PopoverPortal>
    );
});

PopoverContent.displayName = 'PopoverContent';

// --- 样式定义 (StyleSheet) ---

const styles = StyleSheet.create({
    overlayPressable: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 50,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    content: {
        backgroundColor: '#FFFFFF',
        minWidth: 140,
        zIndex: 51,
        // 跨平台阴影配置
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    innerContainer: {
        width: '100%',
        padding: 6,
    }
});

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal };