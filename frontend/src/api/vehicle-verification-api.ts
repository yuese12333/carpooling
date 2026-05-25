/**
 * @file vehicle-verification-api.ts
 * @description 车辆认证模块接口封装，支持链路追踪与结构化日志记录
 * @version 1.2.0 (Refactored: Linear logic without Try-Catch)
 */

import request from "@/utils/request";
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { syncRequestId } from '@/utils/sync-request-id';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

// --- 类型定义 ---

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
    requestId: string,
    vehicleId?: string
): Promise<ApiResponse<VehicleVerificationDetail>> => {
    syncRequestId(requestId);
    const isMockMode = useEnvStore.getState().isMockMode;
    const moduleName = 'VehicleVerification';
    const operationName = 'getVehicleVerificationDetail';

    if (isMockMode) {
        await mockDelay(MOCK_DELAY_MS.SHORT);

        logger.info({
            module: moduleName,
            operate: operationName,
            params: { vehicleId: vehicleId ?? 'default', isMockMode },
            requestId,
            result: 'Mock data returned successfully'
        });

        return {
            success: true,
            message: "获取模拟数据成功",
            data: MOCK_VEHICLE_DETAIL
        };
    }

    // 2. 真实请求分支 (线性 await，彻底剔除 try-catch)
    // 此时底层 request 会 Resolve 标准对象，若遇到 HTTP 错误或逻辑错误，底层已处理日志
    const result = await request.get<any, ApiResponse<VehicleVerificationDetail>>(
        '/vehicles/verification',
        { params: { vehicleId } },
    );

    // 3. 条件化日志记录
    // 仅在业务成功时记录上层成功日志
    if (result.success) {
        logger.info({
            module: moduleName,
            operate: operationName,
            params: { requestId },
            result: 'Success',
            requestId
        });
    }

    return result;
};