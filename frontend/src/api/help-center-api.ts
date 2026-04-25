/**
 * @file help-center-api.ts
 * @description 帮助中心相关业务接口定义，包含分类获取与问题检索功能。
 * @version 1.1.0
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import { COLORS } from "@/pages/style";
import logger from '@/utils/logger';

// --- 类型定义 ---

/** 帮助分类项 */
export interface HelpCategory {
    id: string;
    title: string;
    iconName: string; // 对应 lucide-react-native 的图标名称
    bg: string;
}

/** 热门/搜索问题项 */
export interface HotQuestion {
    id: string;
    q: string;
    a: string;
}

/** 统一 API 返回包装格式 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// --- Mock 数据 (仅用于内部开发调试) ---
const MOCK_CATEGORIES: HelpCategory[] = [
    { id: '1', title: '行程相关', iconName: 'MapPin', bg: COLORS.primaryLight },
    { id: '2', title: '支付费用', iconName: 'CreditCard', bg: COLORS.bgOrangeLight },
    { id: '3', title: '账号信息', iconName: 'User', bg: COLORS.yellowBadge },
    { id: '4', title: '安全中心', iconName: 'ShieldCheck', bg: COLORS.errorLight },
];

const MOCK_QUESTIONS: HotQuestion[] = [
    { id: 'q1', q: '如何预约明天的行程？', a: '您可以在首页点击“预约”选项，选择出发时间、起点和终点，点击确认即可发起预约行程。' },
    { id: 'q2', q: '行程取消了，费用多久退还？', a: '取消行程后，款项通常会在1-3个工作日内原路退回您的支付账户。' },
    { id: 'q3', q: '如何修改实名认证信息？', a: '由于监管要求，实名认证一旦通过无法直接修改。如需更改，请联系人工客服协助。' },
];

// --- 接口函数 ---

/**
 * 获取帮助分类列表
 * @param requestId 外部透传的链路追踪 ID
 * @returns {Promise<HelpCategory[]>} 帮助分类数组
 */
export const getHelpCategories = async (requestId: string): Promise<HelpCategory[]> => {
    const isMock = useEnvStore.getState().isMockMode;
    const MODULE_NAME = 'HelpCenter';
    const OPERATE_NAME = 'getHelpCategories';

    if (isMock) {
        return Promise.resolve(MOCK_CATEGORIES);
    }

    try {
        const response = await request.get<ApiResponse<HelpCategory[]>>('/api/help/categories');

        logger.info({
            module: MODULE_NAME,
            operate: OPERATE_NAME,
            params: undefined,
            result: 'Success fetch categories',
            requestId
        });

        return response.data.data;
    } catch (error: unknown) {
        logger.error({
            module: MODULE_NAME,
            operate: OPERATE_NAME,
            params: undefined,
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_FETCH_ERROR',
            requestId
        });
        throw error;
    }
};

/**
 * 获取热门问题或根据关键词搜索问题
 * @param requestId 外部透传的链路追踪 ID
 * @param keyword 搜索关键字，默认为空字符串
 * @returns {Promise<HotQuestion[]>} 问题列表数组
 */
export const getHotQuestions = async (
    requestId: string,
    keyword: string = ""
): Promise<HotQuestion[]> => {
    const isMock = useEnvStore.getState().isMockMode;
    const MODULE_NAME = 'HelpCenter';
    const OPERATE_NAME = 'getHotQuestions';

    if (isMock) {
        return Promise.resolve(
            keyword
                ? MOCK_QUESTIONS.filter(i => i.q.includes(keyword))
                : MOCK_QUESTIONS
        );
    }

    try {
        const response = await request.get<ApiResponse<HotQuestion[]>>('/api/help/questions', {
            params: { search: keyword }
        });

        logger.info({
            module: MODULE_NAME,
            operate: OPERATE_NAME,
            params: { keyword },
            result: `Success fetch questions, count: ${response.data.data.length}`,
            requestId
        });

        return response.data.data;
    } catch (error: unknown) {
        logger.error({
            module: MODULE_NAME,
            operate: OPERATE_NAME,
            params: { keyword },
            error: error instanceof Error ? error.message : String(error),
            errorType: 'API_SEARCH_ERROR',
            requestId
        });
        throw error;
    }
};