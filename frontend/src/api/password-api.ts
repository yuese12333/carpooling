/**
 * @file password-api.ts
 * @description 身份认证与密码管理相关 API 模块，包含手机号状态校验、验证码发送与重置密码功能。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

/** ----------------类型定义---------------- */

export interface PhoneStatusData {
    isRegistered: boolean;
    userStatus: string;
}

export interface VerifyCodeData {
    isValid: boolean;
    tempToken: string;
}

export interface SmsSendData {
    success: boolean;
}

/** ----------------API 请求封装---------------- */
export const passwordApi = {
    /**
     * 3.1 校验手机号注册状态
     * @param phone 待校验的手机号码
     * @returns 手机号是否注册及用户当前状态
     */
    checkPhoneStatus: async (phone: string): Promise<ApiResponse<PhoneStatusData>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return { success: true, code: 200, message: "success", data: { isRegistered: true, userStatus: "active" } };
        }

        // --- 线性请求逻辑 ---
        const result = await request.post<any, ApiResponse<PhoneStatusData>>('/auth/check-phone', { phone });

        // 条件化日志记录：仅在业务成功时记录
        if (result.success) {
            logger.info({
                module: 'PasswordApi',
                operate: 'checkPhoneStatus',
                params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }, // 隐私脱敏
                result: undefined,
                requestId
            });
        }

        return result;
    },

    /**
     * 3.2 发送重置密码验证码
     * @param phone 手机号
     * @returns 是否发送成功
     */
    sendSmsCode: async (phone: string): Promise<ApiResponse<SmsSendData>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            return { success: true, code: 200, message: "success", data: { success: true } };
        }

        // --- 线性请求逻辑 ---
        const result = await request.post<any, ApiResponse<SmsSendData>>('/auth/password/sms', { phone });

        if (result.success) {
            logger.info({
                module: 'PasswordApi',
                operate: 'sendResetSms',
                params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
                result: 'SMS Sent Successfully',
                requestId
            });
        }

        return result;
    },

    /**
     * 3.3 校验验证码
     * @param phone 手机号
     * @param code 验证码
     * @returns 校验结果及临时 token
     */
    verifyCode: async (phone: string, code: string): Promise<ApiResponse<VerifyCodeData>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            return { success: true, code: 200, message: "success", data: { isValid: true, tempToken: "mock_token_xyz123" } };
        }

        // --- 线性请求逻辑 ---
        const result = await request.post<any, ApiResponse<VerifyCodeData>>('/auth/password/verify-code', { phoneNumber: phone, verifyCode: code });

        if (result.success) {
            logger.info({
                module: 'PasswordApi',
                operate: 'verifyResetCode',
                params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), code: '****' }, // 隐私脱敏
                result: 'Code Verified Successfully',
                requestId
            });
        }

        return result;
    },

    /**
     * 3.4 重置密码
     * @param phone 手机号
     * @param token 校验验证码后返回的 tempToken
     * @param password 新密码
     * @returns 操作结果
     */
    resetPassword: async (phone: string, token: string, password: string): Promise<ApiResponse<Record<string, never>>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.LONG);
            return { success: true, code: 200, message: "success", data: {} };
        }

        // --- 线性请求逻辑 ---
        const result = await request.post<any, ApiResponse<Record<string, never>>>('/auth/password/reset', { phoneNumber: phone, tempToken: token, newPassword: password });

        if (result.success) {
            logger.info({
                module: 'PasswordApi',
                operate: 'resetPassword',
                params: { token: '***', password: '***' }, // 禁止记录密码明文
                result: 'Password Reset Successfully',
                requestId
            });
        }

        return result;
    }
};