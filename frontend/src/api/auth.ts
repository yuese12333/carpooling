/**
 * @file auth.ts
 * @description 认证模块接口请求实现。
 * 包含登录鉴权、页面动态配置加载、注册流程接口及相关的类型定义。
 * 遵循规范：2.4 接口请求与数据处理规范、严格结构化日志输出规范。
 * @version 1.1.0 (Unified mock mode from store)
 */

import { Platform } from 'react-native';
import logger from '../utils/logger';
import { useEnvStore } from '../store/env-store';
import type { ApiResponse } from '@/api/api.d';
import request from '@/utils/request';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';
import {
    isApiSuccess,
    toLoginFailureError,
    unwrapApiData,
} from '@/utils/api-response';

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

/** Token 刷新响应 */
export interface RefreshTokenData {
    token: string;
    expireIn: number;
}

// --- 内部常量与 Mock 数据 ---

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
 * 获取当前上下文中的 RequestId（由页面层 setCurrentRequestId 写入 store）
 * 用于 API 层日志记录，确保与 X-Request-Id Header 一致
 */
const getContextRequestId = (): string => useEnvStore.getState().currentRequestId;

/**
 * 获取当前 Mock 模式状态
 */
const getMockMode = (): boolean => useEnvStore.getState().isMockMode;

// --- 接口函数实现 ---

/**
 * 获取登录页动态 UI 配置
 * @remarks 调用前须由页面层 setCurrentRequestId，日志与 Header 共用 store 中的 requestId
 * @returns 返回页面配置数据
 */
export const fetchLoginConfig = async (): Promise<ApiResponse<PageConfig>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
        await mockDelay(MOCK_DELAY_MS.CONFIG);
        return { success: true, message: 'mock', data: MOCK_CONFIG };
    }

    const result = await request.get<any, ApiResponse<PageConfig>>('/auth/login/config', {
        params: { appVersion: '1.0.0', platform: Platform.OS }
    });

    if (isApiSuccess(result)) {
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
 * @param payload 登录请求参数
 * @remarks 调用前须由页面层 setCurrentRequestId
 * @returns 登录结果
 */
export const loginByPassword = async (
    payload: LoginRequest,
): Promise<LoginData> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
        await mockDelay(MOCK_DELAY_MS.LOGIN);
        return MOCK_LOGIN_SUCCESS;
    }

    try {
        const result = await request.post<any, ApiResponse<LoginData>>(
            '/auth/login/password',
            {
                phone: payload.phone,
                password: payload.password,
                rememberMe: Boolean(payload.shouldRemember),
            },
        );
        const data = unwrapApiData(result, '登录失败');

        logger.info({
            module: 'auth-api',
            operate: 'loginByPassword_SUCCESS',
            params: { phone: payload.phone },
            requestId: getContextRequestId()
        });

        return data;
    } catch (error) {
        throw toLoginFailureError(error, '登录失败');
    }
};

// --- 注册相关接口实现 ---

/**
 * 检测用户昵称是否可用
 * @param {string} nickname - 待检测的昵称
 * @returns {Promise<ApiResponse<NicknameCheckData>>} 可用性检测结果
 */
export const checkNickname = async (
    nickname: string
): Promise<ApiResponse<NicknameCheckData>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
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
 * @returns {Promise<ApiResponse<{ success: boolean }>>} 是否发送成功
 */
export const sendSmsCode = async (
    phoneNumber: string
): Promise<ApiResponse<{ success: boolean }>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
        return { success: true, message: 'mock', data: { success: true } };
    }

    // 与 Postman / docs/api/短信验证接口联调文档.md 发码请求体一致，原样传给后端转发阿里云
    const result = await request.post<any, ApiResponse<{ success: boolean }>>(
        '/sms/send',
        {
            phoneNumber,
            signName: '云渚科技验证平台',
            templateCode: '100001',
            templateParam: '{"code":"##code##","min":"5"}',
            returnVerifyCode: true,
        },
    );

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
 * @returns {Promise<ApiResponse<VerifyCodeData>>} 校验结果及临时令牌
 */
export const verifySmsCode = async (
    phoneNumber: string,
    verifyCode: string
): Promise<ApiResponse<VerifyCodeData>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
        return { success: true, message: 'mock', data: { isValid: true, tempToken: "mock_token" } };
    }
    const result = await request.post<any, ApiResponse<VerifyCodeData>>('/sms/verify', {
        phoneNumber,
        verifyCode,
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
 * @returns {Promise<ApiResponse<RegisterData>>} 注册成功后的用户数据
 */
export const registerUser = async (
    params: RegisterRequest
): Promise<ApiResponse<RegisterData>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
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

/**
 * 刷新 Token
 * @param refreshToken - 刷新令牌
 * @returns 新的 access token
 */
export const refreshToken = async (
    refreshTokenValue: string
): Promise<ApiResponse<RefreshTokenData>> => {
    const isMockMode = getMockMode();

    if (isMockMode) {
        return {
            success: true,
            message: 'mock',
            data: { token: 'mock_new_token_' + Date.now(), expireIn: 86400 }
        };
    }

    const result = await request.post<any, ApiResponse<RefreshTokenData>>(
        '/auth/refresh',
        { refreshToken: refreshTokenValue }
    );

    if (result.success) {
        logger.info({
            module: 'auth-api',
            operate: 'refreshToken_SUCCESS',
            requestId: getContextRequestId()
        });
    }

    return result;
};
