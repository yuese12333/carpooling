/**
 * @file auth.ts
 * @description 认证模块接口请求实现。
 * 包含登录鉴权、页面动态配置加载、注册流程接口及相关的类型定义。
 * 遵循规范：2.4 接口请求与数据处理规范、严格结构化日志输出规范。
 */

import axios from 'axios';
import { Platform } from 'react-native';
import logger from '../utils/logger';
import { useEnvStore } from '../store/env-store';

// --- 类型定义 ---

/** 接口响应通用结构 */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

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
 * @returns {Promise<PageConfig>} 返回页面配置数据
 */
export const fetchLoginConfig = async (
    isMockMode: boolean,
): Promise<PageConfig> => {
    if (isMockMode) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_CONFIG), MOCK_DELAY.CONFIG);
        });
    }

    try {
        const response = await axios.get<ApiResponse<PageConfig>>('/api/auth/login/config', {
            params: { appVersion: '1.0.0', platform: Platform.OS }
        });

        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error(response.data.message || '配置获取失败');
    } catch (error) {
        // 异常拦截处记录含 requestId 和 errorType 的日志
        logger.error({
            module: 'auth-api',
            operate: 'fetchLoginConfig',
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_RESPONSE_ERROR',
            requestId: getContextRequestId()
        });

        return {
            title: "欢迎回来",
            subtitle: "登录您的拼车账号",
            activeSocialPlatforms: ["wechat", "apple"]
        };
    }
};

/**
 * 执行账号密码登录请求
 * @param {LoginRequest} payload - 登录请求参数
 * @param {boolean} isMockMode - 是否启用 Mock 模式
 * @param {string} requestId - 全链路追踪 ID
 * @returns {Promise<LoginData>}
 * @throws {Error}
 */
export const loginByPassword = async (
    payload: LoginRequest,
    isMockMode: boolean,
): Promise<LoginData> => {
    if (isMockMode) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_LOGIN_SUCCESS), MOCK_DELAY.LOGIN);
        });
    }

    try {
        const response = await axios.post<ApiResponse<LoginData>>('/api/auth/login/password', payload);

        if (response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '登录失败');
        }
    } catch (error) {
        // 记录含 requestId 的错误日志，严禁记录敏感隐私（如 password）
        logger.error({
            module: 'auth-api',
            operate: 'loginByPassword',
            params: { phone: payload.phone },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'LOGIN_ACTION_ERROR',
            requestId: getContextRequestId()
        });
        throw error;
    }
};

// --- 注册相关接口实现 ---

/**
 * 检测用户昵称是否可用
 * @param {string} nickname - 待检测的昵称
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<NicknameCheckData>} 可用性检测结果
 */
export const checkNickname = async (
    nickname: string,
    isMock: boolean
): Promise<NicknameCheckData> => {
    if (isMock) {
        return { isAvailable: nickname !== "已占用" };
    }
    try {
        const res = await axios.get<ApiResponse<NicknameCheckData>>('/api/auth/register/check-nickname', {
            params: { nickname }
        });
        return res.data.data;
    } catch (error) {
        logger.error({
            module: 'auth-api',
            operate: 'checkNickname',
            params: { nickname },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'VALIDATION_ERROR',
            requestId: getContextRequestId()
        });
        throw error;
    }
};

/**
 * 发送短信验证码
 * @param {string} phoneNumber - 手机号
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<boolean>} 是否发送成功
 */
export const sendSmsCode = async (
    phoneNumber: string,
    isMock: boolean
): Promise<boolean> => {
    if (isMock) {
        return true;
    }
    try {
        const res = await axios.post<ApiResponse<{ success: boolean }>>('/api/sms/send-verify-code', { phoneNumber });
        return res.data.code === 200;
    } catch (error) {
        logger.error({
            module: 'auth-api',
            operate: 'sendSmsCode',
            params: { phoneNumber },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'SMS_SERVICE_ERROR',
            requestId: getContextRequestId()
        });
        return false;
    }
};

/**
 * 校验短信验证码合法性
 * @param {string} phoneNumber - 手机号
 * @param {string} verifyCode - 验证码
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<VerifyCodeData>} 校验结果及临时令牌
 */
export const verifySmsCode = async (
    phoneNumber: string,
    verifyCode: string,
    isMock: boolean
): Promise<VerifyCodeData> => {
    if (isMock) {
        return { isValid: true, tempToken: "mock_temp_token_123" };
    }
    try {
        const res = await axios.post<ApiResponse<VerifyCodeData>>('/api/auth/register/verify-code', {
            phoneNumber,
            verifyCode
        });
        return res.data.data;
    } catch (error) {
        logger.error({
            module: 'auth-api',
            operate: 'verifySmsCode',
            params: { phoneNumber },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'VERIFY_CODE_ERROR',
            requestId: getContextRequestId()
        });
        throw error;
    }
};

/**
 * 提交用户注册信息
 * @param {RegisterRequest} params - 注册请求完整参数
 * @param {boolean} isMock - 是否启用 Mock 模式
 * @returns {Promise<RegisterData>} 注册成功后的用户数据
 */
export const registerUser = async (
    params: RegisterRequest,
    isMock: boolean
): Promise<RegisterData> => {
    if (isMock) {
        return {
            userId: "u_mock_1001",
            accessToken: "mock_jwt_token",
            userInfo: { nickname: params.nickname, avatarUrl: "" }
        };
    }
    try {
        const res = await axios.post<ApiResponse<RegisterData>>('/api/auth/register', params);
        return res.data.data;
    } catch (error) {
        logger.error({
            module: 'auth-api',
            operate: 'registerUser',
            params: {
                nickname: params.nickname,
                phoneNumber: params.phoneNumber,
                agreeProtocol: params.agreeProtocol
            }, // 剔除敏感字段 password 和 verifyCode
            error: error instanceof Error ? error.message : String(error),
            errorType: 'REGISTER_SUBMIT_ERROR',
            requestId: getContextRequestId()
        });
        throw error;
    }
};