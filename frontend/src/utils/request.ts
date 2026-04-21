/**
 * @file request.ts
 * @description 统一网络请求封装模块。
 * 实现基于 axios 的请求/响应拦截，支持 RequestId 自动化注入全链路追踪，
 * 并严格遵循结构化日志规范记录异常信息。
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { useEnvStore } from '../store/env-store';
import logger from './logger';

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
 * 请求拦截器
 * 职责：从状态管理中提取 currentRequestId 并注入 Header。
 */
request.interceptors.request.use(
    (config) => {
        const { currentRequestId } = useEnvStore.getState();

        if (currentRequestId) {
            // 严格遵循规范：禁止手动拼接 URL，统一注入 Header
            config.headers['X-Request-Id'] = currentRequestId;
        } else {
            // 链路追踪 ID 缺失预警
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
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 响应拦截器
 * 职责：统一处理异常，并按照 [errorType] 规范记录日志。
 */
request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        const { currentRequestId } = useEnvStore.getState();
        const errorData = {
            module: 'http-client',
            operate: 'api_response',
            requestId: currentRequestId || 'unknown',
            error: error.message,
            // 严格字段匹配：区分网络错误与业务错误
            errorType: error.response ? `HTTP_${error.response.status}` : 'NETWORK_TIMEOUT'
        };

        // 记录结构化错误日志
        logger.error(errorData);

        return Promise.reject(error);
    }
);

export default request;