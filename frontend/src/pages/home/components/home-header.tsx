/**
 * @file home-header.tsx
 * @description 首页顶部头部组件
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { Bell, Navigation, MapPin, Calendar } from "lucide-react-native";
import { Card } from "@/../components/card";
import { Button } from "@/../components/button";
import { UserInfo } from "@/api/home-api";
import logger from '@/utils/logger';
import styles from "../home.style";
import { COLORS } from "@/pages/style";

/**
 * 首页头部组件属性接口
 */
interface HomeHeaderProps {
    /** 显式注入业务流唯一请求 ID (必须由 Page 层下发) */
    requestId: string;
    /** 用户信息对象 */
    userInfo: UserInfo | null;
    /** 出发地文本值 */
    fromLocation: string;
    /** 目的地文本值 */
    toLocation: string;
    /** 已选日期展示文本 */
    selectedDate: string;
    /** 是否有未读通知 */
    hasUnread: boolean;
    /** 设置出发地的回调 */
    onSetFrom: (val: string) => void;
    /** 设置目的地的回调 */
    onSetTo: (val: string) => void;
    /** 触发搜索的回调 */
    onSearch: () => void;
    /** 跳转至个人资料页的回调 */
    onNavigateToProfile: () => void;
    /** 跳转至通知中心的回调 */
    onNavigateToNotifications: () => void;
}

const DEFAULT_AVATAR = 'https://via.placeholder.com/40';

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    requestId,
    userInfo,
    fromLocation,
    toLocation,
    selectedDate,
    hasUnread,
    onSetFrom,
    onSetTo,
    onSearch,
    onNavigateToProfile,
    onNavigateToNotifications,
}) => {

    /**
     * 处理个人资料点击日志上报
     * 修正：严禁在日志 params 中直接打印用户姓名等敏感隐私
     */
    const handleProfilePress = () => {
        logger.info({
            module: 'HomeHeader',
            operate: 'click_profile_avatar',
            params: { hasAvatar: !!userInfo?.avatar }, // 仅记录脱敏状态
            result: 'navigating_to_profile',
            error: undefined,
            errorType: undefined,
            requestId: requestId // 显式使用从 Props 注入的 ID
        });
        onNavigateToProfile();
    };

    /**
     * 处理通知中心点击日志上报
     */
    const handleNotificationPress = () => {
        logger.info({
            module: 'HomeHeader',
            operate: 'click_notification_bell',
            params: { hasUnread },
            result: 'navigating_to_notifications',
            error: undefined,
            errorType: undefined,
            requestId: requestId
        });
        onNavigateToNotifications();
    };

    /**
     * 处理搜索动作日志上报
     */
    const handleSearchPress = () => {
        logger.info({
            module: 'HomeHeader',
            operate: 'click_search_button',
            params: {
                hasFrom: !!fromLocation,
                hasTo: !!toLocation,
                dateSet: !!selectedDate
            },
            result: 'executing_search_callback',
            error: undefined,
            errorType: undefined,
            requestId: requestId
        });
        // 将链路 ID 传递给回调，确保后续 API 调用能继承此链路
        onSearch();
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerTopRow}>
                <View style={styles.userProfile}>
                    <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
                        <Image
                            source={{ uri: userInfo?.avatar || DEFAULT_AVATAR }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.welcomeText}>早上好 👋</Text>
                        <Text style={styles.userName}>{userInfo?.name || '加载中...'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={handleNotificationPress}
                    accessibilityLabel="通知中心"
                >
                    <Bell size={18} color={COLORS.white} />
                    {hasUnread && <View style={styles.notificationDot} />}
                </TouchableOpacity>
            </View>

            <Card style={styles.searchCard}>
                <Text style={styles.searchCardTitle}>您要去哪里？</Text>

                {/* 输入组：出发地 */}
                <View style={styles.inputGroup}>
                    <View style={styles.iconWrapperGreen}>
                        <Navigation size={14} color={COLORS.primary} />
                    </View>
                    <TextInput
                        placeholder="出发地"
                        value={fromLocation}
                        onChangeText={onSetFrom}
                        style={styles.textInput}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                {/* 输入组：目的地 */}
                <View style={[styles.inputGroup, styles.borderBottomNone]}>
                    <View style={styles.iconWrapperOrange}>
                        <MapPin size={14} color={COLORS.secondary} />
                    </View>
                    <TextInput
                        placeholder="目的地"
                        value={toLocation}
                        onChangeText={onSetTo}
                        style={styles.textInput}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                {/* 搜索操作区 */}
                <View style={styles.searchActionRow}>
                    <TouchableOpacity activeOpacity={0.7} style={styles.dateSelector}>
                        <Calendar size={14} color={COLORS.textMuted} />
                        <Text style={styles.dateText}>{selectedDate}</Text>
                    </TouchableOpacity>
                    <Button onPress={handleSearchPress} style={styles.searchButton}>
                        <Text style={styles.searchButtonText}>搜索</Text>
                    </Button>
                </View>
            </Card>
        </View>
    );
};

export default HomeHeader;