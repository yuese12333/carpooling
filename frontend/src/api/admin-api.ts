import { useEnvStore } from '@/store/env-store';
import request from '@/utils/request';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import {
    getHttpErrorMessage,
    isBusinessRejectHttpFailure,
    toBusinessRejectError,
} from '@/utils/api-response';

export type AdminUserRole = 'user' | 'admin';
export type AdminUserStatus = 'active' | 'disabled';

export interface AdminUser {
  userId: string;
  phone: string;
  userName: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUserListResponse {
  list: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserListQuery {
  page?: number;
  pageSize?: number;
  phone?: string;
  userName?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
}

const MOCK_USERS: AdminUser[] = [
  {
    userId: 'u_mock_001',
    phone: '13888888888',
    userName: '管理员A',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'u_mock_002',
    phone: '13900000000',
    userName: '用户B',
    role: 'user',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    userId: 'u_mock_003',
    phone: '13900000011',
    userName: '用户C',
    role: 'user',
    status: 'disabled',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const logAdminUpdateFailure = (
    moduleName: string,
    operation: string,
    params: Record<string, unknown>,
    error: unknown,
): never => {
    const requestId = useEnvStore.getState().currentRequestId;

    if (isBusinessRejectHttpFailure(error)) {
        const message = getHttpErrorMessage(error, '操作失败');
        logger.warn({
            module: moduleName,
            operate: operation,
            params,
            requestId,
            result: message,
            errorType: 'ADMIN_BUSINESS_REJECT',
        });
        throw toBusinessRejectError(error, message);
    }

    logger.error({
        module: moduleName,
        operate: operation,
        params,
        result: undefined,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_UPDATE_ERROR',
        requestId,
    });
    throw error;
};

export async function fetchAdminUsersList(query: AdminUserListQuery): Promise<ApiResponse<AdminUserListResponse>> {
  const moduleName = 'api.admin';
  const operation = 'fetchAdminUsersList';
  const isMockMode = useEnvStore.getState().isMockMode;

  try {
    if (isMockMode) {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;

      const filtered = MOCK_USERS.filter((u) => {
        if (query.phone && !u.phone.includes(query.phone)) return false;
        if (query.userName && !u.userName.includes(query.userName)) return false;
        if (query.role && u.role !== query.role) return false;
        if (query.status && u.status !== query.status) return false;
        return true;
      });

      const skip = (page - 1) * pageSize;
      const list = filtered.slice(skip, skip + pageSize);

      return {
        code: 200,
        message: 'success',
        data: { list, total: filtered.length, page, pageSize },
      };
    }

    const res = await request.get<any, ApiResponse<AdminUserListResponse>>('/admin/users', {
      params: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
        phone: query.phone,
        userName: query.userName,
        role: query.role,
        status: query.status,
      } as Record<string, unknown>,
    });
    return res;
  } catch (error: any) {
    logger.error({
      module: moduleName,
      operate: operation,
      params: query as unknown as Record<string, unknown>,
      result: undefined,
      error: error?.message || String(error),
      errorType: 'API_FETCH_ERROR',
      requestId: useEnvStore.getState().currentRequestId,
    });
    throw error;
  }
}

export async function updateAdminUserStatus(params: { targetUserId: string; status: AdminUserStatus }): Promise<ApiResponse<{ targetUserId: string; status: AdminUserStatus }>> {
  const moduleName = 'api.admin';
  const operation = 'updateAdminUserStatus';
  const isMockMode = useEnvStore.getState().isMockMode;

  try {
    if (isMockMode) {
      return {
        code: 200,
        message: 'success',
        data: params,
      };
    }

    const res = await request.post<any, ApiResponse<{ targetUserId: string; status: AdminUserStatus }>>('/admin/users/status', params);
    return res;
  } catch (error: unknown) {
    logAdminUpdateFailure(moduleName, operation, params, error);
    throw error;
  }
}

export async function updateAdminUserRole(params: { targetUserId: string; role: AdminUserRole }): Promise<ApiResponse<{ targetUserId: string; role: AdminUserRole }>> {
  const moduleName = 'api.admin';
  const operation = 'updateAdminUserRole';
  const isMockMode = useEnvStore.getState().isMockMode;

  try {
    if (isMockMode) {
      return {
        code: 200,
        message: 'success',
        data: params,
      };
    }

    const res = await request.post<any, ApiResponse<{ targetUserId: string; role: AdminUserRole }>>('/admin/users/role', params);
    return res;
  } catch (error: unknown) {
    logAdminUpdateFailure(moduleName, operation, params, error);
    throw error;
  }
}

