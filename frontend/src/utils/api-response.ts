/**
 * @file api-response.ts
 * @description API 响应成功态判断工具，统一 success / code 语义。
 */

import axios from 'axios';
import type { ApiResponse } from '@/api/api.d';

/**
 * 判断业务响应是否成功
 */
export const isApiSuccess = (res: ApiResponse): boolean => {
    if (res.success === true) {
        return true;
    }
    if (typeof res.code === 'number') {
        return res.code === 200;
    }
    return false;
};

/**
 * 提取业务错误文案
 */
export const getApiErrorMessage = (res: ApiResponse, fallback = '请求失败'): string => {
    const message = res.message?.trim();
    return message || fallback;
};

/**
 * 解包成功响应中的 data，失败时抛出 Error
 */
export const unwrapApiData = <T>(res: ApiResponse<T>, fallback = '请求失败'): T => {
    if (!isApiSuccess(res)) {
        throw new Error(getApiErrorMessage(res, fallback));
    }
    if (res.data === undefined || res.data === null) {
        throw new Error('响应数据为空');
    }
    return res.data;
};

/** 登录凭据类业务失败（密码错误、用户不存在等），非系统故障 */
export class AuthCredentialError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthCredentialError';
    }
}

/** 业务拒绝（如不能操作自己、参数校验失败等），非系统故障 */
export class BusinessRejectError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessRejectError';
    }
}

const LOGIN_PASSWORD_PATH = '/auth/login/password';

export const isLoginPasswordUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes(LOGIN_PASSWORD_PATH);
};

export const isAuthCredentialError = (error: unknown): error is AuthCredentialError => {
    return error instanceof AuthCredentialError;
};

export const isBusinessRejectError = (error: unknown): error is BusinessRejectError => {
    return error instanceof BusinessRejectError;
};

/**
 * HTTP 400 等业务拒绝（后端返回明确 message）
 */
export const isBusinessRejectHttpFailure = (error: unknown): boolean => {
    if (isBusinessRejectError(error)) return true;
    if (!axios.isAxiosError(error)) return false;
    return error.response?.status === 400;
};

/**
 * 登录接口 HTTP 401/400 视为预期业务失败
 */
export const isExpectedLoginHttpFailure = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    if (!isLoginPasswordUrl(error.config?.url)) return false;
    return status === 401 || status === 400;
};

/**
 * 从 axios / 未知异常中提取用户可读错误信息
 */
export const getHttpErrorMessage = (
    error: unknown,
    fallback = '网络繁忙，请稍后再试',
): string => {
    if (axios.isAxiosError(error)) {
        const body = error.response?.data as ApiResponse | undefined;
        if (body && typeof body === 'object') {
            return getApiErrorMessage(body, fallback);
        }
    }
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return fallback;
};

/**
 * 将登录接口失败转为可识别的业务异常（便于上层打 warn 日志）
 */
export const toLoginFailureError = (error: unknown, fallback = '登录失败'): Error => {
    const message = getHttpErrorMessage(error, fallback);
    if (isExpectedLoginHttpFailure(error)) {
        return new AuthCredentialError(message);
    }
    return error instanceof Error ? error : new Error(message);
};

/**
 * 将 HTTP 400 等业务拒绝转为可识别异常（便于上层打 warn 日志）
 */
export const toBusinessRejectError = (error: unknown, fallback = '操作失败'): Error => {
    const message = getHttpErrorMessage(error, fallback);
    if (isBusinessRejectHttpFailure(error)) {
        return new BusinessRejectError(message);
    }
    return error instanceof Error ? error : new Error(message);
};
