/**
 * @file use-edit-location-form.ts
 * @description 编辑地点页面的业务逻辑 Hook，集成链路追踪与标准化日志记录
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ROUTES } from '@/router/paths';
import { updateLocationApi, getLocationDetailApi } from '@/api/edit-location-api';
import logger from '@/utils/logger';
import { isApiSuccess } from '@/utils/api-response';

const MODULE_NAME = 'UseEditLocationForm';

export const useEditLocationForm = (requestId: string) => {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string; label?: string; address?: string }>();
    const locationId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [label, setLabel] = useState((params.label as string) || "");
    const [address, setAddress] = useState((params.address as string) || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!locationId || (params.label && params.address)) {
            return;
        }

        let isMounted = true;

        const loadDetail = async () => {
            try {
                const res = await getLocationDetailApi(locationId, requestId);
                if (!isMounted || !isApiSuccess(res)) {
                    return;
                }
                setLabel(res.data.label);
                setAddress(res.data.address);
            } catch (error) {
                logger.error({
                    module: MODULE_NAME,
                    operate: 'loadDetail_Error',
                    params: { id: locationId },
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'FETCH_ERROR',
                    requestId,
                });
            }
        };

        loadDetail();

        return () => {
            isMounted = false;
        };
    }, [locationId, params.label, params.address, requestId]);

    const handleUpdate = async () => {
        if (!label || !address) {
            Alert.alert("提示", "信息不能为空");
            return;
        }

        if (!locationId) {
            Alert.alert("提示", "地点 ID 缺失");
            return;
        }

        try {
            setLoading(true);

            const response = await updateLocationApi({
                id: locationId,
                label,
                address,
            }, requestId);

            if (isApiSuccess(response)) {
                Alert.alert("成功", "地点信息已更新", [
                    {
                        text: "确定",
                        onPress: () => router.replace(ROUTES.PROFILE.FAVORITE_LOCATIONS),
                    },
                ]);
            } else {
                Alert.alert("更新失败", response.message || "未知错误");
            }
        } catch {
            Alert.alert("错误", "网络请求失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return {
        formData: { label, address },
        status: { loading },
        methods: {
            setLabel,
            setAddress,
            handleUpdate,
            handleCancel,
        },
    };
};
