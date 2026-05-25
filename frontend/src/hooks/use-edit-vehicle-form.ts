/**
 * @file use-edit-vehicle-form.ts
 * @description 车辆编辑页面的业务逻辑 Hook，集成了链路追踪、标准日志记录及表单状态管理
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVehicleDetail, updateVehicleInfo, VehicleInfo } from "@/api/edit-vehicle-api";
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';

const MODULE_NAME = 'use-edit-vehicle-form';

const EMPTY_FORM: VehicleInfo = {
    brand: "",
    model: "",
    plate: "",
    color: "",
    seats: "",
    isNonSmoking: true,
    hasAirConditioner: true,
    isDefault: false,
};

/**
 * 车辆编辑页面的业务逻辑 Hook
 */
export const useEditVehicleForm = (requestId: string) => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const vehicleId = (Array.isArray(params.id) ? params.id[0] : params.id) || 'v1';

    const [formData, setFormData] = useState<VehicleInfo>(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchDetail = async () => {
            try {
                const res = await getVehicleDetail(vehicleId, requestId);

                if (!isMounted) {
                    return;
                }

                if (isApiSuccess(res)) {
                    setFormData(res.data);
                    logger.info({
                        module: MODULE_NAME,
                        operate: 'fetchDetail_SUCCESS',
                        params: { vehicleId },
                        result: '数据加载成功',
                        requestId,
                    });
                } else {
                    Alert.alert("加载失败", res.message || "无法获取车辆信息");
                }
            } catch (error) {
                logger.error({
                    module: MODULE_NAME,
                    operate: 'fetchDetail_ERROR',
                    params: { vehicleId },
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'FETCH_API_CRASH',
                    requestId,
                });
                Alert.alert("加载失败", "无法获取车辆信息，请稍后再试");
            }
        };

        fetchDetail();

        return () => {
            isMounted = false;
        };
    }, [requestId, vehicleId]);

    const handleBack = () => {
        logger.info({ module: MODULE_NAME, operate: 'handleBack', requestId });
        router.back();
    };

    const updateFormField = (field: keyof VehicleInfo, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: field === 'plate' && typeof value === 'string' ? value.toUpperCase() : value,
        }));
    };

    const handleSave = async () => {
        if (!formData.brand || !formData.plate) {
            Alert.alert("错误", "请填写完整的品牌和车牌信息");
            return;
        }

        setIsSubmitting(true);
        logger.info({
            module: MODULE_NAME,
            operate: 'handleSave_START',
            params: { vehicleId, brand: formData.brand, plate: formData.plate },
            requestId,
        });

        try {
            const res = await updateVehicleInfo(formData, requestId);

            if (isApiSuccess(res)) {
                logger.info({
                    module: MODULE_NAME,
                    operate: 'handleSave_SUCCESS',
                    result: '提交成功并跳转',
                    requestId,
                });
                router.back();
            } else {
                Alert.alert("提交失败", res.message || "服务器异常");
            }
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'handleSave_CRASH',
                error: error instanceof Error ? error.message : String(error),
                errorType: 'NETWORK_OR_SYSTEM_ERROR',
                requestId,
            });
            Alert.alert("网络错误", "请检查网络连接");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isSubmitting,
        updateFormField,
        handleBack,
        handleSave,
    };
};
