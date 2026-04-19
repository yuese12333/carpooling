/**
 * @file home.tsx
 * @description 乘客端首页入口组件，整合环境切换、搜索表单、统计横幅及推荐行程列表。
 */

import React, { useEffect } from "react";
import { ScrollView, View, Text, Switch, TouchableOpacity } from "react-native";
import { ChevronRight, Shield, Star, Zap } from "lucide-react-native";

import { useHomeForm } from '@/hooks/use-home-form';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';
import styles, { COLORS } from "./home.style";
import { ROUTES } from '@/router/paths';

import { HomeHeader } from "./components/home-header";
import { RideCardItem } from "./components/ride-card-item";
import { StatsBanner } from "./components/stats-banner";
import { QuickActions } from "./components/quick-actions";

/**
 * 首页页面组件
 * @returns {JSX.Element} 渲染后的首页视口
 */
export default function HomePage() {
  const {
    fromLocation,
    setFromLocation,
    toLocation,
    setToLocation,
    selectedDate,
    userInfo,
    stats,
    hasUnread,
    isMockMode,
    featuredRides,
    toggleMockMode,
    handleSearch,
    navigateTo,
    router
  } = useHomeForm();

  // 获取当前链路追踪 ID
  const requestId = useEnvStore.getState().currentRequestId;

  /**
   * 页面进入时的埋点记录
   */
  useEffect(() => {
    logger.info({
      module: 'HomePage',
      operate: 'page_enter',
      params: { isMockMode },
      result: 'success',
      error: undefined,
      errorType: undefined,
      requestId
    });
  }, [requestId, isMockMode]);

  /**
   * 切换 Mock 模式并记录轨迹
   * @param {boolean} value - 模式状态
   */
  const handleToggleMode = (value: boolean) => {
    try {
      toggleMockMode(!value);
      logger.info({
        module: 'HomePage',
        operate: 'toggle_mock_mode',
        params: { targetMode: !value ? 'Mock' : 'Production' },
        result: 'success',
        error: undefined,
        errorType: undefined,
        requestId
      });
    } catch (error) {
      logger.error({
        module: 'HomePage',
        operate: 'toggle_mock_mode',
        params: { targetMode: !value ? 'Mock' : 'Production' },
        result: undefined,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'UI_INTERACTION_ERROR',
        requestId
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
    >
      {/* 1. 环境切换 - 仅在开发/测试环境展示的调试工具 */}
      <View style={styles.envSwitcher}>
        <Text style={styles.envLabel}>{isMockMode ? "Mock 模式" : "正式接口"}</Text>
        <Switch
          value={!isMockMode}
          onValueChange={handleToggleMode}
          trackColor={{ false: COLORS.textGray, true: COLORS.white }}
          thumbColor={isMockMode ? "#f4f3f4" : COLORS.primary}
          style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
        />
      </View>

      {/* 2. 头部区块 - 包含用户信息展示与地址搜索卡片 */}
      <HomeHeader
        userInfo={userInfo}
        fromLocation={fromLocation}
        toLocation={toLocation}
        selectedDate={selectedDate}
        hasUnread={hasUnread}
        onSetFrom={setFromLocation}
        onSetTo={setToLocation}
        onSearch={handleSearch}
        onNavigateToProfile={() => router.push(ROUTES.PROFILE_MAIN)}
        onNavigateToNotifications={() => navigateTo(ROUTES.RIDE.NAVIGATION)}
      />

      {/* 快捷操作区 */}
      <QuickActions
        onNavigate={navigateTo}
        colors={{
          blue: COLORS.bgBlueLight,
          green: COLORS.bgGreenLight,
          purple: COLORS.bgPurpleLight
        }}
      />

      {/* 3. 统计横幅 - 实时运营数据展示 */}
      <StatsBanner stats={stats} />

      {/* 4. 信任标识 - 平台安全心智传递 */}
      <View style={styles.trustSection}>
        <View style={styles.trustBadgeBlue}>
          <Shield size={14} color={COLORS.statusSuccess} />
          <Text style={styles.trustTextGreen}>实名认证</Text>
        </View>
        <View style={styles.trustBadgeBlueVariant}>
          <Star size={14} color={COLORS.statusInfo} />
          <Text style={styles.trustTextBlue}>信用评分</Text>
        </View>
        <View style={styles.trustBadgeOrange}>
          <Zap size={14} color={COLORS.statusWarning} />
          <Text style={styles.trustTextOrange}>快速匹配</Text>
        </View>
      </View>

      {/* 5. 行程列表区块 - 基于地理位置的推荐行程 */}
      <View style={styles.ridesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>附近行程</Text>
          <TouchableOpacity
            onPress={() => navigateTo(ROUTES.FIND_RIDE)}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>查看全部</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.ridesList}>
          {featuredRides.map((ride) => (
            <RideCardItem
              key={ride.id}
              ride={ride}
              onPress={(id) => navigateTo({
                pathname: ROUTES.RIDE.DETAIL,
                params: { id }
              })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}