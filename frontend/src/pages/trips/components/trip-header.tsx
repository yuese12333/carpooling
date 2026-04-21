/**
 * @file trip-header.tsx
 * @description 业务子组件：行程列表页面头部。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import styles, { COLORS } from "../trips.style";

interface RoleOption {
    key: "all" | "passenger" | "driver";
    label: string;
}

interface TripHeaderProps {
    /** 业务标题 */
    title: string;
    /** * 显式业务流 ID 注入
     * 遵循：显式传递与注入规则，严禁隐式从 Store 读取
     */
    requestId: string;
    /** 模拟数据标识 */
    isMockMode: boolean;
    /** 当前激活角色 */
    activeRole: RoleOption["key"];
    /** 角色筛选配置 */
    roleFilters: readonly RoleOption[];
    /** 返回回调 */
    onBack: () => void;
    /** 角色切换回调 */
    onRoleChange: (role: RoleOption["key"]) => void;
}

/**
 * @description 我的行程页面头部导航及筛选组件
 * 职责分层：业务子组件层。负责显式接收 requestId 并维护 UI 状态交互。
 */
export const TripHeader: React.FC<TripHeaderProps> = ({
    title,
    requestId,
    isMockMode,
    activeRole,
    roleFilters,
    onBack,
    onRoleChange
}) => {
    // 数据规范：确保展示文案不包含空值干扰
    const subTitleSuffix = isMockMode ? "(Mock)" : undefined;

    return (
        <View style={styles.headerWrapper}>
            {/* 顶部导航条 */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                // 提示：交互日志由父层 TripsPage 消费 requestId 并记录
                >
                    <ChevronLeft size={24} color={COLORS.gray800} />
                </TouchableOpacity>

                <Text style={styles.navTitle}>
                    {title} {subTitleSuffix}
                </Text>

                {/* 占位符，保持标题居中布局 */}
                <View style={{ width: 24 }} />
            </View>

            {/* 角色筛选 Tab 栏 */}
            <View style={styles.filterContainer}>
                {roleFilters.map((roleOption) => {
                    const isActive = activeRole === roleOption.key;

                    return (
                        <TouchableOpacity
                            key={roleOption.key}
                            onPress={() => onRoleChange(roleOption.key)}
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

export default TripHeader;