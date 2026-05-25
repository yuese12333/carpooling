/**
 * @file use-favorite-locations-form.ts
 * @description 常用地点管理业务逻辑 Hook，实现 CRUD 逻辑封装与标准化链路追踪
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, Href } from 'expo-router';
import { getLocationsApi, deleteLocationApi, LocationItem } from "@/api/favorite-locations-api";
import { ROUTES } from "@/router/paths";
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';

/**
 * 模块常量定义
 */
const MODULE_NAME = 'use-favorite-locations-form';

/**
 * 常用地点 Hook 返回值接口定义
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
 * @param requestId - 必须由外部 Page 层通过 useMemo 生成并显式注入的唯一链路 ID
 * @returns {UseFavoriteLocationsFormReturn} 业务状态与操作方法
 */
export const useFavoriteLocationsForm = (requestId: string): UseFavoriteLocationsFormReturn => {
    const router = useRouter();

    // --- 状态管理 ---
    const [searchQuery, setSearchQuery] = useState("");
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeLocation, setActiveLocation] = useState<LocationItem | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    /**
     * 获取地点列表
     * @param query - 搜索关键字（可选）
     */
    const fetchLocations = useCallback(async (query?: string) => {
        const operateName = 'fetchLocations';
        setLoading(true);

        try {
            const response = await getLocationsApi(requestId, query);

            // ✅ 修复：只有当 success 为 true 时，才取 response.data 赋值给状态
            if (isApiSuccess(response) && Array.isArray(response.data)) {
                setLocations(response.data);
            } else {
                setLocations([]); // 或者处理异常情况
            }

            logger.info({
                module: MODULE_NAME,
                operate: operateName,
                params: { query: query ?? '' }, // 确保 params 为 Record 结构
                result: 'Fetch locations success',
                requestId
            });
        } catch (error: any) {
            logger.error({
                module: MODULE_NAME,
                operate: operateName,
                params: { query: query ?? '' },
                result: undefined,
                error: error.message,
                errorType: error.code || 'FETCH_ERROR',
                requestId
            });
            Alert.alert("错误", "获取地点列表失败，请稍后再试");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    // 监听搜索词变化
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
        // 移除不必要的 requestAnimationFrame，确保交互同步响应
        setIsDeleteDialogOpen(true);
    };

    /**
     * 执行删除逻辑
     * @returns {Promise<void>}
     */
    const confirmDelete = async (): Promise<void> => {
        if (!activeLocation) return;
        const operateName = 'confirmDelete';

        try {
            const res = await deleteLocationApi(requestId, activeLocation.id);

            if (!isApiSuccess(res)) {
                Alert.alert("删除失败", res.message || "请稍后重试");
                return;
            }

            setLocations((prev) => prev.filter((loc) => loc.id !== activeLocation.id));
            setIsDeleteDialogOpen(false);

            logger.info({
                module: MODULE_NAME,
                operate: operateName,
                params: { id: activeLocation.id },
                result: 'Delete location success',
                requestId,
            });
        } catch (error: any) {
            logger.error({
                module: MODULE_NAME,
                operate: operateName,
                params: { id: activeLocation.id },
                result: undefined,
                error: error.message,
                errorType: error.code || 'DELETE_ERROR',
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
            module: MODULE_NAME,
            operate: 'handleGetCurrentLocation',
            params: { action: 'trigger' }, // 修复：必须为 Record 结构
            result: 'Get current location triggered',
            requestId
        });
    };

    /**
     * 处理返回逻辑
     * @param path - 目标返回路径
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