/**
 * @file search-bar.tsx
 * @description 搜索栏组件，支持出发地与目的地输入，集成自动化埋点与链路追踪审计
 */

import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MapPin, Navigation as NavIcon, Search } from "lucide-react-native";
import styles, { COLORS } from "../find-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 搜索栏组件属性接口
 */
interface SearchBarProps {
    /** 出发地文本值 */
    from: string;
    /** 目的地文本值 */
    to: string;
    /** 出发地变更回调 */
    onFromChange: (text: string) => void;
    /** 目的地变更回调 */
    onToChange: (text: string) => void;
    /** 搜索触发回调 */
    onSearch: () => void;
}

/**
 * 搜索栏组件
 * @param {SearchBarProps} props - 组件属性
 * @returns {JSX.Element}
 */
export const SearchBar: React.FC<SearchBarProps> = ({
    from,
    to,
    onFromChange,
    onToChange,
    onSearch,
}) => {

    /**
     * 处理搜索点击并记录审计日志
     * 遵循全局 RequestId 消费规范
     */
    const handleSearchPress = (): void => {
        // 1. 从全局 Store 获取已存在的 RequestId，禁止生成新 ID
        const requestId = useEnvStore.getState().currentRequestId;

        // 2. 构造标准化日志结构
        logger.info({
            module: 'component.searchBar',
            operate: 'triggerSearch',
            params: {
                from: from.trim(),
                to: to.trim()
            } as unknown as Record<string, unknown>,
            result: 'Search interaction triggered',
            requestId: requestId
        });

        // 3. 执行原始业务逻辑
        onSearch();
    };

    return (
        <View style={styles.searchContainer}>
            {/* 出发地输入行 */}
            <View style={styles.searchRow}>
                <NavIcon size={16} color={COLORS.primary} />
                <TextInput
                    placeholder="出发地"
                    value={from}
                    onChangeText={onFromChange}
                    style={styles.input}
                    placeholderTextColor={COLORS.textPlaceholder}
                    accessibilityLabel="出发地输入框"
                />
            </View>

            {/* 分隔线 - 引用重构后的样式名以避免冲突 */}
            <View style={styles.searchDivider} />

            {/* 目的地输入行 */}
            <View style={styles.searchRow}>
                <MapPin size={16} color={COLORS.secondary} />
                <TextInput
                    placeholder="目的地"
                    value={to}
                    onChangeText={onToChange}
                    style={styles.input}
                    placeholderTextColor={COLORS.textPlaceholder}
                    accessibilityLabel="目的地输入框"
                />

                {/* 搜索提交按钮 */}
                <TouchableOpacity
                    style={styles.searchSubmit}
                    onPress={handleSearchPress}
                    activeOpacity={0.7}
                >
                    <Search size={18} color={COLORS.textWhite} />
                </TouchableOpacity>
            </View>
        </View>
    );
};