/**
 * @file trip-header.tsx
 * @description 行程列表页面的头部组件。包含返回导航、标题展示以及身份角色筛选切换器。
 * @version 1.1.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import styles, { COLORS } from "../trips.style";

/**
 * 角色过滤项结构定义
 */
interface RoleOption {
    key: "all" | "passenger" | "driver";
    label: string;
}

interface TripHeaderProps {
    /** 页面标题内容 */
    title: string;
    /** 是否处于 Mock 模式标识 */
    isMockMode: boolean;
    /** 当前激活的角色筛选键 */
    activeRole: RoleOption["key"];
    /** 角色筛选选项配置数组 */
    roleFilters: readonly RoleOption[];
    /** 返回上一页回调 */
    onBack: () => void;
    /** 角色筛选切换回调 */
    onRoleChange: (role: RoleOption["key"]) => void;
}

const MODULE_NAME = 'trip-header-component';

/**
 * @description 我的行程页面头部导航及筛选组件
 * @param {TripHeaderProps} props 组件属性
 * @returns {JSX.Element}
 */
export const TripHeader: React.FC<TripHeaderProps> = ({
    title,
    isMockMode,
    activeRole,
    roleFilters,
    onBack,
    onRoleChange
}) => {
    // 严格从 Store 获取当前链路 RequestId，严禁重新生成
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * @description 处理返回动作并记录链路日志
     */
    const handleBackWithLog = () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'click_back_button',
            params: { currentTitle: title },
            result: 'User initiated back navigation',
            requestId
        });
        onBack();
    };

    /**
     * @description 处理角色切换逻辑并记录链路日志
     * @param {RoleOption["key"]} roleSelected 选中的角色
     */
    const handleRoleChangeWithLog = (roleSelected: RoleOption["key"]) => {
        logger.info({
            module: MODULE_NAME,
            operate: 'switch_role_filter',
            params: {
                from: activeRole,
                to: roleSelected,
                isMock: isMockMode
            },
            result: 'Role filter updated',
            requestId
        });
        onRoleChange(roleSelected);
    };

    return (
        <View style={styles.headerWrapper}>
            {/* 顶部导航条 */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    onPress={handleBackWithLog}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color={COLORS.gray800} />
                </TouchableOpacity>

                <Text style={styles.navTitle}>
                    {title} {isMockMode ? "(Mock)" : undefined}
                </Text>

                {/* 保持布局平衡的占位符 */}
                <View style={{ width: 24 }} />
            </View>

            {/* 角色筛选 Tab 栏 */}
            <View style={styles.filterContainer}>
                {roleFilters.map((roleOption) => {
                    const isActive = activeRole === roleOption.key;

                    return (
                        <TouchableOpacity
                            key={roleOption.key}
                            onPress={() => handleRoleChangeWithLog(roleOption.key)}
                            style={[
                                {
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                },
                                isActive
                                    ? { backgroundColor: COLORS.primary }
                                    : { backgroundColor: COLORS.gray100 }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    { fontSize: 12, fontWeight: "500" },
                                    isActive ? { color: COLORS.white } : { color: COLORS.gray500 }
                                ]}
                            >
                                {roleOption.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};