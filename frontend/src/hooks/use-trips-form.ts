/**
 * @file use-trips-form.ts
 * @description 行程列表业务逻辑 Hook。负责行程数据的获取、状态过滤、角色筛选及日志链路追踪。
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import logger from '@/utils/logger';
import { myTrips } from "../store/mock-data";
import { tripsApi } from "../api/trips-api";
import { ROUTES } from '../router/paths';
import { useEnvStore } from '@/store/env-store';

const MODULE_NAME = 'use-trips-form';

/**
 * 接口返回的原始数据结构
 */
interface RawTripItem {
    tripId?: string;
    id?: string;
    role: "passenger" | "driver";
    status: "upcoming" | "completed" | "cancelled";
    bookedSeats: number;
    rideId?: string;
    from?: string;
    to?: string;
    date?: string;
    time?: string;
    duration?: string;
    price?: number;
    driverInfo?: any;
    ride?: {
        id?: string;
        from?: string;
        to?: string;
        date?: string;
        time?: string;
        duration?: string;
        price?: number;
        driver?: any;
    };
}

/**
 * 格式化后的行程对象结构
 */
export interface TransformedTrip {
    id: string;
    role: "passenger" | "driver";
    status: string;
    bookedSeats: number;
    ride: {
        id: string;
        from: string;
        to: string;
        date: string;
        time: string;
        duration: string;
        price: number;
        driver: any;
    };
}

/**
 * Hook 参数定义：强制显式接收 requestId
 */
interface UseTripsFormProps {
    requestId: string;
}

/**
 * @description 增强型结构适配器：兼容 Mock 与真实 API 字段。
 * @param item 原始行程数据
 * @returns 统一格式化的行程对象
 */
const transformApiData = (item: RawTripItem): TransformedTrip => {
    const stableId = item.tripId || item.id || `fallback-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
        id: stableId,
        role: item.role,
        status: item.status,
        bookedSeats: item.bookedSeats,
        ride: {
            id: item.rideId || item.ride?.id || '',
            from: item.from || item.ride?.from || '',
            to: item.to || item.ride?.to || '',
            date: item.date || item.ride?.date || '',
            time: item.time || item.ride?.time || '',
            duration: item.duration || item.ride?.duration || '',
            price: item.price || item.ride?.price || 0,
            // 修正：严禁使用 null，统一为 undefined
            driver: item.driverInfo || item.ride?.driver || undefined,
        }
    };
};

/**
 * @description 行程业务逻辑 Hook
 * @param {UseTripsFormProps} props 
 */
export const useTripsForm = ({ requestId }: UseTripsFormProps) => {
    const router = useRouter();

    // 状态定义
    const [activeTab, setActiveTab] = useState<string>("全部");
    const [activeRole, setActiveRole] = useState<"all" | "passenger" | "driver">("all");
    const [loading, setLoading] = useState<boolean>(false);
    const [rawTrips, setRawTrips] = useState<TransformedTrip[]>([]);

    /**
     * @description 获取行程列表数据
     * 显式使用注入的 requestId 进行链路透传
     */
    const listLengthRef = useRef(0);
    useEffect(() => {
        listLengthRef.current = rawTrips.length;
    }, [rawTrips.length]);

    const fetchTrips = useCallback(async (options?: { silent?: boolean }) => {
        const isMockMode = useEnvStore.getState().isMockMode;
        const silent = options?.silent ?? false;
        if (!silent) {
            setLoading(true);
        }

        let dataList: RawTripItem[] = [];

        // 1. Mock 模式逻辑
        if (isMockMode) {
            dataList = (myTrips || []) as RawTripItem[];
            const formatted = dataList.map(transformApiData);
            setRawTrips(formatted);

            logger.info({
                module: MODULE_NAME,
                operate: 'fetchTrips_Mock',
                params: { activeRole, isMock: true },
                result: `Loaded ${formatted.length} items from mock`,
                requestId
            });

            setLoading(false);
            return;
        }

        // 2. 真实 API 调用逻辑 (线性调用，无 Try-Catch)
        const result = await tripsApi.getList({
            page: 1,
            pageSize: 50,
            role: activeRole === 'all' ? undefined : activeRole
        }, requestId);

        // 3. 根据结果状态进行分支处理
        if (result.success && result.data) {
            dataList = result.data.list || [];
            const formatted = dataList.map(transformApiData);
            setRawTrips(formatted);

            // 仅在业务成功时记录日志
            logger.info({
                module: MODULE_NAME,
                operate: 'fetchTrips_Success',
                params: { activeRole, isMock: false },
                result: `Loaded ${formatted.length} items from API`,
                requestId
            });
        } else {
            // 业务逻辑错误提示，错误日志已在底层的 request.ts 或 API 层记录
            Alert.alert("提示", result.message || "获取行程列表失败，请稍后再试");
        }

        setLoading(false);
    }, [activeRole, requestId]);

    useEffect(() => {
        fetchTrips({ silent: listLengthRef.current > 0 });
    }, [fetchTrips]);

    /**
     * @description 基于 Tab 和 Role 对行程进行内存过滤
     */
    const filteredTrips = useMemo(() => {
        return rawTrips.filter((trip) => {
            const isTabMatched =
                activeTab === "全部" ||
                (activeTab === "即将出发" && trip.status === "upcoming") ||
                (activeTab === "已完成" && trip.status === "completed") ||
                (activeTab === "已取消" && trip.status === "cancelled");
            const isRoleMatched = activeRole === "all" || trip.role === activeRole;
            return isTabMatched && isRoleMatched;
        });
    }, [activeTab, activeRole, rawTrips]);

    /**
     * @description 处理取消行程逻辑
     * @param id 行程ID
     */
    const handleCancelTrip = (id: string) => {
        logger.info({
            module: MODULE_NAME,
            operate: 'handleCancelTrip',
            params: { tripId: id },
            result: 'Cancellation logic triggered',
            error: undefined,
            errorType: undefined,
            requestId
        });
        // 此处应继续透传 requestId 给 cancel API
    };

    /**
     * @description 处理联系对方逻辑
     * @param id 行程ID
     * @param role 对方角色
     */
    const handleContactAction = (id: string, role: string) => {
        logger.info({
            module: MODULE_NAME,
            operate: 'handleContactAction',
            params: { tripId: id, targetRole: role },
            result: 'Contact logic triggered',
            error: undefined,
            errorType: undefined,
            requestId
        });
    };

    return {
        state: {
            activeTab,
            activeRole,
            loading,
            isListInitialLoading: loading && rawTrips.length === 0,
            filteredTrips,
            isMockMode: useEnvStore.getState().isMockMode
        },
        actions: {
            setActiveTab,
            setActiveRole,
            fetchTrips,
            handleViewTripDetail: (id: string) => router.push({
                pathname: ROUTES.RIDE.DETAIL,
                params: { id }
            }),
            handleFindRideNavigation: () => router.push(ROUTES.FIND_RIDE),
            handleCancelTrip,
            handleContactAction
        }
    };
};