/**
 * @file use-find-ride-form.ts
 * @description 找拼车页面的业务逻辑 Hook。
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchRides, RideListResponse, RideSearchQuery } from "@/api/find-ride-api";
import logger from '@/utils/logger';

interface SearchParams {
    from?: string;
    to?: string;
}

/**
 * 找拼车页面业务逻辑自定义 Hook
 * @param {string | undefined} requestId - [规范注入] 从 Page 层显式透传的业务链路 ID
 * @returns {object} 包含搜索状态、受控组件 Setter 及业务处理函数
 */
export const useFindRideForm = (requestId: string | undefined) => {
    const router = useRouter();
    const params = useLocalSearchParams() as unknown as SearchParams;

    // --- 状态管理 ---
    const [rides, setRides] = useState<RideListResponse['list']>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchFrom, setSearchFrom] = useState<string>(params.from || "");
    const [searchTo, setSearchTo] = useState<string>(params.to || "");
    const [sortBy, setSortBy] = useState<string>("最快出发");
    const [activeFilters, setActiveFilters] = useState<string[]>(["today"]);
    const [isSortDropdownVisible, setIsSortDropdownVisible] = useState<boolean>(false);

    /**
     * 内部逻辑：加载数据
     * 修复点：移除了 getState() 的隐式调用，改为消费参数中的 requestId
     */
    const loadData = useCallback(async () => {
        const moduleName = 'hook.ride';
        const operation = 'loadData';

        setLoading(true);
        const searchParams: RideSearchQuery = {
            from: searchFrom,
            to: searchTo,
            page: 1,
            pageSize: 10
        };

        try {
            // [显式传递] 将 requestId 透传至 API 层
            const res = await fetchRides(searchParams, requestId);

            if (res.code === 200) {
                setRides(res.data.list);
                // 记录标准化成功日志
                logger.info({
                    module: moduleName,
                    operate: operation,
                    params: { ...searchParams },
                    result: `Success: fetched ${res.data.list.length} rides`,
                    requestId: requestId,
                    error: undefined,
                    errorType: undefined
                });
            } else {
                // 记录业务级异常日志
                logger.error({
                    module: moduleName,
                    operate: operation,
                    params: { ...searchParams },
                    result: undefined,
                    error: res.message,
                    errorType: 'BIZ_ERROR',
                    requestId: requestId
                });
            }
        } catch (error) {
            // 记录系统级异常日志
            logger.error({
                module: moduleName,
                operate: operation,
                params: { ...searchParams },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'SYSTEM_ERROR',
                requestId: requestId
            });
            Alert.alert("提示", "网络连接异常，请重试");
        } finally {
            setLoading(false);
        }
    }, [searchFrom, searchTo, requestId]);

    // --- 副作用 ---
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- 计算属性 ---
    // TODO: 实现前端筛选与排序逻辑
    // activeFilters 用于按日期(today/tomorrow)、司机特征(female_driver)等字段过滤 rides
    // sortBy 用于对 rides 按出发时间/价格/评分排序
    // 目前 activeFilters 和 sortBy 状态已维护，待后端接口稳定后决定前端过滤还是传参重新请求
    const filteredRides = useMemo(() => {
        return rides;
    }, [rides]);

    /**
     * 执行搜索操作
     */
    const handleSearch = async (): Promise<void> => {
        logger.info({
            module: 'hook.ride',
            operate: 'handleSearch',
            params: {
                from: searchFrom,
                to: searchTo
            },
            result: 'Initiating search navigation',
            requestId: requestId,
            error: undefined,
            errorType: undefined
        });

        router.setParams({ from: searchFrom, to: searchTo });
        await loadData();
    };

    /**
     * 切换筛选标签状态
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
        // Setter
        setSearchFrom,
        setSearchTo,
        // 操作方法
        handleSearch,
        handleToggleFilter,
        handleSelectSort,
        toggleSortDropdown,
    };
};