/**
 * @file real-name-auth-api.ts
 * @description 实名认证模块 API 请求定义，支持链路追踪与 Mock/真实模式切换
 * @version 1.2.0 (Refactored: Linear logic without Try-Catch)
 */

import request from '@/utils/request';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

/** 实名信息数据结构 */
export interface RealNameInfo {
    isVerified: boolean;
    realName?: string; // 脱敏后的姓名
    idCardNo?: string; // 脱敏后的证件号
    idType?: string;   // 证件类型描述
}

/** 认证提交参数 */
export interface AuthParams {
    name: string;
    idNumber: string;
}

const MODULE_NAME = 'RealNameAuthAPI';

/**
 * 获取实名认证详情
 * @param requestId 链路追踪 ID，由页面级 useMemo 生成并传入
 * @returns {Promise<ApiResponse<RealNameInfo>>}
 */
export const getRealNameStatus = async (requestId: string): Promise<ApiResponse<RealNameInfo>> => {
    syncRequestId(requestId);
    const isMock = useEnvStore.getState().isMockMode;

    // --- Mock 模式处理 ---
    if (isMock) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getRealNameStatus_Mock',
            params: { requestId },
            result: 'Fetching mock data for identity status',
            requestId,
        });

        return {
            success: true,
            message: 'Mock 数据获取成功',
            data: {
                isVerified: false,
            },
        };
    }

    // --- 真实请求处理 ---
    const result = await request.get<any, ApiResponse<RealNameInfo>>('/users/me/auth-status');

    // 仅在业务成功时记录日志，失败日志已由底层处理
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'getRealNameStatus_Success',
            params: { requestId },
            result: 'Successfully retrieved real-name status',
            requestId,
        });
    }

    return result;
};

/**
 * 提交实名认证
 * @param params 认证提交参数 (name, idNumber)
 * @param requestId 链路追踪 ID，由页面级 useMemo 生成并传入
 * @returns {Promise<ApiResponse<RealNameInfo>>}
 */
export const submitRealNameAuth = async (
    params: AuthParams,
    requestId: string,
): Promise<ApiResponse<RealNameInfo>> => {
    syncRequestId(requestId);
    const isMock = useEnvStore.getState().isMockMode;

    // 严禁在日志中记录原始证件号，此处仅记录脱敏后的长度或状态
    const logParams = {
        nameLength: params.name.length,
        idNumberLength: params.idNumber.length,
        requestId,
    };

    // --- Mock 模式处理 ---
    if (isMock) {
        logger.info({
            module: MODULE_NAME,
            operate: 'submitRealNameAuth_Mock',
            params: logParams,
            result: 'Simulating auth submission',
            requestId,
        });

        // 模拟网络延迟
        await mockDelay(MOCK_DELAY_MS.MEDIUM);

        return {
            success: true,
            message: '模拟认证成功',
            data: {
                isVerified: true,
                realName: '*' + params.name.slice(1),
                idCardNo: params.idNumber.replace(/^(\d{3})\d+(\d{4})$/, '$1***********$2'),
                idType: '中国居民身份证',
            },
        };
    }

    // --- 真实请求处理 ---
    const result = await request.post<any, ApiResponse<RealNameInfo>>('/users/me/auth/verify', params);

    // 仅在业务成功时记录成功日志
    if (result.success) {
        logger.info({
            module: MODULE_NAME,
            operate: 'submitRealNameAuth_Success',
            params: logParams,
            result: 'Auth submission successful',
            requestId,
        });
    }

    return result;
};