/**
 * @file ride-card.tsx
 * @description 拼车行程卡片组件，集成交互行为审计与链路追踪
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Users, Star, Clock, ChevronRight } from "lucide-react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/../components/avatar";
import { Badge } from "@/../components/badge";
import styles, { COLORS } from "../find-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

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
}

/**
 * 拼车行程卡片组件
 * @param {RideCardProps} props 组件属性
 * @returns {JSX.Element | null}
 */
export const RideCard: React.FC<RideCardProps> = ({ ride, onPress }) => {
    // 基础防御逻辑
    if (!ride || !ride.driver) {
        return null;
    }

    const isFull = ride.status === "full";

    /**
     * 处理卡片点击并注入链路审计
     */
    const handlePress = () => {
        const requestId = useEnvStore.getState().currentRequestId;

        // 记录用户交互行为日志
        logger.info({
            module: 'component.rideCard',
            operate: 'clickRideDetail',
            params: {
                rideId: ride.id,
                driverName: ride.driver.name,
                from: ride.from,
                to: ride.to
            } as unknown as Record<string, unknown>,
            result: 'User navigated to ride detail',
            requestId: requestId
        });

        onPress();
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
                            <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={styles.ratingText}>{ride.driver.rating}</Text>
                            <View style={styles.verticalDivider} />
                            <Text style={styles.tripCount}>{ride.driver.trips}次行程</Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.currencySymbol}>¥</Text>
                            <Text style={styles.priceValue}>{ride.price}</Text>
                            <Text style={styles.priceUnit}>/人</Text>
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