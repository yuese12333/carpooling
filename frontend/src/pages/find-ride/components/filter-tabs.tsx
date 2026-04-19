/**
 * @file filter-tabs.tsx
 * @description 过滤标签横向滚动组件，集成交互行为审计与链路追踪
 */

import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import styles from "../find-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 过滤标签元数据接口
 */
interface FilterTag {
    label: string;
    value: string;
}

/**
 * 过滤标签组件属性接口
 */
interface FilterTabsProps {
    /** 标签数据列表 */
    tags: FilterTag[];
    /** 当前已选中的标签值数组 */
    activeFilters: string[];
    /** * 切换标签回调 
     * @param tagValue 触发切换的标签值
     */
    onToggle: (tagValue: string) => void;
}

/**
 * 过滤标签横向滚动组件
 * @param {FilterTabsProps} props 组件属性
 * @returns {JSX.Element}
 */
export const FilterTabs: React.FC<FilterTabsProps> = ({
    tags,
    activeFilters,
    onToggle,
}) => {
    /**
     * 处理标签点击事件并记录审计日志
     * @param tagValue 标签标识
     */
    const handleTagPress = (tagValue: string) => {
        const requestId = useEnvStore.getState().currentRequestId;
        const isActive = activeFilters.includes(tagValue);

        // 记录交互操作日志，确保护送链路追踪 ID
        logger.info({
            module: 'component.filterTabs',
            operate: 'toggleFilter',
            params: {
                tagValue,
                targetStatus: !isActive ? 'active' : 'inactive',
                currentSelection: activeFilters
            } as unknown as Record<string, unknown>,
            result: 'User triggered filter toggle',
            requestId: requestId
        });

        // 执行原始业务逻辑
        onToggle(tagValue);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
        >
            {tags.map((tag) => {
                const isActive = activeFilters.includes(tag.value);
                return (
                    <TouchableOpacity
                        key={tag.value}
                        onPress={() => handleTagPress(tag.value)}
                        style={[
                            styles.filterTag,
                            isActive && styles.filterTagActive,
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                isActive && styles.filterTextActive,
                            ]}
                        >
                            {tag.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};