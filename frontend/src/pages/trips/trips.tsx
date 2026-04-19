import React from "react";
import { ScrollView, View, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter } from 'expo-router';

// 导入 Hook、样式与局部组件
import { useTripsForm } from "@/hooks/use-trips-form";
import styles, { COLORS } from './trips.style';
import { TripHeader } from "./components/trip-header";
import { TripTabBar } from "./components/trip-tab-bar";
import TripCard from "./components/trip-card";
import { TripEmptyState } from "./components/trip-empty-state";

const TRIP_TABS = ["全部", "即将出发", "已完成", "已取消"];
const ROLE_FILTERS = [{ key: "all", label: "全部" }, { key: "passenger", label: "乘客行程" }, { key: "driver", label: "司机行程" }] as const;

export default function TripsPage() {
  const router = useRouter();
  const { state, actions } = useTripsForm();
  const { activeTab, activeRole, loading, filteredTrips, isMockMode } = state;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* 1. 头部区域 */}
        <TripHeader
          title="我的行程"
          isMockMode={isMockMode}
          activeRole={activeRole}
          roleFilters={ROLE_FILTERS}
          onBack={() => router.back()}
          onRoleChange={actions.setActiveRole}
        />

        {/* 2. TabBar 区域 */}
        <TripTabBar
          tabs={TRIP_TABS}
          activeTab={activeTab}
          onTabChange={actions.setActiveTab}
        />

        {/* 3. 列表内容区域 */}
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          {loading ? (
            <View className="py-20"><ActivityIndicator color={COLORS.primary} /></View>
          ) : filteredTrips.length === 0 ? (
            <TripEmptyState onFindRide={actions.handleFindRideNavigation} />
          ) : (
            <View className="pb-10">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={() => actions.handleViewTripDetail(trip.ride.id)}
                  onCancel={() => actions.handleCancelTrip(trip.id)}
                  onContact={() => actions.handleContactAction(trip.id, trip.role)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}