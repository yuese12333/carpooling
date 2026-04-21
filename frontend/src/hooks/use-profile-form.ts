/**
 * @file use-profile-form.ts
 * @description 封装个人中心页面的业务逻辑，实现逻辑与 UI 分离，集成全链路日志追踪。
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { useAuth } from "../store/auth-context";
import { profileApi } from "../api/profile-api";
import { useEnvStore } from "@/store/env-store";
import { currentUser } from "../store/mock-data";
import { ROUTES } from '../router/paths';
import logger from '@/utils/logger';

/**
 * 菜单项接口定义
 */
interface IMenuItem {
    label: string;
    path?: Href;
}

/**
 * 勋章项接口定义
 */
export interface IBadgeItem {
    emoji: string;
    label: string;
    unlocked: boolean;
}

/**
 * 个人中心业务逻辑 Hook
 * @param {string} requestId - 必须由页面入口（业务流起点）显式注入的唯一链路追踪 ID
 * @returns {object} 包含页面状态、计算属性及事件处理函数
 */
export const useProfilePage = (requestId: string) => {
    const router = useRouter();
    const { logout } = useAuth();
    const isMockMode = useEnvStore((state) => state.isMockMode);

    // --- 状态管理 ---
    const [profileData, setProfileData] = useState(currentUser);
    const [carData, setCarData] = useState({
        brand: currentUser.car,
        color: currentUser.carColor,
        carPlate: currentUser.carPlate
    });
    const [badges, setBadges] = useState<IBadgeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [realSavings, setRealSavings] = useState<number | undefined>(undefined);

    /**
     * 执行聚合数据加载
     * 职责：负责业务起点日志记录与 API 链路透传
     */
    const fetchData = useCallback(async () => {
        if (isMockMode) return;

        setLoading(true);
        logger.info({
            module: 'use-profile-page',
            operate: 'fetch-profile-data-start',
            params: { isMockMode },
            requestId
        });

        try {
            // 显式透传 requestId 至 API 原子层
            const [infoRes, carRes, badgeRes] = await Promise.all([
                profileApi.getInfo(requestId),
                profileApi.getCar(requestId),
                profileApi.getBadges(requestId)
            ]);

            // 处理个人基础信息
            if (infoRes.code === 200) {
                const d = infoRes.data;
                setProfileData(prev => ({
                    ...prev,
                    name: d.name,
                    phone: d.phone,
                    avatar: d.avatar,
                    memberSince: d.memberSince,
                    verified: d.isVerified,
                    trips: d.trips,
                    rating: d.rating
                }));
                setRealSavings(d.accumulatedSavings);
            }

            // 处理车辆信息
            if (carRes.code === 200) {
                const c = carRes.data;
                setCarData({ brand: c.brand, color: c.color, carPlate: c.carPlate });
            }

            // 处理勋章信息
            if (badgeRes.code === 200) {
                setBadges(badgeRes.data.list);
            }
        } catch (error) {
            logger.error({
                module: 'use-profile-page',
                operate: 'fetch-profile-data-error',
                params: undefined,
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_AGGREGATION_ERROR',
                requestId
            });
            Alert.alert("同步失败", "无法连接到服务器，显示本地缓存数据");
        } finally {
            setLoading(false);
        }
    }, [isMockMode, requestId]);

    /**
     * 生命周期初始化
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * 计算累计节省金额
     * 仅包含纯逻辑计算，严禁包含日志记录
     */
    const displaySavings = useMemo(() => {
        if (!isMockMode && realSavings !== undefined) return realSavings;
        const SAVINGS_PER_TRIP = 22;
        return profileData.trips * SAVINGS_PER_TRIP;
    }, [profileData.trips, realSavings, isMockMode]);

    /**
     * 菜单点击跳转逻辑处理
     * @param {IMenuItem} item 点击的菜单项对象
     */
    const handleMenuClick = useCallback(async (item: IMenuItem) => {
        logger.info({
            module: 'use-profile-page',
            operate: 'menu-click',
            params: { label: item.label },
            requestId
        });

        try {
            if (item.label === "退出登录") {
                // 退出登录 API 也需链路追踪
                await profileApi.logout(requestId);
                await logout();
                router.replace(ROUTES.AUTH.LOGIN as Href);
            } else if (item.path) {
                router.push(item.path);
            } else {
                Alert.alert("提示", `${item.label} 路径未配置`);
            }
        } catch (error) {
            logger.error({
                module: 'use-profile-page',
                operate: 'handle-menu-click-error',
                params: { label: item.label },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NAVIGATION_OR_AUTH_ERROR',
                requestId
            });
            Alert.alert("操作失败", "系统响应异常，请稍后重试");
        }
    }, [logout, router, requestId]);

    /**
     * 编辑头像处理入口
     */
    const handleEditAvatar = useCallback(() => {
        logger.info({
            module: 'use-profile-page',
            operate: 'edit-avatar-trigger',
            params: undefined,
            requestId
        });
    }, [requestId]);

    /**
     * 编辑车辆信息处理入口
     */
    const handleEditCar = useCallback(() => {
        logger.info({
            module: 'use-profile-page',
            operate: 'edit-car-trigger',
            params: undefined,
            requestId
        });
        Alert.alert("提示", "编辑车辆信息功能开发中");
    }, [requestId]);

    return {
        profileData,
        carData,
        badges: badges.length > 0 ? badges : undefined,
        displaySavings,
        loading,
        handleMenuClick,
        handleEditAvatar,
        handleEditCar
    };
};