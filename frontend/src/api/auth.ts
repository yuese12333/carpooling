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
