/**
 * @file use-profile-page.ts
 * @description 封装个人中心页面的业务逻辑。集成全链路日志追踪、环境感知及数据脱敏处理。
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { useAuth } from "../store/auth-context";
import { profileApi, type BadgeItem } from "../api/profile-api";
import { getPaymentMethods } from "@/api/payment-methods-api";
import { useEnvStore } from "@/store/env-store";
import { currentUser } from "../store/mock-data";
import { ROUTES } from '../router/paths';
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';
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
    const isMockMode = useEnvStore((state) => state.isMockMode);

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
        vehicleId?: string;
        brand?: string;
        color?: string;
        carPlate?: string;
    } | undefined>(() => {
        if (useEnvStore.getState().isMockMode) {
            return {
                vehicleId: 'v1',
                brand: currentUser.car,
                color: currentUser.carColor,
                carPlate: currentUser.carPlate,
            };
        }
        return undefined;
    });

    const [paymentMethodSub, setPaymentMethodSub] = useState<string>(
        () => (useEnvStore.getState().isMockMode ? '微信支付 已绑定' : '管理支付方式')
    );

    const [badges, setBadges] = useState<BadgeItem[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [realSavings, setRealSavings] = useState<number | undefined>(undefined);

    const menuData = useMemo(() => {
        const carSub = carData?.brand
            ? `${carData.brand}${carData.color ? ` ${carData.color}` : ''}`
            : '未绑定车辆';

        return getMenuData({
            verified: !!profileData?.verified,
            carSub,
            paymentSub: paymentMethodSub,
        });
    }, [profileData?.verified, carData, paymentMethodSub]);

    const fetchData = useCallback(async () => {
        if (useEnvStore.getState().isMockMode) {
            return;
        }

        setLoading(true);
        logger.info({
            module: 'use-profile-page',
            operate: 'fetch-profile-data-start',
            requestId,
        });

        try {
            const [infoRes, carRes, badgeRes, paymentRes] = await Promise.all([
                profileApi.getInfo(requestId),
                profileApi.getCar(requestId),
                profileApi.getBadges(requestId),
                getPaymentMethods(requestId),
            ]);

            if (isApiSuccess(infoRes)) {
                const d = infoRes.data;
                setProfileData({
                    name: d.name,
                    phone: maskPhoneNumber(d.phone),
                    avatar: d.avatar,
                    memberSince: d.memberSince,
                    verified: d.isVerified,
                    trips: d.trips,
                    rating: d.rating,
                });
                setRealSavings(d.accumulatedSavings);
            }

            if (isApiSuccess(carRes)) {
                const c = carRes.data;
                setCarData({
                    vehicleId: c.vehicleId,
                    brand: c.brand,
                    color: c.color,
                    carPlate: c.carPlate,
                });
            }

            if (isApiSuccess(badgeRes)) {
                setBadges(badgeRes.data.list);
            }

            if (isApiSuccess(paymentRes) && paymentRes.data?.length) {
                const defaultMethod = paymentRes.data.find((m) => m.isDefault) ?? paymentRes.data[0];
                setPaymentMethodSub(
                    defaultMethod.sub
                        ? `${defaultMethod.name} ${defaultMethod.sub}`
                        : defaultMethod.name
                );
            }
        } catch (error) {
            logger.error({
                module: 'use-profile-page',
                operate: 'fetch-profile-data-error',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_AGGREGATION_ERROR',
                requestId,
            });
            Alert.alert("同步失败", "无法连接到服务器");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchData();
    }, [fetchData, isMockMode]);

    const displaySavings = useMemo(() => {
        if (!useEnvStore.getState().isMockMode && realSavings !== undefined) {
            return realSavings;
        }
        const trips = profileData?.trips ?? 0;
        return trips * 22;
    }, [profileData?.trips, realSavings, isMockMode]);

    const handleMenuClick = useCallback(async (item: IMenuItem) => {
        logger.info({
            module: 'use-profile-page',
            operate: 'menu-click',
            params: { label: item.label },
            requestId,
        });

        try {
            if (item.label === "退出登录") {
                const logoutRes = await profileApi.logout(requestId);
                if (!isApiSuccess(logoutRes)) {
                    Alert.alert("退出失败", logoutRes.message || "请稍后重试");
                    return;
                }
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
                requestId,
            });
            Alert.alert("操作失败", "系统响应异常");
        }
    }, [logout, router, requestId]);

    const handleEditAvatar = useCallback(() => {
        logger.info({ module: 'use-profile-page', operate: 'edit-avatar-trigger', requestId });
        Alert.alert("提示", "头像上传功能开发中");
    }, [requestId]);

    const handleEditCar = useCallback(() => {
        logger.info({
            module: 'use-profile-page',
            operate: 'edit-car-trigger',
            params: { vehicleId: carData?.vehicleId ?? 'v1' },
            requestId,
        });

        router.push({
            pathname: ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION,
            params: { id: carData?.vehicleId ?? 'v1' },
        });
    }, [router, requestId, carData?.vehicleId]);

    return {
        profileData,
        carData,
        badges,
        displaySavings,
        loading,
        menuData,
        handleMenuClick,
        handleEditAvatar,
        handleEditCar,
    };
};
