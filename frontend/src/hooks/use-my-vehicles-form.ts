/**
 * @file use-my-vehicles-form.ts
 * @description 车辆管理业务逻辑 Hook，集成 requestId 生命周期管理与标准化日志记录
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import {
    getVehicleListApi,
    setDefaultVehicleApi,
    deleteVehicleApi,
    VehicleInfo,
} from "@/api/my-vehicles-api";
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';

export const useMyVehiclesForm = (requestId: string) => {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const listLengthRef = useRef(0);
    useEffect(() => {
        listLengthRef.current = vehicles.length;
    }, [vehicles.length]);

    const loadData = useCallback(async (options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        if (!silent) {
            setLoading(true);
        }
        logger.info({
            module: 'VehicleModule',
            operate: 'loadVehicleData_Start',
            requestId,
        });

        try {
            const res = await getVehicleListApi(requestId);

            if (isApiSuccess(res)) {
                setVehicles(res.data);
                logger.info({
                    module: 'VehicleModule',
                    operate: 'loadVehicleData_Success',
                    result: `Loaded ${res.data.length} vehicles`,
                    requestId,
                });
            } else {
                Alert.alert("错误", res.message || "获取列表失败");
            }
        } catch (error: unknown) {
            Alert.alert("网络异常", "请检查网络连接或尝试重试");
            logger.error({
                module: 'VehicleModule',
                operate: 'loadVehicleData_Exception',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'FETCH_ERROR',
                requestId,
            });
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        loadData({ silent: listLengthRef.current > 0 });
    }, [loadData]);

    const handleBack = () => {
        router.back();
    };

    const handleAddVehicle = () => {
        router.push({
            pathname: ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION,
            params: { id: 'new' },
        });
    };

    const handleEdit = (id: string) => {
        router.push({
            pathname: ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION,
            params: { id },
        });
    };

    const handleViewVerification = (vehicleId: string) => {
        router.push({
            pathname: ROUTES.PROFILE.VEHICLE_VERIFICATION,
            params: { vehicleId },
        });
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await setDefaultVehicleApi(id, requestId);
            if (isApiSuccess(res)) {
                setVehicles((prev) =>
                    prev.map((v) => ({ ...v, isDefault: v.id === id }))
                );
            } else {
                Alert.alert("操作失败", res.message || "无法设为默认车辆");
            }
        } catch {
            Alert.alert("网络异常", "请稍后重试");
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert("删除车辆", "确定要删除该车辆吗？", [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await deleteVehicleApi(id, requestId);
                        if (isApiSuccess(res)) {
                            setVehicles((prev) => prev.filter((v) => v.id !== id));
                        } else {
                            Alert.alert("删除失败", res.message || "请稍后重试");
                        }
                    } catch {
                        Alert.alert("网络异常", "请稍后重试");
                    }
                },
            },
        ]);
    };

    return {
        vehicles,
        loading,
        handleBack,
        handleAddVehicle,
        handleEdit,
        handleViewVerification,
        handleSetDefault,
        handleDelete,
        refreshData: loadData,
    };
};
