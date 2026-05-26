/**
 * @file request.ts
 * @description 统一网络请求封装模块。
 * 实现基于 axios 的请求/响应拦截，支持 RequestId 自动化注入全链路追踪，
 * 并严格遵循结构化日志规范记录异常信息。
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { useEnvStore } from '../store/env-store';
import logger from './logger';
import type { ApiResponse } from '@/api/api.d';
import { getApiErrorMessage, isLoginPasswordUrl } from '@/utils/api-response';

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
 * 职责：解包 response.data 为 ApiResponse；记录 HTTP 与业务层失败日志。
 * 业务失败仍 resolve 标准 ApiResponse，由调用方按 success/code 处理。
 */
request.interceptors.response.use(
    (response) => {
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

        return body;
    },
    (error: AxiosError) => {
        const { currentRequestId } = useEnvStore.getState();
        const url = error.config?.url || '';
        const status = error.response?.status;
        const body = error.response?.data as ApiResponse | undefined;
        const detail = body && typeof body === 'object'
            ? getApiErrorMessage(body, error.message)
            : error.message;
        const errorType = error.response ? `HTTP_${status}` : 'NETWORK_TIMEOUT';

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
