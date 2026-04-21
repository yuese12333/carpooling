/**
 * @file password-api.ts
 * @description 身份认证与密码管理相关 API 模块，包含手机号状态校验、验证码发送与重置密码功能。
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/** ----------------配置项---------------- */
const IS_MOCK = true;

/** ----------------类型定义---------------- */
export interface BaseResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

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
    checkPhoneStatus: async (phone: string): Promise<BaseResponse<PhoneStatusData>> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            if (IS_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 800));
                return { code: 200, message: "success", data: { isRegistered: true, userStatus: "active" } };
            }
            const res = await request.get<BaseResponse<PhoneStatusData>>('/auth/password/check-phone', { params: { phone } });
            return res.data;
        } catch (error) {
            logger.error({
                module: 'PasswordApi',
                operate: 'checkPhoneStatus',
                params: { phone },
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_RUNTIME_ERROR',
                requestId
            });
            throw error;
        }
    },

    /**
     * 发送验证码
     * @param phone 目标手机号码
     * @returns 发送结果成功状态
     */
    sendSmsCode: async (phone: string): Promise<BaseResponse<SmsSendData>> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            if (IS_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 800));
                return { code: 200, message: "success", data: { success: true } };
            }
            const res = await request.post<BaseResponse<SmsSendData>>('/sms/send-verify-code', { phoneNumber: phone });
            return res.data;
        } catch (error) {
            logger.error({
                module: 'PasswordApi',
                operate: 'sendSmsCode',
                params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }, // 脱敏处理
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_RUNTIME_ERROR',
                requestId
            });
            throw error;
        }
    },

    /**
     * 2.2 校验验证码
     * @param phone 手机号码
     * @param code 验证码
     * @returns 校验结果及用于重置密码的临时 Token
     */
    verifyCode: async (phone: string, code: string): Promise<BaseResponse<VerifyCodeData>> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            if (IS_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 800));
                return { code: 200, message: "success", data: { isValid: true, tempToken: "mock_temp_token_123456" } };
            }
            const res = await request.post<BaseResponse<VerifyCodeData>>('/auth/register/verify-code', { phoneNumber: phone, verifyCode: code });
            return res.data;
        } catch (error) {
            logger.error({
                module: 'PasswordApi',
                operate: 'verifyCode',
                params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), code: '****' }, // 隐私脱敏
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_RUNTIME_ERROR',
                requestId
            });
            throw error;
        }
    },

    /**
     * 3.2 重置密码
     * @param token 校验验证码后返回的 tempToken
     * @param password 新密码
     * @returns 操作结果
     */
    resetPassword: async (token: string, password: string): Promise<BaseResponse<Record<string, never>>> => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            if (IS_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { code: 200, message: "success", data: {} };
            }
            const res = await request.post<BaseResponse<Record<string, never>>>('/auth/password/reset', { verifyToken: token, newPassword: password });
            return res.data;
        } catch (error) {
            logger.error({
                module: 'PasswordApi',
                operate: 'resetPassword',
                params: { token: '***', password: '***' }, // 禁止记录密码明文
                result: undefined,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'API_RUNTIME_ERROR',
                requestId
            });
            throw error;
        }
    }
};