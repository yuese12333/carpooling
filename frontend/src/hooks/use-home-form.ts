/**
 * @file use-home-form.ts
 * @description 首页业务逻辑 Hook，处理数据加载、状态管理及导航跳转。
 */

import { useState, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import * as Location from 'expo-location';
import { useEnvStore } from '@/store/env-store';
import { HomeService, UserInfo, RideItem, HomeStats } from '@/api/home-api';
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';

/**
 * 首页业务逻辑自定义 Hook
 * @param {string} requestId - 必须显式注入的链路追踪 ID
 * @returns {Object} 包含状态、计算属性与操作方法
 */
export const useHomeForm = (requestId: string) => {
    const router = useRouter();

    // --- 状态管理 ---
    const [fromLocation, setFromLocation] = useState<string>("");
    const [toLocation, setToLocation] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("今天");

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [rides, setRides] = useState<RideItem[]>([]);
    const [stats, setStats] = useState<HomeStats | null>(null);
    const [hasUnread, setHasUnread] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { isMockMode, toggleMockMode } = useEnvStore();

    // --- 副作用：数据抓取 ---
    useEffect(() => {
        /**
         * 异步初始化首页数据
         */
        const fetchHomeData = async () => {
            let locationParams = { latitude: 24.14, longitude: 120.67 };

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    locationParams = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                    logger.info({
                        module: 'useHomeForm',
                        operate: 'getLocation_Success',
                        params: locationParams,
                        result: 'Device location obtained',
                        requestId
                    });
                } else {
                    logger.warn({
                        module: 'useHomeForm',
                        operate: 'getLocation_PermissionDenied',
                        params: { status },
                        result: 'Using default location',
                        requestId
                    });
                }
            } catch (locError) {
                logger.warn({
                    module: 'useHomeForm',
                    operate: 'getLocation_Error',
                    params: undefined,
                    result: 'Using default location',
                    error: locError instanceof Error ? locError.message : String(locError),
                    requestId
                });
            }

            try {
                setIsLoading(true);

                // 记录请求起点，显式消费参数注入的 requestId
                logger.info({
                    module: 'useHomeForm',
                    operate: 'fetchHomeData_Start',
                    params: locationParams,
                    result: undefined,
                    error: undefined,
                    errorType: undefined,
                    requestId
                });

                const [uRes, rRes, sRes, nRes] = await Promise.all([
                    HomeService.getUserInfo(requestId),
                    HomeService.getRecommendRides(locationParams.latitude, locationParams.longitude, requestId),
                    HomeService.getStatistics(requestId),
                    HomeService.getUnreadStatus(requestId)
                ]);

                // 只有在 success 为 true 时才更新状态，并提取内部的 .data
                if (uRes.success) setUserInfo(uRes.data);
                if (rRes.success) setRides(rRes.data || []); // 确保是数组
                if (sRes.success) setStats(sRes.data);

                // 注意：这里需要提取 data 内部的 hasUnread 属性
                if (nRes.success && nRes.data) {
                    setHasUnread(nRes.data.hasUnread);
                }

                logger.info({
                    module: 'useHomeForm',
                    operate: 'fetchHomeData_Success',
                    params: undefined,
                    result: 'Data integrated successfully',
                    error: undefined,
                    errorType: undefined,
                    requestId
                });
            } catch (error) {
                logger.error({
                    module: 'useHomeForm',
                    operate: 'fetchHomeData_Error',
                    params: locationParams,
                    result: undefined,
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'DATA_FETCH_FAILED',
                    requestId
                });
                Alert.alert("提示", "网络连接异常，请稍后重试");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeData();
    }, [isMockMode, requestId]); // requestId 变化时重新绑定链路

    // --- 计算属性 ---
    /**
     * 过滤并返回前三个推荐行程
     */
    const featuredRides = useMemo((): RideItem[] => {
        return rides.slice(0, 3);
    }, [rides]);

    // --- 事件处理函数 ---

    /**
     * 执行搜索并跳转
     */
    const handleSearch = () => {
        const searchParams = {
            from: fromLocation,
            to: toLocation,
            date: selectedDate,
        };

        try {
            if (!fromLocation.trim() || !toLocation.trim()) {
                Alert.alert("提示", "请输入出发地和目的地");
                return;
            }

            logger.info({
                module: 'useHomeForm',
                operate: 'handleSearch_Navigation',
                params: { ...searchParams },
                result: 'Navigating to FIND_RIDE',
                error: undefined,
                errorType: undefined,
                requestId
            });

            router.push({
                pathname: ROUTES.FIND_RIDE,
                params: searchParams,
            });
        } catch (error) {
            logger.error({
                module: 'useHomeForm',
                operate: 'handleSearch_Error',
                params: { ...searchParams },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NAVIGATION_FAILED',
                requestId
            });
            Alert.alert("抱歉", "系统导航出现异常，请稍后重试");
        }
    };

    /**
     * 通用导航跳转封装
     * @param {Href} path - 目标路径
     */
    const navigateTo = (path: Href | { pathname: Href; params: any }) => {
        try {
            logger.info({
                module: 'useHomeForm',
                operate: 'navigateTo',
                params: { target: typeof path === 'string' ? path : path.pathname },
                result: 'Executing router push',
                error: undefined,
                errorType: undefined,
                requestId
            });

            // Expo Router push 支持对象或字符串
            router.push(path as any);
        } catch (error) {
            logger.error({
                module: 'useHomeForm',
                operate: 'navigateTo_Error',
                params: { target: typeof path === 'string' ? path : 'complex_path' },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'ROUTER_PUSH_FAILED',
                requestId
            });
            Alert.alert("错误", "无法打开目标页面");
        }
    };

    return {
        // 状态
        fromLocation,
        toLocation,
        selectedDate,
        userInfo,
        stats,
        hasUnread,
        isLoading,
        isMockMode,
        // 计算数据
        featuredRides,
        // 操作方法
        setFromLocation,
        setToLocation,
        setSelectedDate,
        toggleMockMode,
        handleSearch,
        navigateTo,
    };
};