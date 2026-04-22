/**
 * @file edit-location-api.ts
 * @description 常用地点编辑模块接口封装。
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

// --- 类型定义 ---

export interface LocationDetail {
    id: string;
    label: string;
    address: string;
}

export interface UpdateLocationParams {
    id: string;
    label: string;
    address: string;
}

/**
 * 标准业务响应结构
 */
export interface ApiResponse<T = any> {
    success: boolean;
    code?: number;
    data: T | undefined;
    message: string;
}

const MODULE_NAME = 'EditLocationApi';

// --- 接口实现 ---

/**
 * 更新地点信息
 * @param params 更新参数
 * @param requestId 链路追踪ID
 */
export const updateLocationApi = async (
    params: UpdateLocationParams,
    requestId: string
): Promise<ApiResponse<undefined>> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    try {
        if (isMockMode) {
            logger.info({
                module: MODULE_NAME,
                operate: 'updateLocation_Mock',
                params: { ...params },
                result: 'Triggering mock success',
                requestId
            });

            return new Promise((resolve) =>
                setTimeout(() => resolve({
                    success: true,
                    code: 200,
                    data: undefined,
                    message: "更新成功"
                }), 800)
            );
        }

        /**
         * 修复点：显式解构 AxiosResponse 中的 data。
         * 底层 request 返回的是 AxiosResponse<ApiResponse<T>>，
         * 我们需要提取出 ApiResponse<T> 以匹配函数返回值类型。
         */
        const response = await request.put<ApiResponse<undefined>>(`/user/locations/${params.id}`, params);

        logger.info({
            module: MODULE_NAME,
            operate: 'updateLocation_Success',
            params: { id: params.id },
            result: 'API response received',
            requestId
        });

        // 核心修复：返回 response.data 转换后的业务对象
        return response.data;

    } catch (error: any) {
        const errorResult: ApiResponse<undefined> = {
            success: false,
            message: error.response?.data?.message ?? '网络请求失败，请稍后重试',
            data: undefined
        };

        logger.error({
            module: MODULE_NAME,
            operate: 'updateLocation_Error',
            params: { id: params.id },
            error: errorResult.message,
            errorType: 'API_ERROR',
            requestId
        });

        return errorResult;
    }
};

/**
 * 获取地点详情
 * @param id 地点ID
 * @param requestId 链路追踪ID
 */
export const getLocationDetailApi = async (
    id: string,
    requestId: string
): Promise<ApiResponse<LocationDetail>> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    try {
        if (isMockMode) {
            logger.info({
                module: MODULE_NAME,
                operate: 'getLocationDetail_Mock',
                params: { id },
                result: 'Return mock data',
                requestId
            });
            return {
                success: true,
                code: 200,
                data: MOCK_DETAIL,
                message: "success"
            };
        }

        // 修复点：显式解构 data
        const response = await request.get<ApiResponse<LocationDetail>>(`/user/locations/${id}`);

        logger.info({
            module: MODULE_NAME,
            operate: 'getLocationDetail_Success',
            params: { id },
            result: 'Detail fetched',
            requestId
        });

        return response.data;

    } catch (error: any) {
        const errorResult: ApiResponse<LocationDetail> = {
            success: false,
            message: error.response?.data?.message ?? '获取详情失败，请重试',
            data: undefined
        };

        logger.error({
            module: MODULE_NAME,
            operate: 'getLocationDetail_Error',
            params: { id },
            error: errorResult.message,
            errorType: 'API_ERROR',
            requestId
        });

        return errorResult;
    }
};

// --- Mock 数据 ---
const MOCK_DETAIL: LocationDetail = {
    id: "1",
    label: "演示地点",
    address: "北京市朝阳区某某大厦"
};