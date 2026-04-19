/**
 * @file trip-empty-state.tsx
 * @description 行程列表为空时的占位组件，采用标准化的原子化按钮与品牌视觉。
 */

import React from "react";
import { View, Text } from "react-native";
import { Car } from "lucide-react-native";
import { Button } from "@/components/button";
import styles, { COLORS } from "../trips.style"; // 目录规范修正

interface TripEmptyStateProps {
    /** 点击“去找拼车”按钮的回调函数 */
    onFindRide: () => void;
    /** 空状态下的描述性文字 */
    description?: string;
}

/**
 * @description 列表缺省态组件
 */
export const TripEmptyState: React.FC<TripEmptyStateProps> = ({
    onFindRide,
    description = "暂无行程记录"
}) => {
    return (
        <View style={styles.emptyContainer}>
            {/* 图标装饰区：采用统一灰阶 */}
            <View style={styles.emptyIconBox}>
                <Car size={32} color={COLORS.gray300} />
            </View>

            {/* 文案区：语义化文本 */}
            <View style={{ marginBottom: 24 }}>
                <Text style={{ textAlign: 'center', color: COLORS.gray400, fontSize: 14 }}>
                    {description}
                </Text>
            </View>

            {/* 引导动作区：引用工程化基础组件 */}
            <Button
                onPress={onFindRide}
                style={{ backgroundColor: COLORS.primary, paddingHorizontal: 32, borderRadius: 12 }}
            >
                <Text style={{ color: COLORS.white, fontWeight: '700' }}>去找拼车</Text>
            </Button>
        </View>
    );
};