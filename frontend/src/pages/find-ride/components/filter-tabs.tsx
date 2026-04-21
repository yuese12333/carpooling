/**
 * @file filter-tabs.tsx
 * @description 过滤标签横向滚动组件。
 */

import React, { useCallback } from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import styles from "../find-ride.style";
import logger from '@/utils/logger';

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
    /** * [规范注入] 链路追踪请求 ID 
     * 必须由父级业务页面显式传入
     */
    requestId: string | undefined;
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
    requestId,
}) => {
    /**
     * 处理标签点击事件并记录审计日志
     * [优化] 使用 useCallback 确保引用稳定，显式消费传入的 requestId
     */
    const handleTagPress = useCallback((tagValue: string) => {
        const isActive = activeFilters.includes(tagValue);

        // 严格遵循统一日志结构规范
        logger.info({
            module: 'component.filterTabs',
            operate: 'toggleFilter',
            params: {
                tagValue,
                targetStatus: !isActive ? 'active' : 'inactive',
                currentSelection: activeFilters
            },
            result: 'User triggered filter toggle',
            requestId: requestId, // 显式注入
            error: undefined,
            errorType: undefined
        });

        // 执行原始业务逻辑
        onToggle(tagValue);
    }, [activeFilters, onToggle, requestId]);

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

export default FilterTabs;