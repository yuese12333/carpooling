/**
 * @file achievement-wall.tsx
 * @description 个人中心勋章墙组件，负责用户解锁成就的网格化渲染。
 */

import React from "react";
import { View, Text } from "react-native";
import { Award } from "lucide-react-native";
import { Card } from "@/../components/card";
import { BadgeItem } from "@/api/profile-api";
import styles from "../profile.style";
import { COLORS } from "@/pages/style";

/**
 * 勋章墙组件属性接口
 * @interface AchievementWallProps
 */
interface AchievementWallProps {
    /** 勋章数据列表，由业务层通过 API 获取后透传 */
    badges: BadgeItem[];
}

/**
 * 勋章墙组件（展示型组件）
 * 职责：仅负责根据传入的 badges 数组进行数据映射与 UI 呈现。
 * * @param {AchievementWallProps} props - 组件属性
 * @returns {JSX.Element} 勋章墙视图
 */
export const AchievementWall: React.FC<AchievementWallProps> = ({ badges }) => {

    // 防御性检查：确保 badges 存在，避免 map 报错
    if (!badges || !Array.isArray(badges)) {
        return null;
    }

    return (
        <Card style={styles.sectionCard}>
            {/* 标题区域：组合展示勋章墙主题 */}
            <View style={styles.sectionTitleRow}>
                <Award size={16} color={COLORS.yellowIcon} />
                <Text style={styles.sectionTitle}>成就徽章</Text>
            </View>

            {/* 勋章网格展示区域：采用数据驱动的布局渲染 */}
            <View style={styles.badgeGrid}>
                {badges.map((badge, index) => (
                    <View
                        // 使用 label 与 index 组合作为 key，确保渲染稳定性
                        key={`badge-${badge.label}-${index}`}
                        style={[
                            styles.badgeItem,
                            badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked
                        ]}
                    >
                        <Text style={styles.badgeEmoji}>
                            {badge.emoji || '🔒'}
                        </Text>
                        <Text
                            style={styles.badgeLabel}
                            numberOfLines={1}
                        >
                            {badge.label}
                        </Text>
                    </View>
                ))}
            </View>
        </Card>
    );
};