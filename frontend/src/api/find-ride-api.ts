/**
 * @file find-ride-api.ts
 * @description 拼车行程相关接口对接，集成链路追踪与标准化日志审计
 */
import axios, { AxiosError } from 'axios';
import { mockRides } from '../store/mock-data';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

// 从环境变量获取 Mock 开关，避免硬编码修改风险
const IS_MOCK_MODE = process.env.NODE_ENV === 'development' || true;

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
    sortOptions: Array<{ label: string; value: string }>;
    filterTags: Array<{ label: string; value: string }>;
}

// --- 接口函数 (API Functions) ---

/**
 * 5.1 搜索行程列表
 * @param params 搜索过滤参数
 * @returns 格式化的 API 响应对象
 */
export const fetchRides = async (params: RideSearchQuery): Promise<ApiResponse<RideListResponse>> => {
    const requestId = useEnvStore.getState().currentRequestId;
    const moduleName = 'api.ride';
    const operation = 'fetchRides';

    try {
        if (IS_MOCK_MODE) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const mockResult: ApiResponse<RideListResponse> = {
                code: 200,
                message: 'success',
                data: {
                    list: mockRides.filter((r) => r.status !== 'cancelled'),
                    total: mockRides.length,
                    hasNextPage: false,
                },
            };

            return mockResult;
        }

        const response = await axios.get<ApiResponse<RideListResponse>>('/api/rides/search', { params });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        logger.error({
            module: moduleName,
            operate: operation,
            params: params as unknown as Record<string, unknown>,
            result: undefined,
            error: axiosError.message,
            errorType: axiosError.code || 'API_FETCH_ERROR',
            requestId: requestId,
        });
        throw error;
    }
};

/**
 * 5.3 获取搜索筛选元数据
 * @returns 包含排序与标签的元数据
 */
export const fetchSearchMetadata = async (): Promise<ApiResponse<SearchMetadataResponse>> => {
    const requestId = useEnvStore.getState().currentRequestId;
    const moduleName = 'api.ride';
    const operation = 'fetchSearchMetadata';

    try {
        if (IS_MOCK_MODE) {
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

        const response = await axios.get<ApiResponse<SearchMetadataResponse>>('/api/rides/search-metadata');
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