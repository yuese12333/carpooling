/**
 * @file sort-panel.tsx
 * @description 排序选项面板组件，集成交互行为审计与链路追踪追踪
 */

import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import styles from "../find-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 排序面板组件属性接口
 */
interface SortPanelProps {
    /** 排序选项列表（只读字符串数组） */
    options: readonly string[];
    /** 当前选中的排序项标识 */
    currentSort: string;
    /** * 选中排序项回调 
     * @param option 选中的选项字符串
     */
    onSelect: (option: string) => void;
}

/**
 * 排序选项面板组件
 * @param {SortPanelProps} props - 组件属性
 * @returns {JSX.Element}
 */
export const SortPanel: React.FC<SortPanelProps> = ({
    options,
    currentSort,
    onSelect,
}) => {

    /**
     * 处理排序项点击事件
     * 集成日志审计逻辑，注入全局 RequestId
     * @param option 目标排序项
     */
    const handleSortPress = (option: string): void => {
        // 从全局 Store 获取已存在的 RequestId，严禁重复生成
        const requestId = useEnvStore.getState().currentRequestId;

        // 记录排序交互审计日志
        logger.info({
            module: 'component.sortPanel',
            operate: 'changeSort',
            params: {
                previousSort: currentSort,
                targetSort: option
            } as unknown as Record<string, unknown>,
            result: 'User updated sorting preference',
            requestId: requestId
        });

        // 执行原始业务回调逻辑
        onSelect(option);
    };

    return (
        <View style={styles.sortDropdown}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: 'center' }}
            >
                {options.map((option) => {
                    const isActive = currentSort === option;
                    return (
                        <TouchableOpacity
                            key={option}
                            onPress={() => handleSortPress(option)}
                            style={[
                                styles.sortOption,
                                isActive && styles.sortOptionActive,
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.sortText,
                                    isActive && styles.sortTextActive,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};