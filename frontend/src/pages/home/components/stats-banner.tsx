/**
 * @file stats-banner.tsx
 * @description 首页数据统计横幅组件，负责展示今日行程、注册用户数及好评率。
 */

import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useEnvStore } from '@/store/env-store';
import { HomeStats } from '@/api/home-api';
import logger from '@/utils/logger';
import styles from "../home.style";

/**
 * 统计横幅组件属性接口
 */
interface StatsBannerProps {
    /** * 统计数据对象 
     * @type {HomeStats | null}
     */
    stats: HomeStats | null;
}

/**
 * 首页数据统计横幅组件
 * @param {StatsBannerProps} props - 组件属性
 */
export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
    // 全局取值：RequestId 消费逻辑
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 格式化注册用户显示文本
     * @param {number | undefined} count - 原始用户数
     * @returns {string} 格式化后的字符串 (单位：万)
     */
    const formatUsersDisplay = (count?: number): string => {
        if (!count) return '0.0万';
        try {
            return `${(count / 10000).toFixed(1)}万`;
        } catch (error) {
            return '0.0万';
        }
    };

    /**
     * 格式化行程数显示
     * @param {number | undefined} count - 原始行程数
     * @returns {string} 千分位格式化字符串
     */
    const formatRidesCount = (count?: number): string => {
        return count?.toLocaleString() || '--';
    };

    // 链路追踪：组件渲染与数据状态记录
    useEffect(() => {
        logger.info({
            module: 'StatsBanner',
            operate: 'component_render',
            params: { hasData: !!stats },
            result: stats ? 'data_displayed' : 'placeholder_displayed',
            error: undefined,
            errorType: undefined,
            requestId
        });
    }, [stats, requestId]);

    const ridesCount = formatRidesCount(stats?.todayRidesCount);
    const usersDisplay = formatUsersDisplay(stats?.totalUsers);
    const positiveRate = stats?.positiveRate ? `${stats.positiveRate}%` : '--%';

    return (
        <View style={styles.statsBanner}>
            <View style={styles.statsRow}>
                {/* 今日行程统计 */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{ridesCount}</Text>
                    <Text style={styles.statLabel}>今日行程</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* 注册用户统计 */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{usersDisplay}</Text>
                    <Text style={styles.statLabel}>注册用户</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* 用户好评率统计 */}
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{positiveRate}</Text>
                    <Text style={styles.statLabel}>好评率</Text>
                </View>
            </View>
        </View>
    );
};