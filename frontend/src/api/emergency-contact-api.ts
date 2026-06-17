/**
 * @file emergency-contact-api.ts
 * @description 紧急联系人管理 API 模块
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import type { ApiResponse } from '@/api/api.d';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

/** ----------------类型定义---------------- */

export interface EmergencyContact {
    id: string;
    contactName: string;
    contactPhone: string;
    relationType: string | null;
    isPrimary: boolean;
    createdAt?: string;
}

export interface ContactListData {
    contacts: EmergencyContact[];
    total: number;
}

export interface TripShareResult {
    success: boolean;
    contactName?: string;
    message: string;
    mock?: boolean;
}

/** ----------------API 请求封装---------------- */
export const emergencyContactApi = {
    /**
     * 获取紧急联系人列表
     */
    getContactList: async (): Promise<ApiResponse<ContactListData>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: "success",
                data: {
                    contacts: [
                        { id: "1", contactName: "张三", contactPhone: "138****1234", relationType: "父亲", isPrimary: true },
                        { id: "2", contactName: "李四", contactPhone: "139****5678", relationType: "朋友", isPrimary: false },
                    ],
                    total: 2,
                }
            };
        }

        // --- 真实请求 ---
        const result = await request.get<any, ApiResponse<ContactListData>>('/emergency-contacts');

        if (result.success) {
            logger.info({
                module: 'EmergencyContactApi',
                operate: 'getContactList',
                params: undefined,
                result: `Found ${result.data?.total || 0} contacts`,
                requestId
            });
        }

        return result;
    },

    /**
     * 添加紧急联系人
     */
    addContact: async (data: {
        contactName: string;
        contactPhone: string;
        relationType?: string;
        isPrimary?: boolean;
    }): Promise<ApiResponse<EmergencyContact>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: "success",
                data: {
                    id: Date.now().toString(),
                    ...data,
                    contactPhone: data.contactPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
                }
            };
        }

        // --- 真实请求 ---
        const result = await request.post<any, ApiResponse<EmergencyContact>>('/emergency-contacts', data);

        if (result.success) {
            logger.info({
                module: 'EmergencyContactApi',
                operate: 'addContact',
                params: { contactName: data.contactName },
                result: 'Contact added',
                requestId
            });
        }

        return result;
    },

    /**
     * 更新紧急联系人
     */
    updateContact: async (contactId: string, data: {
        contactName?: string;
        contactPhone?: string;
        relationType?: string;
        isPrimary?: boolean;
    }): Promise<ApiResponse<EmergencyContact>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: "success",
                data: {
                    id: contactId,
                    contactName: data.contactName || '',
                    contactPhone: data.contactPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '',
                    relationType: data.relationType || null,
                    isPrimary: data.isPrimary || false,
                }
            };
        }

        // --- 真实请求 ---
        const result = await request.post<any, ApiResponse<EmergencyContact>>('/emergency-contacts/update', { id: contactId, ...data });

        if (result.success) {
            logger.info({
                module: 'EmergencyContactApi',
                operate: 'updateContact',
                params: { contactId },
                result: 'Contact updated',
                requestId
            });
        }

        return result;
    },

    /**
     * 删除紧急联系人
     */
    deleteContact: async (contactId: string): Promise<ApiResponse<{ success: boolean }>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.SHORT);
            return { success: true, code: 200, message: "success", data: { success: true } };
        }

        // --- 真实请求 ---
        const result = await request.post<any, ApiResponse<{ success: boolean }>>('/emergency-contacts/delete', { id: contactId });

        if (result.success) {
            logger.info({
                module: 'EmergencyContactApi',
                operate: 'deleteContact',
                params: { contactId },
                result: 'Contact deleted',
                requestId
            });
        }

        return result;
    },

    /**
     * 发送行程共享通知
     */
    sendTripShare: async (rideId: string): Promise<ApiResponse<TripShareResult>> => {
        const requestId = useEnvStore.getState().currentRequestId;

        // --- Mock 逻辑 ---
        if (useEnvStore.getState().isMockMode) {
            await mockDelay(MOCK_DELAY_MS.MEDIUM);
            return {
                success: true,
                code: 200,
                message: "success",
                data: {
                    success: true,
                    contactName: "张三",
                    message: "行程共享通知已发送（开发模式）",
                    mock: true,
                }
            };
        }

        // --- 真实请求 ---
        const result = await request.post<any, ApiResponse<TripShareResult>>('/emergency-contacts/send-trip-share', { rideId });

        if (result.success) {
            logger.info({
                module: 'EmergencyContactApi',
                operate: 'sendTripShare',
                params: { rideId },
                result: 'Trip share notification sent',
                requestId
            });
        }

        return result;
    },
};
