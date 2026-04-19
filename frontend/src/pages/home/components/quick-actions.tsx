/**
 * @file quick-actions.tsx
 * @description 首页快捷操作区组件，提供找拼车、发布行程及历史行程的快速入口。
 */

import React from "react";
import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { Href } from 'expo-router';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import styles from "../home.style";
import { ROUTES } from '@/router/paths';

/**
 * 快捷操作项属性接口
 */
interface ActionItemProps {
    /** 显示图标（Emoji 或图标组件） */
    icon: string;
    /** 操作标题 */
    label: string;
    /** 操作副标题/描述 */
    sublabel: string;
    /** 背景颜色 */
    backgroundColor: string;
    /** 点击事件回调 */
    onPress: (event: GestureResponderEvent) => void;
}

/**
 * 快捷操作区组件属性接口
 */
interface QuickActionsProps {
    /** 导航跳转回调函数 @param path 目标路由路径 */
    onNavigate: (path: Href) => void;
    /** 颜色配置对象 */
    colors: {
        blue: string;
        green: string;
        purple: string;
    };
}

/**
 * 内部复用的动作单元组件
 * @param {ActionItemProps} props
 */
const ActionItem: React.FC<ActionItemProps> = ({
    icon,
    label,
    sublabel,
    backgroundColor,
    onPress
}) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.quickActionContainer, { backgroundColor }]}
    >
        <Text style={styles.quickActionIcon}>{icon}</Text>
        <Text style={styles.quickActionLabel}>{label}</Text>
        <Text style={styles.quickActionSublabel}>{sublabel}</Text>
    </TouchableOpacity>
);

/**
 * 快捷操作区主组件
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, colors }) => {
    // 从 Store 中获取全局 RequestId，禁止重复生成
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 统一处理操作项点击逻辑并记录日志
     * @param {string} actionName 操作名称
     * @param {Href} path 目标路径
     */
    const handleActionPress = (actionName: string, path: Href) => {
        try {
            // 记录业务流程起点日志
            logger.info({
                module: 'QuickActions',
                operate: `click_action_${actionName}`,
                params: { targetPath: path },
                result: 'navigating',
                error: undefined,
                errorType: undefined,
                requestId
            });

            onNavigate(path);
        } catch (error) {
            // 异常捕获与错误日志记录
            logger.error({
                module: 'QuickActions',
                operate: `click_action_${actionName}_error`,
                params: { targetPath: path },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NAVIGATION_ERROR',
                requestId
            });
        }
    };

    return (
        <View style={styles.quickActionSection}>
            <View style={styles.flexRowBetween}>
                <ActionItem
                    icon="🚗"
                    label="找拼车"
                    sublabel="顺路同行"
                    backgroundColor={colors.blue}
                    onPress={() => handleActionPress('find_ride', ROUTES.FIND_RIDE)}
                />
                <ActionItem
                    icon="📍"
                    label="发布行程"
                    sublabel="接单赚钱"
                    backgroundColor={colors.green}
                    onPress={() => handleActionPress('offer_ride', ROUTES.OFFER_RIDE)}
                />
                <ActionItem
                    icon="🏆"
                    label="我的行程"
                    sublabel="查看记录"
                    backgroundColor={colors.purple}
                    onPress={() => handleActionPress('my_trips', ROUTES.TRIPS)}
                />
            </View>
        </View>
    );
};