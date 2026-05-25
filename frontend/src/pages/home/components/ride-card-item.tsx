/**
 * @file ride-card-item.tsx
 * @description 推荐行程列表卡片组件（原子 UI 层）
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, GestureResponderEvent } from "react-native";
import { Star, Users } from "lucide-react-native";
import { RideItem } from '@/api/home-api';
import styles from "../home.style";
import { COLORS } from "@/pages/style";

/**
 * 行程卡片组件属性接口
 */
interface RideCardItemProps {
    /** 行程详细数据对象 */
    ride: RideItem;
    /** * 点击卡片的回调函数 
     * @param id 行程唯一标识符
     * @param event 手势事件对象（用于业务层处理坐标等埋点）
     */
    onPress: (id: string, event: GestureResponderEvent) => void;
}

/**
 * 推荐行程卡片单项组件
 * 职责：仅负责 UI 渲染与事件代理，不感知 requestId，不记录业务日志。
 */
export const RideCardItem: React.FC<RideCardItemProps> = ({ ride, onPress }) => {

    /**
     * 处理点击代理
     * 规范：由 Page 调用层负责记录点击日志及注入 requestId
     */
    const handlePress = (event: GestureResponderEvent) => {
        onPress(ride.id, event);
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
                    <Users size={12} color={COLORS.textMuted} />
                    <Text style={styles.seatsText}>
                        {ride.seatsLeft}座
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default RideCardItem;