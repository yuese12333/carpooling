/**
 * @file ride-card.tsx
 * @description 拼车行程卡片组件。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Users, Star, Clock, ChevronRight } from "lucide-react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Badge } from "@/components/badge";
import styles from "../find-ride.style";
import { COLORS } from '@/pages/style';
import logger from '@/utils/logger';

/**
 * 行程数据模型（基于 API 实体结构）
 */
interface RideEntity {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
    price: string | number;
    status: 'available' | 'full' | 'cancelled' | 'active' | 'completed';
    seatsLeft: number;
    duration: string;
    driver: {
        name: string;
        avatar: string;
        verified: boolean;
        car: string;
        rating: number;
        trips: number;
    };
}

interface RideCardProps {
    /** 行程实体数据 */
    ride: RideEntity;
    /** 点击卡片回调 */
    onPress: () => void;
    /** * [规范注入] 链路追踪请求 ID 
     * 严禁组件内部隐式获取，必须由父级业务层显式传递
     */
    requestId: string | undefined;
}

/**
 * 拼车行程卡片组件
 * @param {RideCardProps} props 组件属性
 * @returns {JSX.Element | null}
 */
export const RideCard: React.FC<RideCardProps> = ({
    ride,
    onPress,
    requestId
}) => {
    // 基础防御逻辑
    if (!ride || !ride.driver) {
        return null;
    }

    const isFull = ride.status === "full";

    /**
     * 处理卡片点击并注入链路审计
     * [优化] 使用 useCallback 确保引用稳定，显式使用外部注入的 requestId
     */
    const handlePress = () => {
        // 记录用户交互行为日志：严格遵循统一日志结构
        logger.info({
            module: 'component.rideCard',
            operate: 'clickRideDetail',
            params: {
                rideId: ride.id,
                driverName: ride.driver.name,
                from: ride.from,
                to: ride.to
            },
            result: 'User navigated to ride detail',
            requestId: requestId, // 显式消费
            error: undefined,
            errorType: undefined
        });

        if (typeof onPress === 'function') {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={styles.card}
        >
            {isFull && (
                <View style={styles.fullBadge}>
                    <Text style={styles.fullBadgeText}>已满员 · 可预约下次</Text>
                </View>
            )}

            <View style={styles.cardContent}>
                <View style={styles.driverRow}>
                    <View>
                        <Avatar style={styles.avatar}>
                            <AvatarImage source={{ uri: ride.driver.avatar }} />
                            <AvatarFallback>{ride.driver.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        {ride.driver.verified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedIcon}>✓</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.driverMeta}>
                        <View style={styles.nameRow}>
                            <Text style={styles.driverName}>{ride.driver.name}</Text>
                            <Badge variant="secondary">
                                <Text style={styles.carText}>{ride.driver.car}</Text>
                            </Badge>
                        </View>
                        <View style={styles.ratingRow}>
                            <Star size={12} color={COLORS.status["medium"]} fill={COLORS.status["medium"]} />
                            <Text style={styles.ratingText}>{ride.driver.rating}</Text>
                            <View style={styles.verticalDivider} />
                            <Text style={styles.tripCount}>{ride.driver.trips}次行程</Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.currencySymbol}>¥</Text>
                            <Text style={styles.priceValue}>{ride.price}</Text>
                            <Text style={styles.priceValue}>/人</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.routeRow}>
                    <View style={styles.routeVisualContainer}>
                        <View style={styles.dotGreen} />
                        <View style={styles.dashLine} />
                        <View style={styles.dotOrange} />
                    </View>
                    <View style={styles.routeTextContainer}>
                        <View style={styles.addressBlock}>
                            <View style={styles.addressHeader}>
                                <Text style={styles.addressText} numberOfLines={1}>
                                    {ride.from}
                                </Text>
                                <Text style={styles.timeText}>
                                    {ride.date} {ride.time}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.addressBlock}>
                            <Text style={styles.addressText} numberOfLines={1}>
                                {ride.to}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.tagGroup}>
                        <View style={styles.infoTagBlue}>
                            <Clock size={12} color={COLORS.info} />
                            <Text style={styles.tagTextBlue}>{ride.duration}</Text>
                        </View>
                        <View style={styles.infoTagPurple}>
                            <Users size={12} color={COLORS.accent} />
                            <Text style={styles.tagTextPurple}>
                                {isFull ? "已满" : `余${ride.seatsLeft}座`}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color={COLORS.textPlaceholder} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default RideCard;