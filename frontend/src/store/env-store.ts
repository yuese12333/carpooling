/**
 * @file env-store.ts
 * @description 全局环境配置与全链路追踪状态管理 Store。
 * 负责维护当前应用运行环境（Mock/正式）以及贯穿全生命周期的全链路请求 ID (RequestId)。
 * 遵循规范：2.2 全链路追踪规范、3.1 状态管理命名规范。
 */

import { create } from 'zustand';
import logger from '../utils/logger';

/**
 * 环境状态管理接口定义
 */
interface EnvState {
    /** * 是否启用 Mock 模式。
     * true: 强制使用本地 Mock 数据；false: 访问正式接口。
     */
    isMockMode: boolean;

    /** * 全链路追踪唯一标识。
     * 由 Page 层生成，通过 setCurrentRequestId 注入。
     */
    currentRequestId: string;

    /**
     * access token（给请求拦截器注入 Authorization）
     * 注意：token 只保存在内存与 AsyncStorage（由 AuthContext 管理），不在日志输出
     */
    token: string;

    /** 当前用户角色（由 token payload 或后端鉴权结果解码得到） */
    role: string;

    /** * 切换 Mock 模式开关。
     * @param {boolean} val - 目标状态
     */
    toggleMockMode: (val: boolean) => void;

    /** * 设置或更新当前会话的 RequestId。
     * 必须在页面初始化（useEffect）中尽早调用。
     * @param {string} id - 由工具函数生成的 UUID/NanoID
     */
    setCurrentRequestId: (id: string) => void;

    /** 设置 access token，并同步清理角色（role 也由调用方写入） */
    setToken: (token: string) => void;

    /** 设置当前用户角色 */
    setRole: (role: string) => void;
}

/**
 * 全局环境状态 Store 实现
 * 基于 Zustand 实现轻量级状态共享
 */
export const useEnvStore = create<EnvState>((set, get) => ({
    // 默认开启 Mock 模式
    isMockMode: true,

    // 初始化 RequestId 为空串
    currentRequestId: '',

    // token 默认为空（未登录）
    token: '',

    // role 默认 user（非管理员）
    role: 'user',

    /**
     * 切换 Mock 模式
     * 包含关键状态变更日志记录
     */
    toggleMockMode: (val: boolean) => {
        const prevMode = get().isMockMode;

        set({ isMockMode: val });

        // 记录环境切换日志，严格遵循 INFO 格式要求
        logger.info({
            module: 'env-store',
            operate: 'toggle_mock_mode',
            requestId: get().currentRequestId,
            params: { from: prevMode, to: val },
            result: 'success'
        });
    },

    /**
     * 挂载当前活跃的 RequestId
     */
    setCurrentRequestId: (id: string) => {
        // 基础防御性校验
        if (!id || typeof id !== 'string') {
            logger.warn({
                module: 'env-store',
                operate: 'set_request_id',
                requestId: 'system_error',
                params: { invalidId: id },
                result: 'rejected_by_validator'
            });
            return;
        }

        set({ currentRequestId: id });
    },

    setToken: (token: string) => {
      const safeToken = typeof token === 'string' ? token : '';
      set({ token: safeToken });
    },

    setRole: (role: string) => {
      const safeRole = typeof role === 'string' && role.trim() ? role.trim() : 'user';
      set({ role: safeRole });
    },
}));