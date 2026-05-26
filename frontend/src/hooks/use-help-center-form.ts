/**
 * @file use-help-center-form.ts
 * @description 帮助中心页面业务逻辑 Hook，封装了搜索、分类加载及折叠面板交互逻辑。
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
    getHelpCategories,
    getHotQuestions,
    HelpCategory,
    HotQuestion
} from "@/api/help-center-api";
// 规范：引入统一日志模块
import logger from '@/utils/logger';

/**
 * HelpCenter 页面业务逻辑 Hook
 * @param {string} requestId - 必须从页面层透传的唯一链路追踪 ID
 * @returns 业务状态与操作方法
 */
export const useHelpCenterForm = (requestId: string) => {
    // 状态管理：遵循规范，使用 undefined 替换 null
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState<HelpCategory[]>([]);
    const [questions, setQuestions] = useState<HotQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * 执行数据加载
     * @param {string} keyword - 搜索关键字
     */
    const hasContentRef = useRef(false);
    useEffect(() => {
        hasContentRef.current = categories.length > 0 || questions.length > 0;
    }, [categories.length, questions.length]);

    const loadData = useCallback(async (keyword: string = "", options?: { silent?: boolean }) => {
        const MODULE_NAME = 'HelpCenterHook';
        const OPERATE_NAME = 'loadData';

        const silent = options?.silent ?? false;
        try {
            if (!silent) {
                setLoading(true);
            }

            // 规范：显式传递 requestId 到 API 层
            const [catRes, quesRes] = await Promise.all([
                getHelpCategories(requestId),
                getHotQuestions(requestId, keyword)
            ]);

            // 直接判断 catRes (它是 ApiResponse 类型)
            if (catRes.success && Array.isArray(catRes.data)) {
                setCategories(catRes.data);
            }

            // 直接判断 quesRes (它是 ApiResponse 类型)
            if (quesRes.success && Array.isArray(quesRes.data)) {
                setQuestions(quesRes.data);
            }

            // 记录成功日志
            logger.info({
                module: MODULE_NAME,
                operate: OPERATE_NAME,
                params: { keyword },
                result: 'Data loaded successfully',
                requestId
            });
        } catch (error: unknown) {
            // 规范：严禁 console.log/error，统一结构化记录
            logger.error({
                module: MODULE_NAME,
                operate: OPERATE_NAME,
                params: { keyword },
                error: error instanceof Error ? error.message : String(error),
                errorType: 'HOOK_DATA_FETCH_ERROR',
                requestId
            });
        } finally {
            setLoading(false);
        }
    }, [requestId]); // requestId 作为依赖，确保链路一致性

    // 初始加载：仅在挂载时执行
    useEffect(() => {
        loadData("", { silent: hasContentRef.current });
    }, [loadData]);

    // 搜索防抖逻辑
    useEffect(() => {
        if (!searchQuery) {
            loadData("", { silent: hasContentRef.current });
            return;
        }

        const timer = setTimeout(() => {
            loadData(searchQuery, { silent: hasContentRef.current });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, loadData]);

    /**
     * 处理折叠面板切换
     * @param {string} id - 问题 ID
     */
    const handleAccordionPress = (id: string) => {
        setExpandedId(prevId => (prevId === id ? undefined : id));

        logger.info({
            module: 'HelpCenterHook',
            operate: 'toggle_accordion',
            params: { questionId: id, action: expandedId === id ? 'close' : 'open' },
            requestId
        });
    };

    /**
     * 重置搜索
     */
    const clearSearch = () => {
        setSearchQuery("");

        logger.info({
            module: 'HelpCenterHook',
            operate: 'clear_search',
            requestId
        });
    };

    return {
        // 状态
        searchQuery,
        expandedId,
        categories,
        questions,
        loading,

        // 操作方法
        setSearchQuery,
        handleAccordionPress,
        clearSearch,
        refreshData: loadData,
    };
};