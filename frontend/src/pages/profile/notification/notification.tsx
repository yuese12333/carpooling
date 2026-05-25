/**
 * @file notification.tsx
 * @description 消息通知页面，支持分类切换、消息读取与一键清理，集成链路追踪日志
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    Bell,
    CheckCircle2,
    Info,
    ChevronRight,
    MapPin,
    Trash2
} from "lucide-react-native";

// 导入工具与日志记录
import { generateRequestId } from '@/utils/logger';

// 导入项目全局布局逻辑
import { LAYOUT_MIXINS, commonStyles } from "@/pages/style";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";

// 核心重构：导入样式、API 类型与自定义 Hook
import styles, { COLORS } from "./notification.style";
import { NotificationItem } from "@/api/notification-api";
import { useNotification } from "@/hooks/use-notification-form";

/**
 * 根据消息类型获取图标配置
 * @param type 消息类型
 */
const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
        case 'success': return { icon: <CheckCircle2 size={18} color={COLORS.primary} />, bg: COLORS.primaryLight };
        case 'location': return { icon: <MapPin size={18} color={COLORS.info} />, bg: COLORS.bgBlueLight };
        case 'warning': return { icon: <Info size={18} color={COLORS.secondary} />, bg: COLORS.bgOrangeLight };
        default: return { icon: <Bell size={18} color={COLORS.textPlaceholder} />, bg: COLORS.bgGrayLight };
    }
};

export default function NotificationPage() {
    const router = useRouter();

    // --- 链路追踪重构 ---
    // 在页面生命周期内生成唯一且稳定的 requestId
    const requestId = useMemo(() => generateRequestId(), []);

    // --- 逻辑层注入 ---
    // 将 requestId 显式传递给 Hook，严禁 Hook 内部隐式获取
    const {
        activeTab,
        notifications,
        loading,
        handleTabChange,
        handleClear
    } = useNotification(requestId);

    /**
     * 渲染单条通知卡片
     * @param info FlatList 渲染对象
     */
    const renderItem = ({ item }: { item: NotificationItem }) => {
        const { icon, bg } = getIconConfig(item.type);
        return (
            <TouchableOpacity
                style={styles.notificationCard}
                activeOpacity={0.7}
                accessibilityRole="button"
            >
                <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
                    {icon}
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <View style={styles.contentMain}>
                    <View style={LAYOUT_MIXINS.rowBetween}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.notifContent} numberOfLines={2}>{item.content}</Text>
                </View>
                <ChevronRight size={16} color={COLORS.textPlaceholder} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={commonStyles.safeAreaContainer} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* 导航栏 */}
            <View style={LAYOUT_MIXINS.navbar}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={LAYOUT_MIXINS.hitSlop}
                    accessibilityLabel="返回"
                >
                    <ChevronLeft color={COLORS.textMain} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>消息通知</Text>
                <TouchableOpacity
                    onPress={handleClear}
                    style={LAYOUT_MIXINS.hitSlop}
                    accessibilityLabel="清空通知"
                >
                    <Trash2 color={COLORS.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            {/* 分段器 */}
            <View style={styles.tabsWrapper}>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="bg-transparent">
                        {['all', 'trip', 'system'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className={activeTab === tab ? `text-[${COLORS.tabActive}] border-b-2 border-emerald-600` : ''}
                            >
                                {tab === 'all' ? '全部' : tab === 'trip' ? '行程' : '系统'}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </View>

            {/* 列表内容区 */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    // 修复：防止键盘弹出时点击被吞
                    keyboardShouldPersistTaps="handled"
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bell size={48} color={COLORS.textPlaceholder} />
                            <Text style={styles.emptyText}>暂无相关消息</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}