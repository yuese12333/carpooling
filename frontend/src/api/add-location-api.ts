/**
 * @file add-location-api.ts
 * @description 常用地点相关接口封装，支持显式链路追踪与结构化日志。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

// --- 类型定义 ---

/**
 * 地点基本信息结构化数据
 */
export interface LocationData {
    label: string;
    address: string;
}

/**
 * 接口统一响应包装格式
 * @template T 业务数据类型
 */
export interface ApiResponse<T = undefined> {
    success: boolean;
    message?: string;
    data?: T;
}

// --- 常量配置 ---
const MODULE_NAME = 'location-api';

/**
 * 新增常用地点
 * @param data 地点信息 (LocationData)
 * @param requestId 显式注入的链路 ID，必须由页面级 useMemo 生成并传递
 * @returns {Promise<ApiResponse>} 包含操作结果的 Promise 对象
 */
export const saveFavoriteLocation = async (
    data: LocationData,
    requestId: string
): Promise<ApiResponse> => {
    // 获取全局 Mock 状态
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
        // 模拟 Mock 逻辑，保持与生产环境一致的日志结构
        logger.info({
            module: MODULE_NAME,
            operate: 'mockSaveLocation',
            params: { ...data },
            result: 'Mock success: 模拟保存成功',
            requestId,
        });

        return {
            success: true,
            message: '模拟保存成功',
            data: undefined
        };
    }

    try {
        // 统一使用 @/utils/request，并显式传递泛型与 RequestId
        const response = await request.post<ApiResponse>('/user/locations', data, {
            headers: { 'X-Request-Id': requestId }
        });

        // 记录操作成功的结构化日志
        logger.info({
            module: MODULE_NAME,
            operate: 'saveFavoriteLocation',
            params: { ...data },
            // 根据规范：result 必须为 string，且避免使用 null
            result: JSON.stringify(response.data ?? {}),
            requestId,
        });

        return response.data;
    } catch (error: unknown) {
        // 异常捕获与日志留痕
        // 转换 error 类型，并处理潜在的 undefined 属性以符合规范
        const axiosError = error as any;

        const errorResult: ApiResponse = {
            success: false,
            message: axiosError.response?.data?.message ?? '网络请求失败，请稍后重试',
            data: undefined
        };

        logger.error({
            module: MODULE_NAME,
            operate: 'saveFavoriteLocation',
            params: { ...data },
            result: JSON.stringify(errorResult),
            error: axiosError.message ?? 'Unknown Error',
            errorType: 'API_HTTP_ERROR',
            requestId,
        });

        return errorResult;
    }
};