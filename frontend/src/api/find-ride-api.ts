/**
 * @file find-ride-api.ts
 * @description 拼车行程相关接口对接。
 */
import { AxiosError } from 'axios';
import { mockRides } from '../store/mock-data';
import logger from '@/utils/logger';
import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';

// --- 类型定义 (Type Definitions) ---

export interface RideSearchQuery {
    from?: string;
    to?: string;
    date?: string;
    page: number;
    pageSize: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
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
 * @param {TracedRequest<RideSearchQuery>} req - 包含搜索参数与追踪 ID
 * @returns 格式化的 API 响应对象
 */
export const fetchRides = async (
    params: RideSearchQuery,
    requestId: string | undefined
): Promise<ApiResponse<RideListResponse>> => {
    const moduleName = 'api.ride';
    const operation = 'fetchRides';

    try {
        if (useEnvStore.getState().isMockMode) {
            return {
                code: 200,
                message: 'success',
                data: {
                    list: mockRides.filter((r) => r.status !== 'cancelled'),
                    total: mockRides.length,
                    hasNextPage: false,
                },
            };
        }

        const response = await request.get<ApiResponse<RideListResponse>>('/rides/search', {
            params,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;

        // 严格遵循统一日志结构规范
        logger.error({
            module: moduleName,
            operate: operation,
            params: { ...params },
            result: undefined,
            error: axiosError.message,
            errorType: axiosError.code || 'API_FETCH_ERROR',
            requestId: requestId, // 显式消费传入的 ID
        });
        throw error;
    }
};

/**
 * 5.3 获取搜索筛选元数据
 * @param {string} requestId - 必须由调用方（如 Hook 或 Page）显式传入
 * @returns 包含排序与标签的元数据
 */
export const fetchSearchMetadata = async (requestId: string): Promise<ApiResponse<SearchMetadataResponse>> => {
    const moduleName = 'api.ride';
    const operation = 'fetchSearchMetadata';

    try {
        if (useEnvStore.getState().isMockMode) {
            return {
                code: 200,
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

        const response = await request.get<ApiResponse<SearchMetadataResponse>>('/rides/search-metadata');
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;

        logger.error({
            module: moduleName,
            operate: operation,
            params: undefined,
            result: undefined,
            error: axiosError.message,
            errorType: axiosError.code || 'API_METADATA_ERROR',
            requestId: requestId,
        });
        throw error;
    }
};