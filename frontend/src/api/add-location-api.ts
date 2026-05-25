/**
 * @file add-location-api.ts
 * @description 常用地点相关接口封装，支持显式链路追踪与结构化日志。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

// --- 类型定义 ---

/**
 * 地点基本信息结构化数据
 */
export interface LocationData {
    label: string;
    address: string;
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
    syncRequestId(requestId);
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

    // 统一使用 @/utils/request，并显式传递泛型与 RequestId
    const response = await request.post<any, ApiResponse>('/locations', data);

    // 记录操作成功的结构化日志
    if (response.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'saveFavoriteLocation',
            params: { ...data },
            // 根据规范：result 必须为 string，且避免使用 null
            result: 'location_saved',
            requestId,
        });
    }

    return response;
};