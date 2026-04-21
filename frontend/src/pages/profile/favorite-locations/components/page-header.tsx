/**
 * @file page-header.tsx
 * @description 公用页面顶部导航组件。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import styles, { COLORS } from "../favorite-locations.style";

/**
 * 页面导航头属性定义
 */
interface PageHeaderProps {
    /** 导航栏标题内容 */
    title: string;
    /** 返回按钮回调函数 */
    onBack: () => void;
}

/**
 * 页面导航头组件
 * @param {PageHeaderProps} props - 组件属性
 * @returns {JSX.Element} 渲染后的导航组件
 */
export const PageHeader = ({ title, onBack }: PageHeaderProps) => {
    // 遵循 UI 规范：引入安全区域适配
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.navBar,
                { paddingTop: Math.max(insets.top, 12) } // 动态适配状态栏高度
            ]}
        >
            <TouchableOpacity
                onPress={onBack}
                style={styles.backBtn}
                activeOpacity={0.7}
                accessibilityLabel="返回按钮"
            >
                <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.navTitle} numberOfLines={1}>
                {title}
            </Text>

            {/* 右侧占位容器，确保标题居中，宽度需与左侧返回按钮一致 */}
            <View style={styles.backBtn} pointerEvents="none" />
        </View>
    );
};