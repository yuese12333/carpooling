/**
 * @file sort-panel.tsx
 * @description 排序选项面板组件。
 */

import React, { useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import styles from "../find-ride.style";
import logger from '@/utils/logger';

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
    /** * [规范注入] 链路追踪请求 ID 
     * 严禁组件内部隐式获取，必须由父级业务层显式传递
     */
    requestId: string | undefined;
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
    requestId,
}) => {

    /**
     * 处理排序项点击事件
     * [优化] 使用 useCallback 确保引用稳定
     * @param option 目标排序项
     */
    const handleSortPress = useCallback((option: string): void => {
        // 记录排序交互审计日志，严格遵循统一日志结构要求
        logger.info({
            module: 'component.sortPanel',
            operate: 'changeSort',
            params: {
                previousSort: currentSort,
                targetSort: option
            },
            result: 'User updated sorting preference',
            requestId: requestId, // 显式注入消费
            error: undefined,
            errorType: undefined
        });

        // 执行原始业务回调逻辑
        onSelect(option);
    }, [currentSort, onSelect, requestId]);

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

export default SortPanel;