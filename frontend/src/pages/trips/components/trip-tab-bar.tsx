/**
 * @file trip-tab-bar.tsx
 * @description 我的行程页面状态切换标签栏组件，集成了全链路日志追踪与规范化样式引用。
 * @version 1.1.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import styles from "../trips.style"; // 修正命名规范为 kebab-case

/**
 * @description 标签栏组件属性定义
 */
interface TripTabBarProps {
    /** 标签名称数组 */
    tabs: string[];
    /** 当前激活的标签项名称 */
    activeTab: string;
    /** 标签切换时的回调函数 */
    onTabChange: (tab: string) => void;
}

const MODULE_NAME = 'trip-tab-bar-component';

/**
 * @description 行程列表状态切换页签组件
 * @param {TripTabBarProps} props - 组件属性
 * @returns {JSX.Element}
 */
export const TripTabBar: React.FC<TripTabBarProps> = ({
    tabs,
    activeTab,
    onTabChange
}) => {
    // 严格遵循全局 RequestId 消费逻辑，严禁本地重复生成
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * @description 处理标签点击事件并注入链路日志
     * @param {string} tab - 用户选中的标签名
     */
    const handleTabPress = (tab: string) => {
        // 记录交互触发点日志
        logger.info({
            module: MODULE_NAME,
            operate: 'switch_trip_tab',
            params: {
                from: activeTab,
                to: tab
            },
            result: 'Tab change action dispatched',
            requestId
        });

        // 执行原始业务逻辑
        onTabChange(tab);
    };

    return (
        <View style={styles.tabRow}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab;

                return (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => handleTabPress(tab)}
                        style={[
                            styles.tabItem,
                            isActive ? styles.tabItemActive : styles.tabItemInactive
                        ]}
                        activeOpacity={0.7} // 统一交互反馈感
                    >
                        <Text
                            style={
                                isActive ? styles.tabTextActive : styles.tabTextInactive
                            }
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};