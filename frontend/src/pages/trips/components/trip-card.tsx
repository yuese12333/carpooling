/**
 * @file trip-card.tsx
 * @description 行程卡片组件，负责展示行程简要信息、角色状态、路线以及交互操作。
 * @version 1.1.0
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, Navigation, Clock, Users, Star, ChevronRight } from "lucide-react-native";
import { Badge } from "@/components/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Separator } from "@/components/separator";
import { TransformedTrip } from '@/hooks/use-trips-form';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import styles, { COLORS } from "../trips.style"; // 引用已重构的样式文件

/**
 * 状态映射常量
 */
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
    upcoming: { label: "即将出发", bgColor: "#DCFCE7", textColor: COLORS.primary },
    completed: { label: "已完成", bgColor: COLORS.gray100, textColor: COLORS.gray500 },
    cancelled: { label: "已取消", bgColor: "#FEF2F2", textColor: COLORS.danger },
};

const ROLE_LABELS: Record<string, string> = {
    passenger: "乘客",
    driver: "司机"
};

interface TripCardProps {
    trip: TransformedTrip; // 严格匹配
    onPress: (id: string) => void;
    onCancel: (id: string) => void;
    onContact: (id: string, role: string) => void;
}

const MODULE_NAME = 'trip-card-component';

/**
 * @description 行程详情展示卡片
 */
const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onCancel, onContact }) => {
    const { ride, role, status, id } = trip;
    const requestId = useEnvStore.getState().currentRequestId;

    // 计算总价：乘客人头费或司机总额
    const finalPrice = (ride?.price || 0) * (trip.bookedSeats || 1);
    const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.completed;

    /**
     * @description 处理联系动作并记录追踪日志
     */
    const internalContactHandler = () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'click_contact',
            params: { tripId: id, role },
            result: 'User initiated contact from card ui',
            requestId
        });
        onContact(id, role);
    };

    /**
     * @description 处理取消动作并记录追踪日志
     */
    const internalCancelHandler = () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'click_cancel',
            params: { tripId: id },
            result: 'User initiated cancel from card ui',
            requestId
        });
        onCancel(id);
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(id)}
            activeOpacity={0.9}
            style={styles.cardContainer}
        >
            {/* 卡片头部：状态与时间 */}
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Badge style={{ backgroundColor: currentStatus.bgColor, marginRight: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: currentStatus.textColor }}>
                            {currentStatus.label}
                        </Text>
                    </Badge>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{ROLE_LABELS[role]}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 11, color: COLORS.gray400 }}>
                    {ride?.date} {ride?.time}
                </Text>
            </View>

            <View style={{ padding: 16 }}>
                {/* 司机/个人信息栏 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar style={{ height: 40, width: 40, marginRight: 12 }}>
                        <AvatarImage source={{ uri: ride?.driver?.avatar }} />
                        <AvatarFallback>
                            <Text>{ride?.driver?.name?.charAt(0) || "?"}</Text>
                        </AvatarFallback>
                    </Avatar>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.gray800 }}>
                            {role === "driver" ? "我是司机" : ride?.driver?.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.gray400 }}>
                            {ride?.driver?.car} · {ride?.driver?.carPlate}
                        </Text>
                    </View>
                    {status === "completed" && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.gray700, marginLeft: 4 }}>
                                {ride?.driver?.rating}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 路线展示区 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View style={styles.routeLineContainer}>
                        <Navigation size={12} color={COLORS.primary} />
                        <View style={styles.routeLine} />
                        <MapPin size={12} color={COLORS.orange} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, color: COLORS.gray700, fontWeight: '500', marginBottom: 24 }} numberOfLines={1}>
                            {ride?.from}
                        </Text>
                        <Text style={{ fontSize: 14, color: COLORS.gray700, fontWeight: '500' }} numberOfLines={1}>
                            {ride?.to}
                        </Text>
                    </View>
                </View>

                <Separator style={{ marginVertical: 8 }} />

                {/* 统计信息与价格 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                        <Clock size={12} color={COLORS.gray400} />
                        <Text style={{ fontSize: 12, color: COLORS.gray400, marginLeft: 4 }}>
                            {ride?.duration}
                        </Text>
                    </View>
                    {role === "passenger" && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Users size={12} color={COLORS.gray400} />
                            <Text style={{ fontSize: 12, color: COLORS.gray400, marginLeft: 4 }}>
                                {trip.bookedSeats}座
                            </Text>
                        </View>
                    )}
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.priceText}>¥{finalPrice}</Text>
                    </View>
                    <ChevronRight size={16} color={COLORS.gray300} style={{ marginLeft: 4 }} />
                </View>
            </View>

            {/* 待出发状态的操作按钮 */}
            {status === "upcoming" && (
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.footerBtn, styles.footerBtnBorder]}
                        onPress={internalContactHandler}
                    >
                        <Text style={{ fontSize: 14, color: COLORS.gray700 }}>
                            联系{role === "driver" ? "乘客" : "司机"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.footerBtn}
                        onPress={internalCancelHandler}
                    >
                        <Text style={{ fontSize: 14, color: COLORS.danger, fontWeight: '500' }}>
                            取消行程
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default TripCard;