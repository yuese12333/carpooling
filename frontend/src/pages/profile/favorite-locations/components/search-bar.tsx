/**
 * @file search-bar.tsx
 * @description 常用地点搜索条组件。
 */

import React, { JSX } from "react";
import { View, Text } from "react-native";
import { Search, Navigation } from "lucide-react-native";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import styles, { COLORS } from "../favorite-locations.style";

/**
 * 搜索条组件属性定义
 */
interface SearchBarProps {
    /** 当前搜索框文本值 */
    value: string;
    /** 搜索文本变更回调 */
    onChangeText: (text: string) => void;
    /** 获取当前位置回调 */
    onGetCurrentLocation: () => void;
}

/**
 * 搜索条原子 UI 组件
 * @param {SearchBarProps} props - 组件属性
 * @returns {JSX.Element} 渲染后的搜索条组件
 */
export const SearchBar = ({
    value,
    onChangeText,
    onGetCurrentLocation
}: SearchBarProps): JSX.Element => {

    return (
        <View style={styles.searchSection}>
            <Input
                placeholder="搜索已保存的地点..."
                value={value}
                onChangeText={onChangeText}
                leftIcon={<Search size={18} color={COLORS.textMuted} />}
                // 确保原子组件行为可控
                autoCapitalize="none"
                clearButtonMode="while-editing"
            />

            <View style={styles.quickActions}>
                <Text style={styles.sectionHeader}>我的位置</Text>

                <Button
                    variant="ghost"
                    size="sm"
                    onPress={onGetCurrentLocation}
                    style={styles.cardContent}
                >
                    <Navigation size={14} color={COLORS.primary} />
                    <Text style={styles.currentLocText}>获取当前位置</Text>
                </Button>
            </View>
        </View>
    );
};