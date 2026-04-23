/**
 * @file vehicle-verification-api.ts
 * @description 车辆认证模块接口封装，支持链路追踪与结构化日志记录
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

// --- 类型定义 ---

/**
 * 基础 API 响应结构
 * @template T 业务数据类型
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface VerificationStep {
    id: number;
    label: string;
    status: 'success' | 'warning' | 'error';
    desc: string;
}

export interface VehicleBenefit {
    id: string;
    type: 'badge' | 'order' | 'safety';
    label: string;
}

export interface VehicleVerificationDetail {
    status: 'passed' | 'pending' | 'rejected';
    verifyDate: string;
    isValidLongTerm: boolean;
    steps: VerificationStep[];
    archives: {
        licenseMainUrl: string | undefined;
        vehiclePhotoUrl: string | undefined;
    };
    benefits: VehicleBenefit[];
}

// --- 模拟数据 (本地私有) ---

const MOCK_VEHICLE_DETAIL: VehicleVerificationDetail = {
    status: 'passed',
    verifyDate: '2024年12月15日',
    isValidLongTerm: true,
    steps: [
        { id: 1, label: "行驶证有效性", status: "success", desc: "证件在有效期内" },
        { id: 2, label: "人车一致性", status: "success", desc: "实名信息与车主一致" },
        { id: 3, label: "车辆外观合规", status: "success", desc: "无违规改装，整洁度优" },
        { id: 4, label: "强制保险核验", status: "success", desc: "保单已生效 (至2025-10)" },
    ],
    archives: {
        licenseMainUrl: undefined,
        vehiclePhotoUrl: undefined
    },
    benefits: [
        { id: '1', type: 'badge', label: '专属勋章' },
        { id: '2', type: 'order', label: '优先派单' },
        { id: '3', type: 'safety', label: '安全保障' },
    ]
};

// --- 请求函数 ---

/**
 * 获取车辆认证详情
 * @param requestId 显式传递的链路追踪ID，确保页面生命周期内唯一
 * @returns {Promise<ApiResponse<VehicleVerificationDetail>>} 认证详情响应
 */
export const getVehicleVerificationDetail = async (
    requestId: string
): Promise<ApiResponse<VehicleVerificationDetail>> => {
    const isMockMode = useEnvStore.getState().isMockMode;
    const moduleName = 'VehicleVerification';
    const operationName = 'getVehicleVerificationDetail';

    // 开始请求日志
    logger.info({
        module: moduleName,
        operate: operationName,
        params: { isMockMode },
        requestId,
        result: 'Request initiated'
    });

    try {
        // 1. Mock 逻辑分支
        if (isMockMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    logger.info({
                        module: moduleName,
                        operate: operationName,
                        params: { isMockMode },
                        requestId,
                        result: 'Mock data returned successfully'
                    });
                    resolve({
                        success: true,
                        message: "获取模拟数据成功",
                        data: MOCK_VEHICLE_DETAIL
                    });
                }, 500);
            });
        }

        // 2. 真实请求分支
        const response = await request.get<ApiResponse<VehicleVerificationDetail>>(
            '/api/v1/vehicle/verification/detail',
            {
                headers: { 'X-Request-Id': requestId } // 将 ID 注入请求头发送至后端
            }
        );

        // 成功日志记录
        logger.info({
            module: moduleName,
            operate: operationName,
            params: { requestId },
            result: response.data.success ? 'Success' : 'API Logic Error',
            requestId
        });

        return response.data;

    } catch (error: unknown) {
        // 异常日志记录（严禁打印全量 Error 对象，提取关键信息）
        const errorMsg = error instanceof Error ? error.message : 'Unknown network error';

        logger.error({
            module: moduleName,
            operate: operationName,
            params: { requestId },
            error: errorMsg,
            errorType: 'API_FETCH_FAILED',
            requestId
        });

        // 向上层抛出格式化的失败响应，确保 UI 层逻辑一致性
        return {
            success: false,
            message: `服务暂不可用: ${errorMsg}`,
            data: {} as VehicleVerificationDetail
        };
    }
};