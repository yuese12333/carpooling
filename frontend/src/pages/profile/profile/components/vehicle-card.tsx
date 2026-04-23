/**
 * @file vehicle-card.tsx
 * @description 个人中心车辆信息卡片组件，负责车辆基础信息的静态展示与编辑动作分发。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Car } from "lucide-react-native";
import { Card } from "@/../components/card";
import styles from "../profile.style";
import { COLORS } from "@/pages/style";

/**
 * 车辆卡片组件属性接口
 * @interface VehicleCardProps
 */
interface VehicleCardProps {
    /** 车辆品牌或型号描述 */
    brand: string;
    /** 车辆外观颜色 */
    color: string;
    /** 脱敏后的车牌号码 */
    plate: string;
    /** * 编辑按钮点击的回调函数。
     * 注意：业务起点日志记录应由该函数的具体实现者（Page/Hook 层）负责。
     */
    onEdit: () => void;
}

/**
 * 车辆信息展示卡片（展示型 UI 组件）
 * 职责：仅负责根据 Props 渲染车辆信息并响应点击，不感知全链路追踪 ID。
 * * @param {VehicleCardProps} props - 组件属性
 * @returns {JSX.Element} 车辆卡片渲染节点
 */
export const VehicleCard: React.FC<VehicleCardProps> = ({
    brand,
    color,
    plate,
    onEdit
}) => {

    return (
        <Card style={styles.sectionCard}>
            <View style={styles.carInfoRow}>
                {/* 车辆图标视觉展示区域 */}
                <View style={styles.carIconWrapper}>
                    <Car size={20} color={COLORS.info} />
                </View>

                {/* 车辆详情文本展示区域 */}
                <View style={styles.carTextContent}>
                    <Text
                        style={styles.carName}
                        numberOfLines={1}
                    >
                        {brand || "未命名车辆"}
                    </Text>
                    <Text
                        style={styles.carDetail}
                        numberOfLines={1}
                    >
                        {color || "未知颜色"} · {plate || "暂无车牌"}
                    </Text>
                </View>

                {/* 编辑动作交互入口 */}
                <TouchableOpacity
                    onPress={onEdit}
                    activeOpacity={0.7}
                    accessibilityLabel="编辑车辆信息"
                    accessibilityRole="button"
                >
                    <Text style={styles.editText}>编辑</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );
};