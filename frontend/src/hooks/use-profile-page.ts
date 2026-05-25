/**
 * @file use-profile-page.ts
 * @description 封装个人中心页面的业务逻辑。集成全链路日志追踪、环境感知及数据脱敏处理。
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { useAuth } from "../store/auth-context";
import { profileApi, type BadgeItem } from "../api/profile-api";
import { useEnvStore } from "@/store/env-store";
import { currentUser } from "../store/mock-data";
import { ROUTES } from '../router/paths';
import logger from '@/utils/logger';
import { getMenuData, type IMenuItem } from "@/pages/profile/profile/profile-config";
import type { IProfileState } from "@/pages/profile/profile/profile-types";

const maskPhoneNumber = (phone?: string): string => {
    if (!phone) return '未绑定';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 个人中心业务逻辑 Hook
 * @param requestId 必须由页面入口显式注入的唯一链路追踪 ID
 */
export const useProfilePage = (requestId: string) => {
    const router = useRouter();
    const { logout } = useAuth();

    const [profileData, setProfileData] = useState<IProfileState | undefined>(() => {
        if (useEnvStore.getState().isMockMode) {
            return {
                name: currentUser.name,
                phone: maskPhoneNumber(currentUser.phone),
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

    const [badges, setBadges] = useState<BadgeItem[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [realSavings, setRealSavings] = useState<number | undefined>(undefined);

    const menuData = useMemo(() => {
        const isVerified = !!profileData?.verified;
        logger.info({
            module: 'use-profile-page',
            operate: 'compute-dynamic-menu',
            params: { isVerified },
            result: 'success',
            requestId
        });
        return getMenuData(isVerified);
    }, [profileData?.verified, requestId]);

    const fetchData = useCallback(async () => {
        const currentMockMode = useEnvStore.getState().isMockMode;
        if (currentMockMode) return;

        setLoading(true);
        logger.info({
            module: 'use-profile-page',
            operate: 'fetch-profile-data-start',
            params: { isMockMode: currentMockMode },
            requestId
        });

        try {
            const [infoRes, carRes, badgeRes] = await Promise.all([
                profileApi.getInfo(requestId),
                profileApi.getCar(requestId),
                profileApi.getBadges(requestId)
            ]);

            if (infoRes.code === 200) {
                const d = infoRes.data;
                setProfileData({
                    name: d.name,
                    phone: maskPhoneNumber(d.phone),
                    avatar: d.avatar,
                    memberSince: d.memberSince,
                    verified: d.isVerified,
                    trips: d.trips,
                    rating: d.rating
                });
                setRealSavings(d.accumulatedSavings);
            }

            if (carRes.code === 200) {
                const c = carRes.data;
                setCarData({ brand: c.brand, color: c.color, carPlate: c.carPlate });
            }

            if (badgeRes.code === 200) {
                setBadges(badgeRes.data.list);
            }
        } catch (error) {
            logger.error({
                module: 'use-profile-page',
                operate: 'fetch-profile-data-error',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_AGGREGATION_ERROR',
                requestId
            });
            Alert.alert("同步失败", "无法连接到服务器");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const displaySavings = useMemo(() => {
        const currentMockMode = useEnvStore.getState().isMockMode;
        if (!currentMockMode && realSavings !== undefined) {
            return realSavings;
        }
        const trips = profileData?.trips ?? 0;
        const SAVINGS_PER_TRIP = 22;
        return trips * SAVINGS_PER_TRIP;
    }, [profileData?.trips, realSavings]);

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
        logger.info({
            module: 'use-profile-page',
            operate: 'edit-car-trigger',
            requestId
        });

        try {
            router.push(ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION);
        } catch (error) {
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
