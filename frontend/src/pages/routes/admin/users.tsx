import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEnvStore } from '@/store/env-store';
import { useAdminUsersForm } from '@/hooks/use-admin-users-form';
import logger, { generateRequestId } from '@/utils/logger';
import styles, { COLORS } from './users.style';
import type { AdminUserRole, AdminUserStatus } from '@/api/admin-api';

function RoleChips({
  role,
  onSetRole,
}: {
  role?: AdminUserRole;
  onSetRole: (r?: AdminUserRole) => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.chip, !role ? styles.chipActive : undefined]} onPress={() => onSetRole(undefined)}>
        <Text style={[styles.chipText, !role ? styles.chipTextActive : undefined]}>全部</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, role === 'admin' ? styles.chipActive : undefined]} onPress={() => onSetRole('admin')}>
        <Text style={[styles.chipText, role === 'admin' ? styles.chipTextActive : undefined]}>管理员</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, role === 'user' ? styles.chipActive : undefined]} onPress={() => onSetRole('user')}>
        <Text style={[styles.chipText, role === 'user' ? styles.chipTextActive : undefined]}>普通用户</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatusChips({
  status,
  onSetStatus,
}: {
  status?: AdminUserStatus;
  onSetStatus: (s?: AdminUserStatus) => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.chip, !status ? styles.chipActive : undefined]} onPress={() => onSetStatus(undefined)}>
        <Text style={[styles.chipText, !status ? styles.chipTextActive : undefined]}>全部状态</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, status === 'active' ? styles.chipActive : undefined]} onPress={() => onSetStatus('active')}>
        <Text style={[styles.chipText, status === 'active' ? styles.chipTextActive : undefined]}>启用</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, status === 'disabled' ? styles.chipActive : undefined]} onPress={() => onSetStatus('disabled')}>
        <Text style={[styles.chipText, status === 'disabled' ? styles.chipTextActive : undefined]}>禁用</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminUsersPage() {
  const requestId = useMemo(() => generateRequestId(), []);
  const { setCurrentRequestId } = useEnvStore.getState();

  useEffect(() => {
    setCurrentRequestId(requestId);
  }, [requestId, setCurrentRequestId]);

  const { state, actions, isMockMode } = useAdminUsersForm(requestId);

  useEffect(() => {
    logger.info({
      module: 'AdminUsersPage',
      operate: 'PAGE_ENTER',
      requestId,
      params: { isMockMode },
      result: 'SUCCESS',
    });
  }, [requestId, isMockMode]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>用户管理</Text>
        <Text style={styles.subtitle}>
          总数：{state.total}（{state.loading ? '加载中' : state.updating ? '更新中' : '已就绪'}）
        </Text>
      </View>

      <View style={styles.filters}>
        <Text style={styles.label}>手机号</Text>
        <TextInput
          style={styles.input}
          value={state.phone}
          onChangeText={(v) => actions.setPhone(v)}
          placeholder="模糊匹配"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>昵称</Text>
        <TextInput
          style={styles.input}
          value={state.userName}
          onChangeText={(v) => actions.setUserName(v)}
          placeholder="模糊匹配"
        />

        <Text style={styles.label}>角色</Text>
        <RoleChips role={state.role} onSetRole={(r) => actions.setRoleFilter(r)} />

        <Text style={styles.label}>状态</Text>
        <StatusChips status={state.status} onSetStatus={(s) => actions.setStatusFilter(s)} />

        <TouchableOpacity
          style={[styles.applyBtn, state.loading ? styles.applyBtnDisabled : undefined]}
          disabled={state.loading}
          onPress={actions.applyFilters}
        >
          <Text style={styles.applyBtnText}>查询</Text>
        </TouchableOpacity>
      </View>

      {state.loading && state.list.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : state.list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>没有匹配的数据</Text>
        </View>
      ) : (
        <FlatList
          data={state.list}
          keyExtractor={(item) => item.userId}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          renderItem={({ item }) => {
            const nextStatus = item.status === 'active' ? 'disabled' : 'active';
            const nextRole = item.role === 'admin' ? 'user' : 'admin';

            return (
              <View style={styles.card}>
                <Text style={styles.cardLine}>手机号：{item.phone}</Text>
                <Text style={styles.cardLine}>昵称：{item.userName}</Text>
                    <Text style={styles.cardLine}>角色：{item.role === 'admin' ? '管理员' : '普通用户'}</Text>
                    <Text style={styles.cardLine}>状态：{item.status === 'active' ? '正常' : '禁用'}</Text>
                    <Text style={styles.cardLine}>
                      注册时间：
                      {(() => {
                        const d = new Date(item.createdAt);
                        if (Number.isNaN(d.getTime())) return item.createdAt;
                        return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
                      })()}
                    </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, item.status === 'active' ? styles.actionBtnDanger : styles.actionBtnPrimary]}
                    onPress={() => actions.updateStatus(item.userId, nextStatus)}
                    disabled={state.updating}
                  >
                    <Text style={[styles.actionBtnText, item.status === 'active' ? styles.actionBtnTextDanger : styles.actionBtnTextPrimary]}>
                      {nextStatus === 'disabled' ? '禁用' : '启用'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={() => actions.updateRole(item.userId, nextRole)}
                    disabled={state.updating}
                  >
                    <Text style={styles.actionBtnText}>
                      {nextRole === 'admin' ? '设为管理员' : '设为普通用户'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

