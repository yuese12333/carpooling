/**
 * @file use-vehicle-verification-form.ts
 * @description 车辆认证详情业务逻辑 Hook，封装数据加载、状态管理与链路追踪
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    getVehicleVerificationDetail,
    VehicleVerificationDetail
} from "@/api/vehicle-verification-api";
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';

export const useVehicleVerificationDetail = (requestId: string) => {
    const router = useRouter();
    const params = useLocalSearchParams<{ vehicleId?: string }>();
    const vehicleId = Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId;

    const [loading, setLoading] = useState<boolean>(true);
    const [detail, setDetail] = useState<VehicleVerificationDetail | undefined>(undefined);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const loadData = useCallback(async () => {
        const moduleName = 'VehicleVerificationHook';
        const operationName = 'loadData';

        try {
            setLoading(true);
            const res = await getVehicleVerificationDetail(requestId, vehicleId);

            if (isApiSuccess(res)) {
                setDetail(res.data);
                logger.info({
                    module: moduleName,
                    operate: operationName,
                    params: { vehicleId },
                    result: 'Data loaded successfully',
                    requestId,
                });
            } else {
                logger.error({
                    module: moduleName,
                    operate: operationName,
                    params: { vehicleId },
                    error: res.message,
                    errorType: 'BUSINESS_ERROR',
                    requestId,
                });
            }
        } catch (error: unknown) {
            logger.error({
                module: moduleName,
                operate: operationName,
                params: { vehicleId },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'RUNTIME_EXCEPTION',
                requestId,
            });
        } finally {
            setLoading(false);
        }
    }, [requestId, vehicleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        loading,
        detail,
        handleBack,
        refreshData: loadData,
    };
};
