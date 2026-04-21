/**
 * @file find-ride-api.ts
 * @description 拼车行程相关接口对接。
 */
import axios, { AxiosError } from 'axios';
import { mockRides } from '../store/mock-data';
import logger from '@/utils/logger';

// 从环境变量获取 Mock 开关
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

/**
 * 注入式 API 参数接口
 */
interface TracedRequest<T = undefined> {
    params: T;
    /** 必须显式传入当前业务流的 RequestId */
    requestId: string;
}

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
        if (IS_MOCK_MODE) {
            await new Promise((resolve) => setTimeout(resolve, 500));
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

        const response = await axios.get<ApiResponse<RideListResponse>>('/api/rides/search', {
            params,
            headers: { 'X-Request-Id': requestId } // 将追踪 ID 注入请求头，实现跨端链路打通
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

        const response = await axios.get<ApiResponse<SearchMetadataResponse>>('/api/rides/search-metadata', {
            headers: { 'X-Request-Id': requestId }
        });
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