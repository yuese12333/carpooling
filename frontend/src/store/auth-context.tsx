/**
 * @file auth-context.tsx
 * @description 全局身份认证上下文管理器，处理用户信息持久化、登录态同步及操作链路追踪。
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "@/utils/logger";
import { useEnvStore } from "@/store/env-store";

/**
 * 用户信息接口定义
 */
interface User {
    id: string;
    name: string;
    phone: string;
    avatar: string;
}

/**
 * 鉴权上下文类型定义
 */
interface AuthContextType {
    /** 标识本地存储数据是否加载完成 */
    isReady: boolean;
    /** 是否已登录 */
    isAuthenticated: boolean;
    /** 当前用户信息 */
    user: User | null;
    /** 登录函数 */
    login: (phone: string, password: string) => Promise<void>;
    /** 注册函数 */
    register: (name: string, phone: string, password: string) => Promise<void>;
    /** 退出登录 */
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: User | null = __DEV__
    ? {
          id: "u1",
          name: "李小明",
          phone: "13888888888",
          avatar:
              "https://images.unsplash.com/photo-1605504836193-e77d3d9ede8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbWFuJTIwcG9ydHJhaXQlMjBhdmF0YXJ8ZW58MXx8fHwxNzczOTcyNDA3fDA&ixlib=rb-4.1.0&q=80&w=400",
      }
    : null;

const STORAGE_KEY = "carpooling_auth";

/**
 * 身份认证提供者组件
 * @param children 子组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadStorageData = async () => {
            const currentRequestId = useEnvStore.getState().currentRequestId;
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                await AsyncStorage.removeItem(STORAGE_KEY);
                logger.error({
                    module: "AuthContext",
                    operate: "loadStorageData",
                    error: error instanceof Error ? error.message : "Parse Error",
                    errorType: "STORAGE_READ_ERROR",
                    requestId: currentRequestId,
                });
            } finally {
                setIsReady(true);
            }
        };

        loadStorageData();
    }, []);

    /**
     * 执行用户登录逻辑
     * @param phone 手机号
     * @param password 密码
     */
    const login = async (phone: string, password: string) => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            // 模拟 API 调用延迟（仅 Dev 环境）
            if (!__DEV__ || !MOCK_USER) {
                throw new Error("login API not implemented");
            }
            await new Promise((res) => setTimeout(res, 1000));

            const loggedUser = { ...MOCK_USER, phone };

            // 数据持久化
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));

            setUser(loggedUser);
            setIsAuthenticated(true);

            logger.info({
                module: "AuthContext",
                operate: "login",
                params: { phone }, // 禁止记录 password 敏感隐私
                result: "success",
                requestId,
            });
        } catch (error) {
            logger.error({
                module: "AuthContext",
                operate: "login",
                params: { phone },
                error: error instanceof Error ? error.message : "Login Failed",
                errorType: "AUTH_LOGIN_ERROR",
                requestId,
            });
            throw error;
        }
    };

    /**
     * 执行用户注册逻辑
     * @param name 用户名
     * @param phone 手机号
     * @param password 密码
     */
    const register = async (name: string, phone: string, password: string) => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            if (!__DEV__ || !MOCK_USER) {
                throw new Error("register API not implemented");
            }
            await new Promise((res) => setTimeout(res, 1000));

            const newUser = { ...MOCK_USER, name, phone };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            logger.info({
                module: "AuthContext",
                operate: "register",
                params: { name, phone },
                result: "success",
                requestId,
            });
        } catch (error) {
            logger.error({
                module: "AuthContext",
                operate: "register",
                params: { name, phone },
                error: error instanceof Error ? error.message : "Register Failed",
                errorType: "AUTH_REGISTER_ERROR",
                requestId,
            });
            throw error;
        }
    };

    /**
     * 退出登录并清理持久化数据
     */
    const logout = async () => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            setUser(null);
            setIsAuthenticated(false);
            await AsyncStorage.removeItem(STORAGE_KEY);

            logger.info({
                module: "AuthContext",
                operate: "logout",
                params: undefined,
                result: "success",
                requestId,
            });
        } catch (error) {
            logger.error({
                module: "AuthContext",
                operate: "logout",
                error: error instanceof Error ? error.message : "Logout Failed",
                errorType: "STORAGE_WRITE_ERROR",
                requestId,
            });
        }
    };

    return (
        <AuthContext.Provider value={{ isReady, isAuthenticated, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * 访问身份认证上下文的自定义 Hook
 * @returns {AuthContextType}
 * @throws {Error} 若在 AuthProvider 外部调用则抛出异常
 */
export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}