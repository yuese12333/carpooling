/**
 * @file auth.ts
 * @description 认证模块接口请求实现。
 * 包含登录鉴权、页面动态配置加载、注册流程接口及相关的类型定义。
 * 遵循规范：2.4 接口请求与数据处理规范、严格结构化日志输出规范。
 */

import { Platform } from 'react-native';
import logger from '../utils/logger';
import { useEnvStore } from '../store/env-store';
import type { ApiResponse } from '@/api/api.d';
import request from '@/utils/request';

/** 账号密码登录请求载荷 */
export interface LoginRequest {
    phone: string;
    password?: string;
    code?: string;
    shouldRemember?: boolean;
}

/** 登录成功返回的身份令牌数据 */
export interface LoginData {
    token: string;
    refreshToken: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    expireIn: number;
}

/** 登录页面动态配置信息 */
export interface PageConfig {
    logoUrl?: string;
    title: string;
    subtitle: string;
    activeSocialPlatforms: string[];
}

/** 第三方登录组件属性 */
export interface SocialItemProps {
    id: string;
    emoji: string;
    label: string;
    onPress?: () => void;
}

/** 注册请求载荷 */
export interface RegisterRequest {
    nickname: string;
    phoneNumber: string;
    password?: string;
    verifyCode: string;
    agreeProtocol: boolean;
    tempToken?: string;
}

/** 注册成功返回的数据 */
export interface RegisterData {
    userId: string;
    accessToken: string;
    userInfo: {
        nickname: string;
        avatarUrl: string;
    };
}

/** 昵称可用性响应 */
export interface NicknameCheckData {
    isAvailable: boolean;
}

/** 验证码校验响应 */
export interface VerifyCodeData {
    isValid: boolean;
    tempToken: string;
}

// --- 内部常量与 Mock 数据 ---

const MOCK_DELAY = {
    CONFIG: 500,
    LOGIN: 1500,
};

const MOCK_CONFIG: PageConfig = {
    title: "Mock 欢迎回来",
    subtitle: "当前处于测试模式，请放心使用",
    activeSocialPlatforms: ["wechat", "apple", "qq"]
};

const MOCK_LOGIN_SUCCESS: LoginData = {
    token: "mock_jwt_token_123",
    refreshToken: "mock_refresh_token_456",
    userId: "u_mock_001",
    userName: "测试用户",
    avatarUrl: "",
    expireIn: 604800
};

// --- 私有工具函数 ---

/**
 * 获取当前上下文中的 RequestId
 * 用于 API 层日志记录，确保链路一致性
 */
const getContextRequestId = (): string => useEnvStore.getState().currentRequestId;

// --- 接口函数实现 ---

/**
 * 获取登录页动态 UI 配置
 * @param {boolean} isMockMode - 是否启用 Mock 模式
 * @param {string} requestId - 全链路追踪 ID
 * @returns {Promise<ApiResponse<PageConfig>>} 返回页面配置数据
 */
export const fetchLoginConfig = async (
    isMockMode: boolean,
): Promise<ApiResponse<PageConfig>> => {
    if (isMockMode) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, message: 'mock', data: MOCK_CONFIG }), MOCK_DELAY.CONFIG);
        });
    }

    const result = await request.get<any, ApiResponse<PageConfig>>('/auth/login/config', {
        params: { appVersion: '1.0.0', platform: Platform.OS }
    });

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'fetchLoginConfig_SUCCESS',
            requestId: getContextRequestId()
        });
    }

    return result;
};

/**
 * 执行账号密码登录请求
 * @param {LoginRequest} payload - 登录请求参数
 * @param {boolean} isMockMode - 是否启用 Mock 模式
 * @param {string} requestId - 全链路追踪 ID
 * @returns {Promise<ApiResponse<LoginData>>}
 * @throws {Error}
 */
export const loginByPassword = async (
    payload: LoginRequest,
    isMockMode: boolean,
): Promise<ApiResponse<LoginData>> => {
    if (isMockMode) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                success: true,
                message: 'mock success',
                data: MOCK_LOGIN_SUCCESS
            }), MOCK_DELAY.LOGIN);
        });
    }

    const result = await request.post<any, ApiResponse<LoginData>>('/auth/login/password', payload);

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'loginByPassword_SUCCESS',
            params: { phone: payload.phone }, // 严禁记录 password
            requestId: getContextRequestId()
        });
    }

    return result;
};

// --- 注册相关接口实现 ---

/**
 * 检测用户昵称是否可用
 * @param {string} nickname - 待检测的昵称
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<ApiResponse<NicknameCheckData>>} 可用性检测结果
 */
export const checkNickname = async (
    nickname: string,
    isMock: boolean
): Promise<ApiResponse<NicknameCheckData>> => {
    if (isMock) {
        return { success: true, message: 'mock', data: { isAvailable: nickname !== "已占用" } };
    }
    const result = await request.get<any, ApiResponse<NicknameCheckData>>('/auth/register/check-nickname', {
        params: { nickname }
    });

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'checkNickname_SUCCESS',
            requestId: getContextRequestId()
        });
    }

    return result;
};

/**
 * 发送短信验证码
 * @param {string} phoneNumber - 手机号
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<ApiResponse<{ success: boolean }>>} 是否发送成功
 */
export const sendSmsCode = async (
    phoneNumber: string,
    isMock: boolean
): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMock) {
        return { success: true, message: 'mock', data: { success: true } };
    }
    const result = await request.post<any, ApiResponse<{ success: boolean }>>('/sms/send-verify-code', { phoneNumber });

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'sendSmsCode_SUCCESS',
            params: { phoneNumber },
            requestId: getContextRequestId()
        });
    }

    return result;
};

/**
 * 校验短信验证码合法性
 * @param {string} phoneNumber - 手机号
 * @param {string} verifyCode - 验证码
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<ApiResponse<VerifyCodeData>>} 校验结果及临时令牌
 */
export const verifySmsCode = async (
    phoneNumber: string,
    verifyCode: string,
    isMock: boolean
): Promise<ApiResponse<VerifyCodeData>> => {
    if (isMock) {
        return { success: true, message: 'mock', data: { isValid: true, tempToken: "mock_token" } };
    }
    const result = await request.post<any, ApiResponse<VerifyCodeData>>('/auth/register/verify-code', {
        phoneNumber,
        verifyCode
    });

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'verifySmsCode_SUCCESS',
            requestId: getContextRequestId()
        });
    }

    return result;
};

/**
 * 提交用户注册信息
 * @param {RegisterRequest} params - 注册请求完整参数
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<ApiResponse<RegisterData>>} 注册成功后的用户数据
 */
export const registerUser = async (
    params: RegisterRequest,
    isMock: boolean
): Promise<ApiResponse<RegisterData>> => {
    if (isMock) {
        return {
            success: true,
            message: 'mock',
            data: { userId: "mock_1", accessToken: "tk", userInfo: { nickname: params.nickname, avatarUrl: "" } }
        };
    }
    const result = await request.post<any, ApiResponse<RegisterData>>('/auth/register', params);

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'registerUser_SUCCESS',
            params: {
                nickname: params.nickname,
                phoneNumber: params.phoneNumber,
                agreeProtocol: params.agreeProtocol
            }, // 剔除敏感字段 password 和 verifyCode
            requestId: getContextRequestId()
        });
    }

    return result;
};