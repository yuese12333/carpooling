/**
 * @file trip-tab-bar.tsx
 * @description 业务子组件：行程列表状态切换页签。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../trips.style";

/**
 * @description 标签栏组件属性定义
 */
interface TripTabBarProps {
    /** * 显式业务流 ID 注入 
     * 遵循：显式传递与注入规则，确保链路透明
     */
    requestId: string;
    /** 标签名称数组 */
    tabs: string[];
    /** 当前激活的标签项名称 */
    activeTab: string;
    /** * 标签切换时的回调函数 
     * 职责声明：此处的交互日志由调用方（Page 层）承接记录
     */
    onTabChange: (tab: string) => void;
}

/**
 * @description 行程列表状态切换页签组件
 * 职责分层：业务子组件。
 * 规范：持有 requestId 确保链路完整，但严禁在内部记录业务日志。
 */
export const TripTabBar: React.FC<TripTabBarProps> = ({
    requestId,
    tabs,
    activeTab,
    onTabChange
}) => {
    // 审计：确保 requestId 存在，防止链路断裂
    if (!requestId) {
        console.warn("[Architecture Warning] TripTabBar missing explicit requestId. Tracing link broken.");
    }

    return (
        <View style={styles.tabRow}>
            {tabs.map((tab) => {
                // 数据规范：确保对比逻辑不涉及 null
                const safeTabName = tab ?? "未知";
                const isActive = activeTab === safeTabName;

                return (
                    <TouchableOpacity
                        key={safeTabName}
                        onPress={() => onTabChange(safeTabName)}
                        style={[
                            styles.tabItem,
                            isActive ? styles.tabItemActive : styles.tabItemInactive
                        ]}
                        activeOpacity={0.7}
                    // 记录：requestId 已通过 props 显式透传，回调由父级 TripsPage 捕获并记录日志
                    >
                        <Text
                            style={
                                isActive ? styles.tabTextActive : styles.tabTextInactive
                            }
                        >
                            {safeTabName}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default TripTabBar;