/**
 * @file use-edit-vehicle-form.ts
 * @description 车辆编辑页面的业务逻辑 Hook，集成了链路追踪、标准日志记录及表单状态管理
 */

import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { ROUTES } from "@/router/paths";
import { getVehicleDetail, updateVehicleInfo, VehicleInfo } from "@/api/edit-vehicle-api";
import logger from '@/utils/logger';

const MODULE_NAME = 'use-edit-vehicle-form';

/**
 * 车辆编辑页面的业务逻辑 Hook
 * @returns {object} 提供给 UI 组件的状态与交互方法
 */
export const useEditVehicleForm = (requestId: string) => {
    const router = useRouter();

    // --- 状态管理 ---
    const [formData, setFormData] = useState<VehicleInfo>({
        brand: "",
        model: "",
        plate: "",
        color: "",
        seats: "",
        isNonSmoking: true,
        hasAirConditioner: true,
        isDefault: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 初始化数据加载 ---
    useEffect(() => {
        let isMounted = true;

        const fetchDetail = async () => {
            try {
                // 必须向 API 层显式注入 requestId
                const res = await getVehicleDetail("current", requestId);

                if (isMounted && res.success) {
                    setFormData(res.data);
                    logger.info({
                        module: MODULE_NAME,
                        operate: 'fetchDetail_SUCCESS',
                        params: { vehicleId: 'current' },
                        result: '数据加载成功',
                        requestId
                    });
                } else if (!res.success) {
                    Alert.alert("加载失败", res.message || "无法获取车辆信息");
                }
            } catch (error) {
                logger.error({
                    module: MODULE_NAME,
                    operate: 'fetchDetail_ERROR',
                    params: { vehicleId: 'current' },
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'FETCH_API_CRASH',
                    requestId
                });
                Alert.alert("加载失败", "无法获取车辆信息，请稍后再试");
            }
        };

        fetchDetail();

        return () => {
            isMounted = false;
        };
    }, [requestId]);

    /**
     * 返回上一页交互
     */
    const handleBack = () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'handleBack',
            requestId
        });
        router.back();
    };

    /**
     * 更新表单字段的通用方法
     * @param field 字段键名
     * @param value 字段值
     */
    const updateFormField = (field: keyof VehicleInfo, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'plate' && typeof value === 'string' ? value.toUpperCase() : value
        }));
    };

    /**
     * 提交保存逻辑
     */
    const handleSave = async () => {
        // 数据校验
        if (!formData.brand || !formData.plate) {
            Alert.alert("错误", "请填写完整的品牌和车牌信息");
            return;
        }

        setIsSubmitting(true);
        logger.info({
            module: MODULE_NAME,
            operate: 'handleSave_START',
            params: { brand: formData.brand, plate: formData.plate }, // 排除敏感隐私信息
            requestId
        });

        try {
            // 显式注入 requestId 确保全链路一致性
            const res = await updateVehicleInfo(formData, requestId);

            if (res.success) {
                logger.info({
                    module: MODULE_NAME,
                    operate: 'handleSave_SUCCESS',
                    result: '提交成功并跳转',
                    requestId
                });
                router.back();
            } else {
                logger.error({
                    module: MODULE_NAME,
                    operate: 'handleSave_FAIL',
                    params: { message: res.message },
                    errorType: 'BUSINESS_FAILURE',
                    requestId
                });
                Alert.alert("提交失败", res.message || "服务器异常");
            }
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'handleSave_CRASH',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NETWORK_OR_SYSTEM_ERROR',
                requestId
            });
            Alert.alert("网络错误", "请检查网络连接");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isSubmitting,
        requestId, // 暴露给 UI 组件以便子组件消费日志
        updateFormField,
        handleBack,
        handleSave,
    };
};