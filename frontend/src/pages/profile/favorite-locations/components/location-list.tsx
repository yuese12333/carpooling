/**
 * @file location-list.tsx
 * @description 常用地点列表展示组件，采用 FlatList 实现高性能渲染，属于原子 UI 层，不感知业务链路 ID
 */

import React from "react";
import { FlatList, View, Text, ListRenderItem } from "react-native";
import { MapPin } from "lucide-react-native";
import { LocationItem as LocationDataType } from "@/api/favorite-locations-api";
import { LocationItem } from "./location-item";
import styles, { COLORS } from "../favorite-locations.style";

/**
 * 常用地点列表组件属性定义
 */
interface LocationListProps {
    /** 地点数据列表 */
    data: LocationDataType[];
    /** 加载状态指示 */
    loading: boolean;
    /** 点击编辑回调 */
    onEdit: (item: LocationDataType) => void;
    /** 点击删除请求回调 */
    onDelete: (item: LocationDataType) => void;
}

/**
 * 常用地点列表组件
 * @param props - LocationListProps
 * @returns 渲染后的列表组件
 */
export const LocationList = ({ data, loading, onEdit, onDelete }: LocationListProps) => {

    /**
     * 渲染空状态或加载状态视图
     * 统一使用样式表定义的颜色与间距
     */
    const renderEmptyComponent = () => (
        <View style={styles.emptyState}>
            {loading && data.length === 0 ? (
                <Text style={styles.loadingText}>加载中...</Text>
            ) : (
                <>
                    <MapPin size={48} color={COLORS.border} />
                    <Text style={styles.emptyText}>暂无搜索结果</Text>
                </>
            )}
        </View>
    );

    /**
     * 单项渲染函数
     * 保持原子 UI 层的纯净，仅透传交互回调
     */
    const renderItem: ListRenderItem<LocationDataType> = ({ item }) => (
        <LocationItem
            item={item}
            onEdit={onEdit}
            onDeleteRequest={onDelete}
        />
    );

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyComponent}
            // 性能优化配置：开启裁剪与初始渲染量控制
            removeClippedSubviews={true}
            initialNumToRender={10}
            // 确保数据刷新时布局平滑
            scrollEventThrottle={16}
        />
    );
};