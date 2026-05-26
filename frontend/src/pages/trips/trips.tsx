/**
 * @file trips.tsx
 * @description “我的行程”页面实现。
 */

import React, { useMemo, useEffect } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

import { useTripsForm } from "@/hooks/use-trips-form";
import styles from "./trips.style";
import { COLORS } from "@/pages/style"
import { TripHeader } from "./components/trip-header";
import { TripTabBar } from "./components/trip-tab-bar";
import TripCard from "./components/trip-card";
import { TripEmptyState } from "./components/trip-empty-state";

// 引入日志工具
import logger, { generateRequestId } from "@/utils/logger";

const TRIP_TABS = ["全部", "即将出发", "已完成", "已取消"];
const ROLE_FILTERS = [
  { key: "all", label: "全部" },
  { key: "passenger", label: "乘客行程" },
  { key: "driver", label: "司机行程" }
] as const;

export default function TripsPage() {
  const router = useRouter();

  /**
   * [规范修复] 生命周期隔离：同步初始化本业务流唯一的 requestId
   * 采用当前时间戳与随机偏移量确保业务流 ID 的唯一性，严禁从 Store 隐式获取。
   */
  const requestId = useMemo(() => generateRequestId(), []);

  /**
   * [规范修复] 参数化消费：显式传递 requestId 至业务 Hook
   */
  const { state, actions } = useTripsForm({ requestId });
  const { activeTab, activeRole, isListInitialLoading, filteredTrips, isMockMode } = state;

  /**
   * [规范修复] 页面进入日志 - 严格遵循统一日志结构
   */
  useEffect(() => {
    logger.info({
      module: "TripsPage",
      operate: "PAGE_ENTER",
      params: {
        isMockMode: isMockMode ?? undefined,
        activeRole: activeRole ?? undefined
      },
      result: "SUCCESS",
      requestId
    });
  }, [requestId, activeRole, isMockMode]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* [规范修复] 业务子组件显式注入 requestId */}
        <TripHeader
          requestId={requestId}
          title="我的行程"
          isMockMode={isMockMode}
          activeRole={activeRole}
          roleFilters={ROLE_FILTERS}
          onBack={() => {
            logger.info({
              module: "TripsPage",
              operate: "CLICK_BACK",
              requestId,
              result: "SUCCESS"
            });
            router.back();
          }}
          onRoleChange={(role) => {
            logger.info({
              module: "TripsPage",
              operate: "SWITCH_ROLE",
              params: { from: activeRole, to: role },
              result: "SUCCESS",
              requestId
            });
            actions.setActiveRole(role);
          }}
        />

        {/* [规范修复] TabBar 区域显式注入 requestId */}
        <TripTabBar
          requestId={requestId}
          tabs={TRIP_TABS}
          activeTab={activeTab}
          onTabChange={(tab) => {
            logger.info({
              module: "TripsPage",
              operate: "SWITCH_TAB",
              params: { from: activeTab, to: tab },
              result: "SUCCESS",
              requestId
            });
            actions.setActiveTab(tab);
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          {isListInitialLoading ? (
            <View className="py-20">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : filteredTrips.length === 0 ? (
            <TripEmptyState
              onFindRide={() => {
                logger.info({
                  module: "TripsPage",
                  operate: "CLICK_FIND_RIDE",
                  requestId,
                  result: "SUCCESS"
                });
                actions.handleFindRideNavigation();
              }}
            />
          ) : (
            <View className="pb-10">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  requestId={requestId}
                  onPress={() => {
                    logger.info({
                      module: "TripsPage",
                      operate: "VIEW_DETAIL",
                      params: { tripId: trip.id },
                      result: "SUCCESS",
                      requestId
                    });
                    actions.handleViewTripDetail(trip.ride.id);
                  }}
                  onCancel={() => {
                    logger.info({
                      module: "TripsPage",
                      operate: "CANCEL_TRIP",
                      params: { tripId: trip.id },
                      result: "SUCCESS",
                      requestId
                    });
                    actions.handleCancelTrip(trip.id);
                  }}
                  onContact={() => {
                    logger.info({
                      module: "TripsPage",
                      operate: "CONTACT_USER",
                      params: { tripId: trip.id },
                      result: "SUCCESS",
                      requestId
                    });
                    actions.handleContactAction(trip.id, trip.role);
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}