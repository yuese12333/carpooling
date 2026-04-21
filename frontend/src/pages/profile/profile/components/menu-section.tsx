/**
 * @file menu-section.tsx
 * @description 个人中心功能菜单组组件，支持分组展示与交互状态反馈。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, Check } from "lucide-react-native";
import { IMenuGroup, IMenuItem } from "../profile-config";
import styles, { colors } from "../profile.style";

/**
 * 菜单组件属性接口定义
 * @interface MenuSectionProps
 */
interface MenuSectionProps {
    /** 分组后的菜单配置数据 */
    menuData: IMenuGroup[];
    /** * 菜单项点击回调函数
     * 业务日志与链路追踪由该函数的实现者负责。
     */
    onItemClick: (item: IMenuItem) => void;
}

/**
 * 菜单分组展示组件（受控展示组件）
 * @param {MenuSectionProps} props - 组件属性
 * @returns {JSX.Element} 菜单组视图
 */
export const MenuSection: React.FC<MenuSectionProps> = ({ menuData, onItemClick }) => {

    // 防御性检查：若无配置数据则不进行渲染
    if (!menuData || menuData.length === 0) {
        return null;
    }

    return (
        <>
            {menuData.map((group) => (
                <View key={`group-${group.group}`} style={styles.menuGroup}>
                    {/* 分组头部：展示业务逻辑分组名称 */}
                    <View style={styles.groupHeader}>
                        <Text style={styles.groupTitle}>{group.group}</Text>
                    </View>

                    {/* 菜单卡片容器：集成卡片样式与阴影 */}
                    <View style={styles.menuCard}>
                        {group.items.map((item, index) => {
                            const isLastItem = index === group.items.length - 1;

                            return (
                                <TouchableOpacity
                                    key={`item-${item.label}`}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.menuItem,
                                        !isLastItem && styles.menuItemBorder
                                    ]}
                                    // UI 层仅负责触发动作，不感知日志追踪细节
                                    onPress={() => onItemClick(item)}
                                >
                                    {/* 图标区域：支持动态背景色与品牌色 */}
                                    <View style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}>
                                        <item.icon size={18} color={item.color} />
                                    </View>

                                    {/* 文字内容区域：处理主标题与副标题逻辑 */}
                                    <View style={styles.menuTextContent}>
                                        <Text
                                            style={[
                                                styles.menuLabel,
                                                item.danger ? { color: colors.danger } : undefined
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.sub ? (
                                            <Text style={styles.menuSubText}>{item.sub}</Text>
                                        ) : undefined}
                                    </View>

                                    {/* 状态反馈区域：展示“已完成”状态或“跳转”箭头 */}
                                    {item.done ? (
                                        <View style={styles.doneWrapper}>
                                            <Check size={12} color={colors.success} />
                                            <Text style={styles.doneText}>已完成</Text>
                                        </View>
                                    ) : (
                                        <ChevronRight size={16} color={colors.divider} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            ))}
        </>
    );
};