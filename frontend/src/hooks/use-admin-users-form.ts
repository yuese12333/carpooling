import { useEffect, useMemo, useState } from 'react';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import { isBusinessRejectError } from '@/utils/api-response';
import {
  fetchAdminUsersList,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from '@/api/admin-api';

export interface AdminUsersState {
  loading: boolean;
  updating: boolean;
  list: AdminUser[];
  total: number;

  page: number;
  pageSize: number;
  phone: string;
  userName: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
}

export const useAdminUsersForm = (requestId: string) => {
  const isMockMode = useEnvStore.getState().isMockMode;

  const [state, setState] = useState<AdminUsersState>({
    loading: false,
    updating: false,
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    phone: '',
    userName: '',
    role: undefined,
    status: undefined,
  });

  const buildQuery = useMemo(() => {
    return {
      page: state.page,
      pageSize: state.pageSize,
      phone: state.phone.trim() || undefined,
      userName: state.userName.trim() || undefined,
      role: state.role,
      status: state.status,
    };
  }, [state.page, state.pageSize, state.phone, state.userName, state.role, state.status]);

  const patchUserInList = (userId: string, patch: Partial<AdminUser>) => {
    setState((prev) => ({
      ...prev,
      list: prev.list.map((user) =>
        user.userId === userId ? { ...user, ...patch } : user,
      ),
    }));
  };

  const fetchUsers = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setState((prev) => ({ ...prev, loading: true }));
    }
    try {
      const res = await fetchAdminUsersList(buildQuery);
      if (res.code === 200) {
        setState((prev) => ({
          ...prev,
          list: res.data.list,
          total: res.data.total,
          loading: false,
        }));
      } else {
        throw new Error(res.message || 'fetch users failed');
      }

      logger.info({
        module: 'use-admin-users-form',
        operate: silent ? 'fetch_users_silent_success' : 'fetch_users_success',
        requestId,
        params: buildQuery,
        result: `total:${res.data.total}`,
      });
    } catch (error: unknown) {
      logger.error({
        module: 'use-admin-users-form',
        operate: silent ? 'fetch_users_silent_failed' : 'fetch_users_failed',
        requestId,
        params: buildQuery,
        result: undefined,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_ERROR',
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // mock 模式下也需要首次拉取以保持一致状态
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (targetUserId: string, nextStatus: AdminUserStatus) => {
    setState((prev) => ({ ...prev, updating: true }));
    try {
      await updateAdminUserStatus({ targetUserId, status: nextStatus });
      patchUserInList(targetUserId, { status: nextStatus });
      await fetchUsers({ silent: true });
      logger.info({
        module: 'use-admin-users-form',
        operate: 'update_status_success',
        requestId,
        params: { targetUserId, status: nextStatus },
        result: 'success',
      });
    } catch (error: unknown) {
      if (!isBusinessRejectError(error)) {
        logger.error({
          module: 'use-admin-users-form',
          operate: 'update_status_failed',
          requestId,
          params: { targetUserId, status: nextStatus },
          result: undefined,
          error: error instanceof Error ? error.message : String(error),
          errorType: 'API_ERROR',
        });
      }
    } finally {
      setState((prev) => ({ ...prev, updating: false }));
    }
  };

  const updateRole = async (targetUserId: string, nextRole: AdminUserRole) => {
    setState((prev) => ({ ...prev, updating: true }));
    try {
      await updateAdminUserRole({ targetUserId, role: nextRole });
      patchUserInList(targetUserId, { role: nextRole });
      await fetchUsers({ silent: true });
      logger.info({
        module: 'use-admin-users-form',
        operate: 'update_role_success',
        requestId,
        params: { targetUserId, role: nextRole },
        result: 'success',
      });
    } catch (error: unknown) {
      if (!isBusinessRejectError(error)) {
        logger.error({
          module: 'use-admin-users-form',
          operate: 'update_role_failed',
          requestId,
          params: { targetUserId, role: nextRole },
          result: undefined,
          error: error instanceof Error ? error.message : String(error),
          errorType: 'API_ERROR',
        });
      }
    } finally {
      setState((prev) => ({ ...prev, updating: false }));
    }
  };

  return {
    state,
    actions: {
      setPage: (page: number) => setState((prev) => ({ ...prev, page })),
      setPhone: (phone: string) => setState((prev) => ({ ...prev, phone })),
      setUserName: (userName: string) => setState((prev) => ({ ...prev, userName })),
      setRoleFilter: (role?: AdminUserRole) => setState((prev) => ({ ...prev, role })),
      setStatusFilter: (status?: AdminUserStatus) => setState((prev) => ({ ...prev, status })),
      applyFilters: async () => {
        await fetchUsers();
      },
      refresh: async () => fetchUsers(),
      updateStatus,
      updateRole,
    },
    isMockMode,
  };
};

