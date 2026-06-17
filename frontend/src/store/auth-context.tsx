/**
 * @file auth-context.tsx
 * @description 全局身份认证上下文管理器，处理用户信息持久化、登录态同步及操作链路追踪。
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger, { maskSensitive } from "@/utils/logger";
import { useEnvStore } from "@/store/env-store";
import { loginByPassword as loginByPasswordApi } from "@/api/auth";
import { isAuthCredentialError } from "@/utils/api-response";

/**
 * 用户信息接口定义
 */
interface User {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    token: string;
    refreshToken: string;
    role: string;
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
    login: (phone: string, password: string, rememberMe?: boolean) => Promise<void>;
    /** 注册函数 */
    register: (name: string, phone: string, password: string, accessToken?: string) => Promise<void>;
    /** 退出登录 */
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "carpooling_auth";

function decodeTokenPayload(token: string): Record<string, unknown> | null {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);

    try {
        const atobFn = (globalThis as any).atob;
        if (typeof atobFn === "function") {
            const binary = atobFn(padded);
            const jsonStr = decodeURIComponent(
                Array.prototype.map
                    .call(binary, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join(""),
            );
            return JSON.parse(jsonStr);
        }
    } catch {
        // ignore
    }

    // RN 环境有时可能没有 atob，此处尝试 Buffer（若可用）
    const buf: any = (globalThis as any).Buffer;
    if (buf) {
        try {
            const jsonStr = buf.from(padded, "base64").toString("utf8");
            return JSON.parse(jsonStr);
        } catch {
            return null;
        }
    }

    return null;
}

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
                    const nextToken = typeof parsed?.token === "string" ? parsed.token : "";
                    const decoded = decodeTokenPayload(nextToken);
                    const nextRoleRaw =
                        typeof parsed?.role === "string" && parsed.role.trim()
                            ? parsed.role
                            : decoded?.role;
                    const nextRole = typeof nextRoleRaw === "string" && nextRoleRaw.trim() ? nextRoleRaw.trim() : "user";

                    const safeUser =
                        nextToken && typeof nextToken === "string"
                            ? {
                                  id: typeof parsed?.id === "string" ? parsed.id : decoded?.userId || "",
                                  name: typeof parsed?.name === "string" ? parsed.name : "",
                                  phone: typeof parsed?.phone === "string" ? parsed.phone : "",
                                  avatar: typeof parsed?.avatar === "string" ? parsed.avatar : "",
                                  token: nextToken,
                                  refreshToken: typeof parsed?.refreshToken === "string" ? parsed.refreshToken : "",
                                  role: nextRole,
                              }
                            : null;

                    setUser(safeUser);
                    setIsAuthenticated(Boolean(safeUser?.token));

                    // 同步到 Zustand：供 request 拦截器注入 Authorization
                    if (safeUser?.token) {
                        useEnvStore.getState().setToken(safeUser.token);
                        useEnvStore.getState().setRefreshToken(safeUser.refreshToken);
                        useEnvStore.getState().setRole(safeUser.role);
                    }
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
    const login = async (phone: string, password: string, rememberMe?: boolean) => {
        const requestId = useEnvStore.getState().currentRequestId;
        const isMockMode = useEnvStore.getState().isMockMode;
        try {
            const data = await loginByPasswordApi(
                { phone, password, shouldRemember: rememberMe }
            );

            const decoded = decodeTokenPayload(data.token);
            const roleRaw = decoded?.role;
            // 安全兜底：解码失败时必须默认 user，避免越权
            const role =
                typeof roleRaw === "string" && roleRaw.trim() ? roleRaw.trim() : "user";

            const loggedUser: User = {
                id: data.userId,
                name: data.userName,
                phone,
                avatar: data.avatarUrl || "",
                token: data.token,
                refreshToken: data.refreshToken,
                role,
            };

            // 数据持久化（用于刷新恢复鉴权态）
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));

            setUser(loggedUser);
            setIsAuthenticated(Boolean(loggedUser.token));

            // 同步到 Zustand：供 request 拦截器注入 Authorization
            useEnvStore.getState().setToken(loggedUser.token);
            useEnvStore.getState().setRefreshToken(loggedUser.refreshToken);
            useEnvStore.getState().setRole(loggedUser.role);

            logger.info({
                module: "AuthContext",
                operate: "login",
                params: { ...maskSensitive({ phone }), rememberMe: Boolean(rememberMe), isMockMode },
                result: "success",
                requestId,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login Failed";
            const logBase = {
                module: "AuthContext",
                operate: "login",
                params: { ...maskSensitive({ phone }), rememberMe: Boolean(rememberMe) },
                requestId,
            };

            if (isAuthCredentialError(error)) {
                logger.warn({
                    ...logBase,
                    result: message,
                    errorType: "AUTH_CREDENTIAL_FAIL",
                });
            } else {
                logger.error({
                    ...logBase,
                    error: message,
                    errorType: "AUTH_LOGIN_ERROR",
                });
            }
            throw error;
        }
    };

    /**
     * 执行用户注册逻辑
     * @param name 用户名
     * @param phone 手机号
     * @param password 密码
     */
    const register = async (name: string, phone: string, password: string, accessToken?: string) => {
        const requestId = useEnvStore.getState().currentRequestId;
        try {
            // registerLocal 在 useRegisterForm 中会传回 accessToken（来自 registerUser 接口响应）
            const token = typeof accessToken === "string" ? accessToken : "";
            if (!token) {
                setUser(null);
                setIsAuthenticated(false);
                useEnvStore.getState().setToken("");
                useEnvStore.getState().setRole("user");
                return;
            }

            const decoded = decodeTokenPayload(token);
            const roleRaw = decoded?.role;
            // 安全兜底：解码失败默认 user
            const role =
                typeof roleRaw === "string" && roleRaw.trim() ? roleRaw.trim() : "user";

            const userIdRaw = decoded?.userId;
            const userId = typeof userIdRaw === "string" ? userIdRaw : "";

            const newUser: User = {
                id: userId || "",
                name,
                phone,
                avatar: "",
                token,
                refreshToken: "",
                role,
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            // 同步到 Zustand：供 request 拦截器注入 Authorization
            useEnvStore.getState().setToken(newUser.token);
            useEnvStore.getState().setRole(newUser.role);

            logger.info({
                module: "AuthContext",
                operate: "register",
                params: { name, phone, isMockMode: useEnvStore.getState().isMockMode },
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

            // 清理鉴权态：防止携带旧 token 访问管理接口
            useEnvStore.getState().setToken("");
            useEnvStore.getState().setRefreshToken("");
            useEnvStore.getState().setRole("user");

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