/**
 * @file use-find-ride-form.ts
 * @description 找拼车页面的业务逻辑 Hook，集成链路追踪与标准化日志审计
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchRides, RideListResponse } from "@/api/find-ride-api";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

interface SearchParams {
    from?: string;
    to?: string;
}

/**
 * 找拼车页面业务逻辑自定义 Hook
 * @returns {object} 包含搜索状态、受控组件 Setter 及业务处理函数
 */
export const useFindRideForm = () => {
    const router = useRouter();
    const params = useLocalSearchParams() as unknown as SearchParams;

    // --- 状态管理 ---
    // 明确类型定义，拒绝 any
    const [rides, setRides] = useState<RideListResponse['list']>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchFrom, setSearchFrom] = useState<string>(params.from || "");
    const [searchTo, setSearchTo] = useState<string>(params.to || "");
    const [sortBy, setSortBy] = useState<string>("最快出发");
    const [activeFilters, setActiveFilters] = useState<string[]>(["today"]);
    const [isSortDropdownVisible, setIsSortDropdownVisible] = useState<boolean>(false);

    /**
     * 内部逻辑：加载数据
     * 封装为 useCallback 以确保引用稳定性
     */
    const loadData = useCallback(async () => {
        const requestId = useEnvStore.getState().currentRequestId;
        const moduleName = 'hook.ride';
        const operation = 'loadData';

        setLoading(true);
        try {
            const searchParams = {
                from: searchFrom,
                to: searchTo,
                page: 1,
                pageSize: 10
            };

            const res = await fetchRides(searchParams);

            if (res.code === 200) {
                setRides(res.data.list);
                // 记录成功日志
                logger.info({
                    module: moduleName,
                    operate: operation,
                    params: searchParams,
                    result: `Success: fetched ${res.data.list.length} rides`,
                    requestId: requestId
                });
            } else {
                // 记录业务级异常
                logger.error({
                    module: moduleName,
                    operate: operation,
                    params: searchParams,
                    result: undefined,
                    error: res.message,
                    errorType: 'BIZ_ERROR',
                    requestId: requestId
                });
            }
        } catch (error) {
            // 记录系统级异常
            logger.error({
                module: moduleName,
                operate: operation,
                params: { searchFrom, searchTo },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'SYSTEM_ERROR',
                requestId: requestId
            });
            Alert.alert("提示", "网络连接异常，请重试");
        } finally {
            setLoading(false);
        }
    }, [searchFrom, searchTo]);

    // --- 副作用 ---
    useEffect(() => {
        loadData();
    }, []);

    // --- 计算属性 ---
    const filteredRides = useMemo(() => {
        return rides;
    }, [rides]);

    /**
     * 执行搜索操作
     * @returns {Promise<void>}
     */
    const handleSearch = async (): Promise<void> => {
        const requestId = useEnvStore.getState().currentRequestId;

        logger.info({
            module: 'hook.ride',
            operate: 'handleSearch',
            params: { searchFrom, searchTo },
            result: undefined,
            requestId: requestId
        });

        router.setParams({ from: searchFrom, to: searchTo });
        await loadData();
    };

    /**
     * 切换筛选标签状态
     * @param {string} tagValue 标签标识
     */
    const handleToggleFilter = (tagValue: string): void => {
        setActiveFilters((prev) =>
            prev.includes(tagValue)
                ? prev.filter((t) => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    /**
     * 选择排序方式
     * @param {string} option 排序选项标签
     */
    const handleSelectSort = (option: string): void => {
        setSortBy(option);
        setIsSortDropdownVisible(false);
    };

    /**
     * 切换排序下拉菜单显示状态
     */
    const toggleSortDropdown = (): void => {
        setIsSortDropdownVisible(!isSortDropdownVisible);
    };

    return {
        // 状态
        searchFrom,
        searchTo,
        sortBy,
        activeFilters,
        isSortDropdownVisible,
        loading,
        filteredRides,
        // Setter (用于受控组件)
        setSearchFrom,
        setSearchTo,
        // 操作方法
        handleSearch,
        handleToggleFilter,
        handleSelectSort,
        toggleSortDropdown,
    };
};