/**
 * @file quick-actions.tsx
 * @description 首页快捷操作区组件，提供找拼车、发布行程及历史行程的快速入口。
 * 修复项：
 * 1. 彻底移除从 useEnvStore 隐式读取 requestId 的逻辑。
 * 2. 强制通过 Props 显式注入 requestId，确保链路透明。
 * 3. 规范日志上报结构，确保参数化消费。
 */

import React from "react";
import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { Href } from 'expo-router';
import logger from '@/utils/logger';
import styles from "../home.style";
import { ROUTES } from '@/router/paths';

/**
 * 内部复用的动作单元组件 (原子UI层)
 * 规范：严禁感知 requestId，不直接记录业务日志
 */
interface ActionItemProps {
    icon: string;
    label: string;
    sublabel: string;
    backgroundColor: string;
    onPress: (event: GestureResponderEvent) => void;
}

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
 * 快捷操作区主组件属性接口
 */
interface QuickActionsProps {
    /** 显式注入的链路 ID */
    requestId: string;
    /** 导航跳转回调函数 */
    onNavigate: (path: Href) => void;
    /** 颜色配置对象 */
    colors: {
        blue: string;
        green: string;
        purple: string;
    };
}

/**
 * 快捷操作区主组件
 * 职责：负责业务动作的起点记录与跳转调度
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
    requestId,
    onNavigate,
    colors
}) => {
    /**
     * 统一处理操作项点击逻辑
     * 显式消费 Props 传入的 requestId
     */
    const handleActionPress = (actionName: string, path: Href) => {
        try {
            // 记录业务流程起点日志
            logger.info({
                module: 'QuickActions',
                operate: `click_action_${actionName}`,
                params: {
                    targetPath: path,
                    timestamp: Date.now() // 记录非敏感交互时间
                },
                result: 'navigating',
                error: undefined,
                errorType: undefined,
                requestId: requestId // 显式注入
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
                requestId: requestId // 显式注入
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

export default QuickActions;