/**
 * @file use-my-vehicles-form.ts
 * @description 车辆管理业务逻辑 Hook，集成 requestId 生命周期管理与标准化日志记录
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { getVehicleListApi, VehicleInfo } from "@/api/my-vehicles-api";
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';

/**
 * MyVehiclesPage 业务逻辑 Hook
 * @returns 车辆列表状态、交互处理器及刷新函数
 */
export const useMyVehiclesForm = (requestId: string) => {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * 加载车辆数据
     * @description 调用 API 层获取数据，并进行结构化日志记录与异常处理
     */
    const loadData = useCallback(async () => {
        setLoading(true);

        // 记录操作开始日志
        logger.info({
            module: 'VehicleModule',
            operate: 'loadVehicleData_Start',
            params: { requestId },
            requestId
        });

        try {
            // 【显式传递】API 调用必须注入 requestId
            const res = await getVehicleListApi(requestId);

            if (res.success) {
                setVehicles(res.data);
                logger.info({
                    module: 'VehicleModule',
                    operate: 'loadVehicleData_Success',
                    result: `Loaded ${res.data.length} vehicles`,
                    requestId
                });
            } else {
                Alert.alert("错误", res.message || "获取列表失败");
                logger.error({
                    module: 'VehicleModule',
                    operate: 'loadVehicleData_BusinessFail',
                    error: res.message,
                    requestId
                });
            }
        } catch (error: any) {
            // 严禁 console.log，统一使用结构化 logger
            Alert.alert("网络异常", "请检查网络连接或尝试重试");
            logger.error({
                module: 'VehicleModule',
                operate: 'loadVehicleData_Exception',
                error: error?.message || 'Network Exception',
                errorType: error?.code || 'FETCH_ERROR',
                requestId
            });
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    // 初始化加载
    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * 返回上一页
     */
    const handleBack = () => {
        logger.info({
            module: 'VehicleModule',
            operate: 'navigation_back',
            requestId
        });
        router.back();
    };

    /**
     * 添加车辆交互处理
     */
    const handleAddVehicle = () => {
        Alert.alert("提示", "添加车辆功能开发中");
    };

    /**
     * 跳转至编辑车辆
     * @param id 车辆唯一标识
     */
    const handleEdit = (id: string) => {
        logger.info({
            module: 'VehicleModule',
            operate: 'navigation_to_edit',
            params: { id },
            requestId
        });
        router.push({
            pathname: ROUTES.PROFILE.EDIT_VEHICLE_INFORMATION,
            params: { id }
        });
    };

    /**
     * 跳转至认证详情
     */
    const handleViewVerification = () => {
        logger.info({
            module: 'VehicleModule',
            operate: 'navigation_to_verification',
            requestId
        });
        router.push(ROUTES.PROFILE.VEHICLE_VERIFICATION);
    };

    return {
        vehicles,
        loading,
        requestId, // 导出供子组件消费，符合显式传递原则
        handleBack,
        handleAddVehicle,
        handleEdit,
        handleViewVerification,
        refreshData: loadData,
    };
};