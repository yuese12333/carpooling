/**
 * @file my-vehicles.tsx
 * @description 车辆管理主页面，集成高性能滚动与安全区适配
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
} from "react-native";
// 统一使用 react-native-safe-area-context
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ChevronLeft,
    Plus,
    MoreVertical,
    ShieldCheck,
    Users,
    Palette,
    Info,
    CheckCircle2
} from "lucide-react-native";

import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Separator } from "@/components/separator";

import styles, { COLORS } from "./my-vehicles.style";
import { useMyVehiclesForm } from "@/hooks/use-my-vehicles-form";
import { generateRequestId } from '@/utils/logger';

export default function MyVehiclesPage() {
    // 【核心规约】自生成机制：页面级 requestId 在生命周期内保持唯一且稳定
    const requestId = useMemo(() => generateRequestId(), []);
    const {
        vehicles,
        handleBack,
        handleAddVehicle,
        handleEdit,
        handleViewVerification
    } = useMyVehiclesForm(requestId);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 导航栏 */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>我的车辆</Text>
                <TouchableOpacity onPress={handleAddVehicle} style={styles.navButton}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                // 【规范修复】防止键盘弹出时吞掉点击事件
                keyboardShouldPersistTaps="handled"
            >
                {vehicles.map((vehicle) => (
                    <View key={vehicle.id} style={styles.vehicleWrapper}>
                        <Card style={styles.vehicleCard}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: vehicle.image }} style={styles.carImage} />
                                {vehicle.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>当前使用</Text>
                                    </View>
                                )}
                                <View style={styles.statusBadgeOverlay}>
                                    <Badge variant="secondary" style={styles.statusBadge}>
                                        <ShieldCheck size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                                        <Text style={styles.statusText}>官方已认证</Text>
                                    </Badge>
                                </View>
                            </View>

                            <View style={styles.infoSection}>
                                <View style={styles.titleRow}>
                                    <View>
                                        <Text style={styles.brandText}>{vehicle.brand} {vehicle.model}</Text>
                                        <Text style={styles.plateText}>{vehicle.plate}</Text>
                                    </View>
                                    {/* 显式操作记录 */}
                                    <TouchableOpacity onPress={() => handleEdit(vehicle.id)}>
                                        <MoreVertical size={20} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tagGroup}>
                                    {vehicle.tags.map((tag, idx) => (
                                        <View key={idx} style={styles.tagItem}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>

                                <Separator style={styles.separator} />

                                <View style={styles.detailGrid}>
                                    <View style={styles.detailItem}>
                                        <View style={styles.iconCircle}>
                                            <Users size={16} color={COLORS.secondary} />
                                        </View>
                                        <View>
                                            <Text style={styles.detailLabel}>座位数</Text>
                                            <Text style={styles.detailValue}>{vehicle.seats} 座</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailItem}>
                                        <View style={[styles.iconCircle, styles.iconCircleDanger]}>
                                            <Palette size={16} color={COLORS.danger} />
                                        </View>
                                        <View>
                                            <Text style={styles.detailLabel}>颜色</Text>
                                            <Text style={styles.detailValue}>{vehicle.color}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <Button
                                        style={[styles.baseBtn, styles.detailBtn]}
                                        onPress={handleViewVerification}
                                    >
                                        <Info size={16} style={{ marginRight: 8 }} color={COLORS.textPrimary} />
                                        <Text style={styles.btnTextPrimary}>认证详情</Text>
                                    </Button>

                                    <Button
                                        style={[styles.baseBtn, styles.modifyBtn]}
                                        onPress={() => handleEdit(vehicle.id)}
                                    >
                                        <CheckCircle2 size={16} style={{ marginRight: 8 }} color={COLORS.white} />
                                        <Text style={styles.btnTextWhite}>修改信息</Text>
                                    </Button>
                                </View>
                            </View>
                        </Card>
                    </View>
                ))}

                <View style={styles.tipSection}>
                    <Text style={styles.tipTitle}>为什么需要车辆认证？</Text>
                    <Text style={styles.tipDesc}>
                        通过认证的车辆将获得更高的推荐权重，同时能显著提升乘客的信任感。
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}