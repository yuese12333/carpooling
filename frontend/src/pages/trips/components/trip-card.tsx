/**
 * @file trip-card.tsx
 * @description 业务子组件：行程卡片。
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, Navigation, Clock, Users, Star, ChevronRight } from "lucide-react-native";
import { Badge } from "@/components/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Separator } from "@/components/separator";
import { TransformedTrip } from '@/hooks/use-trips-form';
import styles from "../trips.style";
import { COLORS } from "@/pages/style"

/**
 * 状态映射常量
 */
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
    upcoming: { label: "即将出发", bgColor: COLORS.borderTip, textColor: COLORS.primary },
    completed: { label: "已完成", bgColor: COLORS.borderLight, textColor: COLORS.textSecondary },
    cancelled: { label: "已取消", bgColor: COLORS.errorLight, textColor: COLORS.danger },
};

const ROLE_LABELS: Record<string, string> = {
    passenger: "乘客",
    driver: "司机"
};

interface TripCardProps {
    /** 业务对象数据 */
    trip: TransformedTrip;
    /** * 显式业务流 ID 注入 
     * 遵循：显式传递与注入规则 (Explicit Passing)
     */
    requestId: string;
    /** 点击详情回调 */
    onPress: (id: string) => void;
    /** 取消操作回调 */
    onCancel: (id: string) => void;
    /** 联系操作回调 */
    onContact: (id: string, role: string) => void;
}

/**
 * @description 行程详情展示卡片 - 业务级组件
 */
const TripCard: React.FC<TripCardProps> = ({
    trip,
    requestId,
    onPress,
    onCancel,
    onContact
}) => {
    const { ride, role, status, id } = trip;

    // 计算逻辑校验，避免异常
    const bookedSeats = trip.bookedSeats ?? 0;
    const unitPrice = ride?.price ?? 0;
    const finalPrice = unitPrice * (bookedSeats > 0 ? bookedSeats : 1);

    const currentStatus = STATUS_CONFIG[status] ?? STATUS_CONFIG.completed;

    return (
        <TouchableOpacity
            onPress={() => onPress(id)}
            activeOpacity={0.9}
            style={styles.cardContainer}
        // 提示：此处不记录日志，由父层 TripsPage 的回调处理函数记录并消费 requestId
        >
            {/* 卡片头部：状态与时间 */}
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Badge style={[styles.roleBadge, { backgroundColor: currentStatus.bgColor, marginRight: 8 }]}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: currentStatus.textColor }}>
                            {currentStatus.label}
                        </Text>
                    </Badge>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{ROLE_LABELS[role] ?? "未知"}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {ride?.date ?? ""} {ride?.time ?? ""}
                </Text>
            </View>

            <View style={{ padding: 16 }}>
                {/* 个人信息栏 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar style={{ height: 40, width: 40, marginRight: 12 }}>
                        <AvatarImage source={ride?.driver?.avatar ? { uri: ride.driver.avatar } : undefined} />
                        <AvatarFallback>
                            <Text>{ride?.driver?.name?.charAt(0) ?? "?"}</Text>
                        </AvatarFallback>
                    </Avatar>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.textMain }}>
                            {role === "driver" ? "我是司机" : (ride?.driver?.name ?? "匿名用户")}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                            {ride?.driver?.car ?? "未知车型"} · {ride?.driver?.carPlate ?? "未备案"}
                        </Text>
                    </View>
                    {status === "completed" && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.textSub, marginLeft: 4 }}>
                                {ride?.driver?.rating ?? "5.0"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 路线展示区 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View style={styles.routeLineContainer}>
                        <Navigation size={12} color={COLORS.primary} />
                        <View style={styles.routeLine} />
                        <MapPin size={12} color={COLORS.secondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, color: COLORS.textSub, fontWeight: '500', marginBottom: 24 }} numberOfLines={1}>
                            {ride?.from ?? "未知起点"}
                        </Text>
                        <Text style={{ fontSize: 14, color: COLORS.textSub, fontWeight: '500' }} numberOfLines={1}>
                            {ride?.to ?? "未知终点"}
                        </Text>
                    </View>
                </View>

                <Separator style={{ marginVertical: 8 }} />

                {/* 统计信息与价格 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                        <Clock size={12} color={COLORS.textMuted} />
                        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 4 }}>
                            {ride?.duration ?? "--"}
                        </Text>
                    </View>
                    {role === "passenger" && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Users size={12} color={COLORS.textMuted} />
                            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 4 }}>
                                {bookedSeats}座
                            </Text>
                        </View>
                    )}
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.priceText}>¥{finalPrice}</Text>
                    </View>
                    <ChevronRight size={16} color={COLORS.textPlaceholder} style={{ marginLeft: 4 }} />
                </View>
            </View>

            {/* 待出发状态的操作按钮 */}
            {status === "upcoming" && (
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.footerBtn, styles.footerBtnBorder]}
                        onPress={() => onContact(id, role)}
                    >
                        <Text style={{ fontSize: 14, color: COLORS.textSub }}>
                            联系{role === "driver" ? "乘客" : "司机"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.footerBtn}
                        onPress={() => onCancel(id)}
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