/**
 * @file use-favorite-locations-form.ts
 * @description 常用地点管理业务逻辑 Hook，实现 CRUD 逻辑封装与全链路日志追踪
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { getLocationsApi, deleteLocationApi, LocationItem } from "@/api/favorite-locations-api";
import { ROUTES } from "@/router/paths";
import logger from '@/utils/logger';

/**
 * 常用地点 Hook 返回值定义
 */
interface UseFavoriteLocationsFormReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    locations: LocationItem[];
    loading: boolean;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    activeLocation: LocationItem | undefined;
    handleAddLocation: () => void;
    handleEditLocation: (item: LocationItem) => void;
    prepareDelete: (item: LocationItem) => void;
    confirmDelete: () => Promise<void>;
    handleGetCurrentLocation: () => void;
    handleBack: (path: Href) => void;
}

/**
 * 常用地点业务逻辑 Hook
 * @param requestId - 必须由外部 Page 层显式注入的业务流 ID
 * @returns 业务状态与操作方法
 */
export const useFavoriteLocationsForm = (requestId: string): UseFavoriteLocationsFormReturn => {
    const router = useRouter();
    const moduleName = 'use-favorite-locations-form';

    const [searchQuery, setSearchQuery] = useState("");
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [loading, setLoading] = useState(false);

    // 状态初始化：严禁使用 null，统一采用 undefined
    const [activeLocation, setActiveLocation] = useState<LocationItem | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    /**
     * 获取地点列表
     * @param query - 搜索关键字
     */
    const fetchLocations = useCallback(async (query?: string) => {
        setLoading(true);
        const operateName = 'fetchLocations';

        try {
            // 显式注入 requestId 至 API 层
            const data = await getLocationsApi(requestId, query);
            setLocations(data);

            logger.info({
                module: moduleName,
                operate: operateName,
                params: { query },
                result: 'Fetch locations success',
                requestId
            });
        } catch (error: any) {
            logger.error({
                module: moduleName,
                operate: operateName,
                params: { query },
                result: undefined,
                error: error.message,
                errorType: 'FETCH_ERROR',
                requestId
            });
            Alert.alert("错误", "获取地点列表失败，请稍后再试");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchLocations(searchQuery);
    }, [searchQuery, fetchLocations]);

    /**
     * 跳转至新增地点页面
     */
    const handleAddLocation = () => {
        router.push(ROUTES.PROFILE.ADD_LOCATION);
    };

    /**
     * 跳转至编辑地点页面
     * @param item - 目标地点对象
     */
    const handleEditLocation = (item: LocationItem) => {
        router.push({
            pathname: ROUTES.PROFILE.EDIT_LOCATION,
            params: { id: item.id, label: item.label, address: item.address }
        });
    };

    /**
     * 准备删除操作，记录当前操作项
     * @param item - 待删除的地点对象
     */
    const prepareDelete = (item: LocationItem) => {
        setActiveLocation(item);
        requestAnimationFrame(() => {
            setIsDeleteDialogOpen(true);
        });
    };

    /**
     * 执行删除逻辑
     */
    const confirmDelete = async () => {
        if (!activeLocation) return;
        const operateName = 'confirmDelete';

        try {
            await deleteLocationApi(requestId, activeLocation.id);
            setLocations(prev => prev.filter(loc => loc.id !== activeLocation.id));
            setIsDeleteDialogOpen(false);

            logger.info({
                module: moduleName,
                operate: operateName,
                params: { id: activeLocation.id },
                result: 'Delete location success',
                requestId
            });
        } catch (error: any) {
            logger.error({
                module: moduleName,
                operate: operateName,
                params: { id: activeLocation.id },
                result: undefined,
                error: error.message,
                errorType: 'DELETE_ERROR',
                requestId
            });
            Alert.alert("删除失败", "服务器连接异常");
        }
    };

    /**
     * 处理获取当前位置
     */
    const handleGetCurrentLocation = () => {
        logger.info({
            module: moduleName,
            operate: 'handleGetCurrentLocation',
            params: undefined,
            result: 'Get current location triggered',
            requestId
        });
    };

    /**
     * 处理返回逻辑
     */
    const handleBack = (path: Href) => {
        router.push(path);
    };

    return {
        searchQuery,
        setSearchQuery,
        locations,
        loading,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        activeLocation,
        handleAddLocation,
        handleEditLocation,
        prepareDelete,
        confirmDelete,
        handleGetCurrentLocation,
        handleBack
    };
};