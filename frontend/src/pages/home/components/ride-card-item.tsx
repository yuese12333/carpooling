/**
 * @file ride-card-item.tsx
 * @description 推荐行程列表卡片组件，负责展示司机信息、行程路径、价格及剩余座位。
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, GestureResponderEvent } from "react-native";
import { Star, Users } from "lucide-react-native";
import { RideItem } from '@/api/home-api';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import styles, { COLORS } from "../home.style";

/**
 * 行程卡片组件属性接口
 */
interface RideCardItemProps {
    /** 行程详细数据对象 */
    ride: RideItem;
    /** * 点击卡片的回调函数 
     * @param id 行程唯一标识符
     */
    onPress: (id: string) => void;
}

/**
 * 推荐行程卡片单项组件
 * @param {RideCardItemProps} props - 组件属性
 */
export const RideCardItem: React.FC<RideCardItemProps> = ({ ride, onPress }) => {
    // 消费全局 RequestId，确保链路一致性
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 处理卡片点击事件并记录追踪日志
     * @param {GestureResponderEvent} _event - 手势事件对象
     */
    const handlePress = (_event: GestureResponderEvent) => {
        try {
            // 记录用户交互起点
            logger.info({
                module: 'RideCardItem',
                operate: 'click_ride_item',
                params: {
                    rideId: ride.id,
                    driverName: ride.driver?.name // 仅记录非敏感信息
                },
                result: 'triggering_onPress_callback',
                error: undefined,
                errorType: undefined,
                requestId
            });

            onPress(ride.id);
        } catch (error) {
            logger.error({
                module: 'RideCardItem',
                operate: 'click_ride_item_error',
                params: { rideId: ride.id },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'INTERACTION_ERROR',
                requestId
            });
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            style={styles.rideCard}
        >
            {/* 顶部区域：司机信息与价格 */}
            <View style={styles.rideDriverRow}>
                <Image
                    source={{ uri: ride.driver?.avatar || 'https://via.placeholder.com/40' }}
                    style={styles.driverAvatar}
                />
                <View style={styles.driverInfo}>
                    <View style={styles.flexRowCenter}>
                        <Text style={styles.driverName}>
                            {ride.driver?.name || '未知司机'}
                        </Text>
                        {ride.driver?.verified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>已认证</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.flexRowCenter}>
                        <Star size={11} color={COLORS.rating} fill={COLORS.rating} />
                        <Text style={styles.ratingText}>
                            {ride.driver?.rating?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={styles.dotSeparator}>·</Text>
                        <Text style={styles.tripCountText}>
                            {ride.driver?.trips || 0}次出行
                        </Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>¥{ride.price}</Text>
                    <Text style={styles.priceUnit}>/ 人</Text>
                </View>
            </View>

            {/* 底部区域：行程路线与座位 */}
            <View style={styles.routeContainer}>
                <View style={styles.routeVisual}>
                    <View style={styles.dotGreen} />
                    <View style={styles.routeLine} />
                    <View style={styles.dotOrange} />
                </View>
                <View style={styles.routeDetails}>
                    <Text style={styles.routePointText}>
                        {ride.from} · {ride.time}
                    </Text>
                    <Text style={styles.routePointText}>
                        {ride.to}
                    </Text>
                </View>
                <View style={styles.seatsBadge}>
                    <Users size={12} color={COLORS.textGray} />
                    <Text style={styles.seatsText}>
                        {ride.seatsLeft}座
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};