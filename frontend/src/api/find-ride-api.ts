/**
 * @file find-ride-api.ts
 * @description 拼车行程相关接口对接。
 */
import { mockRides } from '@/store/mock-data';
import logger from '@/utils/logger';
import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';

// --- 类型定义 (Type Definitions) ---

export interface RideSearchQuery {
    from?: string;
    to?: string;
    date?: string;
    page: number;
    pageSize: number;
}

/**
 * 搜索行程列表接口返回数据结构
 */
export interface RideListResponse {
    list: typeof mockRides;
    total: number;
    hasNextPage: boolean;
}

/**
 * 搜索元数据返回数据结构
 */
export interface SearchMetadataResponse {
    sortOptions: { label: string; value: string }[];
    filterTags: { label: string; value: string }[];
}

// --- 筛选与排序配置常量 ---

/** 排序选项 */
export const RIDE_SORT_OPTIONS = ["最快出发", "价格最低", "评分最高", "距离最近"] as const;

/** 过滤标签 */
export const RIDE_FILTER_TAGS = [
    { label: "今天", value: "today" },
    { label: "明天", value: "tomorrow" },
    { label: "女司机", value: "female_driver" },
    { label: "空调", value: "ac" },
    { label: "免费等待", value: "free_wait" },
    { label: "准时出发", value: "on_time" },
] as const;

// --- 接口函数 (API Functions) ---

/**
 * 5.1 搜索行程列表
 * @param {RideSearchQuery} params - 搜索参数
 * @param requestId 页面级 useMemo 生成并显式注入的链路追踪 ID
 * @returns 格式化的 API 响应对象
 */
export const fetchRides = async (
    params: RideSearchQuery,
    requestId: string
): Promise<ApiResponse<RideListResponse>> => {
    syncRequestId(requestId);
    const moduleName = 'api.ride';
    const operation = 'fetchRides';

    // --- Mock 模式逻辑 ---
    if (useEnvStore.getState().isMockMode) {
        return {
            code: 200,
            success: true,
            message: 'success',
            data: {
                list: mockRides.filter((r) => r.status !== 'cancelled'),
                total: mockRides.length,
                hasNextPage: false,
            },
        };
    }

    // --- 线性请求逻辑 ---
    // 底层 request 已自动 Resolve 标准 ApiResponse 结构，无需捕获错误
    const result = await request.get<any, ApiResponse<RideListResponse>>('/rides/search', {
        params,
    });

    // 条件化日志记录：仅在业务成功时记录
    if (result.success) {
        logger.info({
            module: moduleName,
            operate: operation,
            params: { ...params },
            result: 'Search success',
            requestId: requestId,
        });
    }

    return result;
};

/**
 * 5.3 获取搜索筛选元数据
 * @param {string} requestId - 链路追踪 ID
 * @returns 包含排序与标签的元数据
 */
export const fetchSearchMetadata = async (requestId: string): Promise<ApiResponse<SearchMetadataResponse>> => {
    syncRequestId(requestId);
    const moduleName = 'api.ride';
    const operation = 'fetchSearchMetadata';

    // --- Mock 模式逻辑 ---
    if (useEnvStore.getState().isMockMode) {
        return {
            code: 200,
            success: true,
            message: 'success',
            data: {
                sortOptions: [
                    { label: '最快出发', value: 'departure_time' },
                    { label: '价格最低', value: 'price_asc' },
                    { label: '评分最高', value: 'rating' },
                ],
                filterTags: [
                    { label: '今天', value: 'today' },
                    { label: '女司机', value: 'female' },
                    { label: '准时出发', value: 'on_time' },
                ],
            },
        };
    }

    // --- 线性请求逻辑 ---
    const result = await request.get<any, ApiResponse<SearchMetadataResponse>>('/rides/search-metadata');

    // 条件化日志记录
    if (result.success) {
        logger.info({
            module: moduleName,
            operate: operation,
            params: undefined,
            result: 'Metadata fetched successfully',
            requestId: requestId,
        });
    }

    return result;
};