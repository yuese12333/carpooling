/**
 * @file use-profile-page.ts
 * @description 封装个人中心页面的业务逻辑。集成全链路日志追踪、环境感知及数据脱敏处理。
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
import { getMenuData } from "@/pages/profile/profile/profile-config";

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
 * 个人中心基础信息状态定义（已脱敏）
 */
interface IProfileState {
    name: string;
    phone: string; // 脱敏后的手机号
    avatar: string;
    memberSince: string;
    verified: boolean;
    trips: number;
    rating: number;
}

/**
 * 内部脱敏工具函数
 * @param {string} phone - 原始手机号
 * @returns {string} 脱敏后的手机号（例：138****8888）
 */
const maskPhoneNumber = (phone?: string): string => {
    if (!phone) return '未绑定';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 个人中心业务逻辑 Hook
 * @param {string} requestId - 必须由页面入口显式注入的唯一链路追踪 ID
 * @returns 包含页面状态、计算属性及事件处理函数
 */
export const useProfilePage = (requestId: string) => {
    const router = useRouter();
    const { logout } = useAuth();

    // 响应式环境监测
    const isMockMode = useEnvStore((state) => state.isMockMode);

    // --- 状态管理 ---

    // 初始化逻辑：若是 Mock 模式，加载并处理 Mock 数据；否则保持 undefined 待请求
    const [profileData, setProfileData] = useState<IProfileState | undefined>(() => {
        if (useEnvStore.getState().isMockMode) {
            return {
                name: currentUser.name,
                phone: maskPhoneNumber(currentUser.phone), // Mock 模式下的脱敏处理
                avatar: currentUser.avatar,
                memberSince: currentUser.memberSince || '2024-01-01',
                verified: currentUser.verified ?? false,
                trips: currentUser.trips,
                rating: currentUser.rating,
            };
        }
        return undefined;
    });

    const [carData, setCarData] = useState<{
        brand?: string;
        color?: string;
        carPlate?: string;
    } | undefined>(() => {
        if (useEnvStore.getState().isMockMode) {
            return {
                brand: currentUser.car,
                color: currentUser.carColor,
                carPlate: currentUser.carPlate
            };
        }
        return undefined;
    });

    const [badges, setBadges] = useState<IBadgeItem[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [realSavings, setRealSavings] = useState<number | undefined>(undefined);


    /**
     * 动态计算菜单配置
     */
    const menuData = useMemo(() => {
        const isVerified = !!profileData?.verified;

        // 记录状态映射日志
        logger.info({
            module: 'use-profile-page',
            operate: 'compute-dynamic-menu',
            params: { isVerified },
            result: 'success',
            requestId
        });

        return getMenuData(isVerified);
    }, [profileData?.verified, requestId]);

    /**
     * 执行聚合数据加载
     */
    const fetchData = useCallback(async () => {
        const currentMockMode = useEnvStore.getState().isMockMode;
        if (currentMockMode) return;

        setLoading(true);
        logger.info({
            module: 'use-profile-page',
            operate: 'fetch-profile-data-start',
            params: { requestId, isMockMode: currentMockMode },
            requestId
        });

        try {
            const [infoRes, carRes, badgeRes] = await Promise.all([
                profileApi.getInfo(requestId),
                profileApi.getCar(requestId),
                profileApi.getBadges(requestId)
            ]);

            // 处理个人基础信息并执行脱敏 (8.1)
            if (infoRes.code === 200) {
                const d = infoRes.data;
                setProfileData({
                    name: d.name,
                    phone: maskPhoneNumber(d.phone), // 生产数据脱敏处理
                    avatar: d.avatar,
                    memberSince: d.memberSince,
                    verified: d.isVerified,
                    trips: d.trips,
                    rating: d.rating
                });
                setRealSavings(d.accumulatedSavings);
            }

            // 处理车辆信息 (8.3)
            if (carRes.code === 200) {
                const c = carRes.data;
                setCarData({ brand: c.brand, color: c.color, carPlate: c.carPlate });
            }

            // 处理勋章信息 (8.5)
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
            Alert.alert("同步失败", "无法连接到服务器");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    /**
     * 生命周期初始化
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * 计算累计节省金额
     */
    const displaySavings = useMemo(() => {
        const currentMockMode = useEnvStore.getState().isMockMode;
        if (!currentMockMode && realSavings !== undefined) {
            return realSavings;
        }
        const trips = profileData?.trips ?? 0;
        const SAVINGS_PER_TRIP = 22;
        return trips * SAVINGS_PER_TRIP;
    }, [profileData?.trips, realSavings]);

    /**
     * 菜单点击处理
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
                await profileApi.logout(requestId);
                await logout();
                router.replace(ROUTES.AUTH.LOGIN as Href);
            } else if (item.path) {
                router.push(item.path);
            }
        } catch (error) {
            logger.error({
                module: 'use-profile-page',
                operate: 'handle-menu-click-error',
                params: { label: item.label },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NAVIGATION_OR_AUTH_ERROR',
                requestId
            });
            Alert.alert("操作失败", "系统响应异常");
        }
    }, [logout, router, requestId]);

    const handleEditAvatar = useCallback(() => {
        logger.info({ module: 'use-profile-page', operate: 'edit-avatar-trigger', requestId });
    }, [requestId]);

    const handleEditCar = useCallback(() => {
        // 记录触发编辑的日志
        logger.info({
            module: 'use-profile-page',
            operate: 'edit-car-trigger',
            requestId
        });

        try {
            // 跳转到修改车辆信息页面
            router.push(ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION);
        } catch (error) {
            // 捕获可能的导航错误并记录
            logger.error({
                module: 'use-profile-page',
                operate: 'handle-edit-car-error',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NAVIGATION_ERROR',
                requestId
            });
            Alert.alert("操作失败", "无法跳转到车辆编辑页面");
        }
    }, [router, requestId]);

    return {
        profileData,
        carData,
        badges,
        displaySavings,
        loading,
        menuData,
        handleMenuClick,
        handleEditAvatar,
        handleEditCar
    };
};