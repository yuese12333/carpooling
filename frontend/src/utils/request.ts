/**
 * @file request.ts
 * @description 统一网络请求封装模块。
 * 实现基于 axios 的请求/响应拦截，支持 RequestId 自动化注入全链路追踪，
 * Token 自动刷新机制，并严格遵循结构化日志规范记录异常信息。
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useEnvStore } from '../store/env-store';
import logger from './logger';
import type { ApiResponse } from '@/api/api.d';
import { getApiErrorMessage, isLoginPasswordUrl } from '@/utils/api-response';

// Token 刷新状态管理
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 订阅 Token 刷新完成事件
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

/**
 * 通知所有订阅者 Token 刷新完成
 */
const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

/**
 * 封装后的 Axios 实例
 */
const request: AxiosInstance = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 判断响应体是否为业务失败（HTTP 200 但 code/success 表示失败）
 */
const isBusinessFailure = (body: ApiResponse): boolean => {
    if (typeof body.code === 'number' && body.code !== 200) {
        return true;
    }
    return body.success === false;
};

/**
 * 请求拦截器
 * 职责：从状态管理中提取 currentRequestId 并注入 Header。
 */
request.interceptors.request.use(
    (config) => {
        const { currentRequestId, token } = useEnvStore.getState();

        if (typeof token === 'string' && token.trim()) {
            config.headers = config.headers || {};
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token.trim()}`;
        }

        if (currentRequestId) {
            config.headers['X-Request-Id'] = currentRequestId;
        } else {
            logger.warn({
                module: 'http-client',
                operate: 'request_intercept',
                requestId: 'N/A',
                params: { url: config.url },
                result: 'request_id_missing'
            });
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 响应拦截器
 * 职责：解包 response.data 为 ApiResponse；记录 HTTP 与业务层失败日志；
 * 处理 401 自动刷新 Token 机制。
 * 业务失败仍 resolve 标准 ApiResponse，由调用方按 success/code 处理。
 */
request.interceptors.response.use(
    ((response: any) => {
        const body = response.data as ApiResponse;
        const { currentRequestId } = useEnvStore.getState();

        if (body && typeof body === 'object' && !Array.isArray(body)) {
            if (isBusinessFailure(body)) {
                logger.warn({
                    module: 'http-client',
                    operate: 'business_response',
                    requestId: currentRequestId || 'unknown',
                    params: { url: response.config?.url },
                    result: body.message ?? 'business_failed',
                    errorType: typeof body.code === 'number' ? `BIZ_${body.code}` : 'BIZ_FAIL',
                });
            }
        }

        // 解包 response.data 为 ApiResponse 直接返回；axios 拦截器类型期望 AxiosResponse，这里用类型断言抹平
        return body as any;
    }) as any,
    async (error: AxiosError) => {
        const { currentRequestId, refreshToken: storedRefreshToken } = useEnvStore.getState();
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const url = error.config?.url || '';
        const status = error.response?.status;
        const body = error.response?.data as ApiResponse | undefined;
        const detail = body && typeof body === 'object'
            ? getApiErrorMessage(body, error.message)
            : error.message;
        const errorType = error.response ? `HTTP_${status}` : 'NETWORK_TIMEOUT';

        // 401 错误处理：尝试刷新 Token
        if (status === 401 && storedRefreshToken && !originalRequest._retry) {
            // 排除登录接口和刷新 Token 接口
            if (isLoginPasswordUrl(url) || url.includes('/auth/refresh')) {
                logger.warn({
                    module: 'http-client',
                    operate: 'api_response',
                    requestId: currentRequestId || 'unknown',
                    params: { url, status },
                    result: '登录凭证无效',
                });
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // 正在刷新，等待刷新完成后重试
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken: string) => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(request(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 调用刷新 Token 接口
                const refreshResponse = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`,
                    { refreshToken: storedRefreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const newToken = refreshResponse.data?.data?.token;
                if (newToken) {
                    // 更新 store 中的 token
                    useEnvStore.getState().setToken(newToken);
                    onTokenRefreshed(newToken);
                    isRefreshing = false;

                    // 重试原始请求
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return request(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];

                logger.warn({
                    module: 'http-client',
                    operate: 'token_refresh_failed',
                    requestId: currentRequestId || 'unknown',
                    result: 'Token 刷新失败，需要重新登录',
                });

                // 清除认证状态
                useEnvStore.getState().setToken('');
                useEnvStore.getState().setRole('user');

                return Promise.reject(error);
            }
        }

        const logPayload = {
            module: 'http-client',
            operate: 'api_response',
            requestId: currentRequestId || 'unknown',
            params: { url, status: status ?? 'network' },
            errorType,
        };

        // 4xx 业务拒绝 / 鉴权：预期内用 warn；5xx 与网络异常用 error
        const isClientBusinessReject = status === 400;
        const isLoginCredentialFailure =
            isLoginPasswordUrl(url) && (status === 401 || status === 400);
        const shouldWarn =
            isClientBusinessReject || isLoginCredentialFailure || status === 401;

        if (shouldWarn) {
            logger.warn({
                ...logPayload,
                result: detail || (status === 401 ? '未授权或 token 失效' : '业务拒绝'),
            });
        } else {
            logger.error({
                ...logPayload,
                error: detail,
            });
        }

        return Promise.reject(error);
    }
);

export default request;
