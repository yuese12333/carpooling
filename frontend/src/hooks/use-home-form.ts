/**
 * @file use-home-form.ts
 * @description 首页业务逻辑 Hook，处理数据加载、状态管理及导航跳转。
 */

import { useState, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { useEnvStore } from '../store/env-store';
import { HomeService, UserInfo, RideItem, HomeStats } from '@/api/home-api';
import { ROUTES } from '../router/paths';
import logger from '@/utils/logger';

/**
 * 首页业务逻辑自定义 Hook
 * @returns {Object} 包含状态、计算属性与操作方法
 */
export const useHomeForm = () => {
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
            const requestId = useEnvStore.getState().currentRequestId;
            const params = { latitude: 24.14, longitude: 120.67 }; // 模拟业务参数

            try {
                setIsLoading(true);

                // 记录请求起点
                logger.info({
                    module: 'useHomeForm',
                    operate: 'fetchHomeData_Start',
                    params,
                    result: undefined,
                    error: undefined,
                    errorType: undefined,
                    requestId
                });

                // 并发请求提升性能
                const [u, r, s, n] = await Promise.all([
                    HomeService.getUserInfo(),
                    HomeService.getRecommendRides(params.latitude, params.longitude),
                    HomeService.getStatistics(),
                    HomeService.getUnreadStatus()
                ]);

                setUserInfo(u);
                setRides(r);
                setStats(s);
                setHasUnread(n);

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
                    params,
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
    }, [isMockMode]);

    // --- 计算属性 ---
    /**
     * 过滤并返回前三个推荐行程
     * @type {RideItem[]}
     */
    const featuredRides = useMemo((): RideItem[] => {
        return rides.slice(0, 3);
    }, [rides]);

    // --- 事件处理函数 ---

    /**
     * 执行搜索并跳转至行程搜索结果页
     * @returns {void}
     */
    const handleSearch = () => {
        const requestId = useEnvStore.getState().currentRequestId;
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
                params: searchParams,
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
                params: searchParams,
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
     * @returns {void}
     */
    const navigateTo = (path: Href) => {
        const requestId = useEnvStore.getState().currentRequestId;

        try {
            logger.info({
                module: 'useHomeForm',
                operate: 'navigateTo',
                params: { targetPath: path },
                result: 'Executing router push',
                error: undefined,
                errorType: undefined,
                requestId
            });
            router.push(path);
        } catch (error) {
            logger.error({
                module: 'useHomeForm',
                operate: 'navigateTo_Error',
                params: { targetPath: path },
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
        router,
    };
};