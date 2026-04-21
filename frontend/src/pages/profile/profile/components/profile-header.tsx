/**
 * @file profile-header.tsx
 * @description 个人中心页头部组件，包含用户信息展示、状态统计及交互入口。
 */

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Edit2, Check, Star } from "lucide-react-native";
import styles, { colors } from "../profile.style";

/**
 * 头部组件属性接口定义
 * @interface ProfileHeaderProps
 */
interface ProfileHeaderProps {
    /** 用户显示名称 */
    name: string;
    /** 用户头像地址 (URL) */
    avatar: string;
    /** 是否已通过实名认证 */
    verified: boolean;
    /** 用户累计出行次数 */
    trips: number;
    /** 用户综合评分 (0.0 - 5.0) */
    rating: number;
    /** 累计节省金额 */
    savings: number;
    /** * 编辑头像的回调处理函数
     * 业务层应在该函数实现内记录链路日志 
     */
    onEditAvatar: () => void;
}

/**
 * 个人中心头部视图组件（展示型组件）
 * 职责：负责用户信息与统计数据的 UI 呈现，不参与业务逻辑与链路追踪。
 * * @param {ProfileHeaderProps} props - 组件属性
 * @returns {JSX.Element} 头部渲染节点
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    avatar,
    verified,
    trips,
    rating,
    savings,
    onEditAvatar
}) => {
    return (
        <View style={styles.header}>
            {/* 用户基础信息区域：头像与认证状态 */}
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: avatar }}
                        style={styles.avatar}
                        accessibilityLabel={`${name}的头像`}
                    />
                    <TouchableOpacity
                        style={styles.editBadge}
                        onPress={onEditAvatar}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                    >
                        <Edit2 size={12} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.userTextContent}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{name}</Text>
                        {verified ? (
                            <View style={styles.verifiedTag}>
                                <Check size={10} color={colors.white} />
                                <Text style={styles.verifiedText}>已认证</Text>
                            </View>
                        ) : undefined}
                    </View>
                </View>
            </View>

            {/* 数据统计网格：展示出行、评分及资产数据 */}
            <View style={styles.statsGrid}>
                {/* 出行次数统计 */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{trips ?? 0}</Text>
                    <Text style={styles.statLabel}>出行次数</Text>
                </View>

                {/* 评分统计 - 包含视觉隔离边框 */}
                <View style={[styles.statItem, styles.statBorder]}>
                    <View style={styles.ratingRow}>
                        <Star size={14} color={colors.warning} fill={colors.warning} />
                        <Text style={styles.statValue}>{rating ?? '0.0'}</Text>
                    </View>
                    <Text style={styles.statLabel}>综合评分</Text>
                </View>

                {/* 省钱统计：货币单位格式化渲染 */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>¥{savings ?? 0}</Text>
                    <Text style={styles.statLabel}>累计省钱</Text>
                </View>
            </View>
        </View>
    );
};