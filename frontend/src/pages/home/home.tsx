/**
 * @file home.tsx
 * @description 乘客端首页入口组件
 */

import React, { useEffect, useMemo } from "react";
import { ScrollView, View, Text, Switch, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, Shield, Star, Zap } from "lucide-react-native";

import { useHomeForm } from '@/hooks/use-home-form';
import logger, { generateRequestId } from '@/utils/logger';
import styles from "./home.style";
import { COLORS } from "@/pages/style";
import { ROUTES } from '@/router/paths';

import { HomeHeader } from "./components/home-header";
import { RideCardItem } from "./components/ride-card-item";
import { StatsBanner } from "./components/stats-banner";
import { QuickActions } from "./components/quick-actions";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const requestId = useMemo(() => generateRequestId(), []);

  // 将 requestId 显式注入业务 Hook 逻辑层
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
  } = useHomeForm(requestId);

  /**
   * 页面进入时的埋点记录 - 显式依赖参数中的 requestId
   */
  useEffect(() => {
    logger.info({
      module: 'HomePage',
      operate: 'page_enter',
      params: { isMockMode },
      result: 'success',
      error: undefined,
      errorType: undefined,
      requestId: requestId
    });
  }, [requestId, isMockMode]);

  /**
   * 切换 Mock 模式并记录轨迹
   * @param {boolean} value - 模式状态
   */
  const handleToggleMode = (value: boolean) => {
    const targetMode = !value ? 'Mock' : 'Production';
    try {
      toggleMockMode(!value);
      logger.info({
        module: 'HomePage',
        operate: 'toggle_mock_mode',
        params: { targetMode },
        result: 'success',
        error: undefined,
        errorType: undefined,
        requestId: requestId
      });
    } catch (error) {
      logger.error({
        module: 'HomePage',
        operate: 'toggle_mock_mode',
        params: { targetMode },
        result: undefined,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'UI_INTERACTION_ERROR',
        requestId: requestId
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top } // 动态处理顶部安全距离
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. 环境切换 - 显式化 requestId 消费 */}
        <View style={styles.envSwitcher}>
          <Text style={styles.envLabel}>{isMockMode ? "Mock 模式" : "正式接口"}</Text>
          <Switch
            value={!isMockMode}
            onValueChange={handleToggleMode}
            trackColor={{ false: COLORS.textMuted, true: COLORS.white }}
            thumbColor={isMockMode ? COLORS.borderLight : COLORS.primary}
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
          />
        </View>

        {/* 2. 头部区块 - 传递 requestId 确保子组件动作链路完整 */}
        <HomeHeader
          requestId={requestId}
          userInfo={userInfo}
          fromLocation={fromLocation}
          toLocation={toLocation}
          selectedDate={selectedDate}
          hasUnread={hasUnread}
          onSetFrom={setFromLocation}
          onSetTo={setToLocation}
          onSearch={() => handleSearch()}
          onNavigateToProfile={() => navigateTo(ROUTES.PROFILE_MAIN)}
          onNavigateToNotifications={() => navigateTo(ROUTES.PROFILE.NOTIFICATION)}
        />

        {/* 快捷操作区 */}
        <QuickActions
          requestId={requestId}
          onNavigate={navigateTo}
          colors={{
            blue: COLORS.bgBlueLight,
            green: COLORS.bgGreenLight,
            purple: COLORS.bgPurpleLight,
            orange: COLORS.bgOrangeLight,
          }}
        />

        {/* 3. 统计横幅 */}
        <StatsBanner stats={stats} />

        {/* 4. 信任标识 */}
        <View style={styles.trustSection}>
          <View style={styles.trustBadgeBlue}>
            <Shield size={14} color={COLORS.status.success} />
            <Text style={styles.trustTextGreen}>实名认证</Text>
          </View>
          <View style={styles.trustBadgeBlueVariant}>
            <Star size={14} color={COLORS.status.info} />
            <Text style={styles.trustTextBlue}>信用评分</Text>
          </View>
          <View style={styles.trustBadgeOrange}>
            <Zap size={14} color={COLORS.status.warning} />
            <Text style={styles.trustTextOrange}>快速匹配</Text>
          </View>
        </View>

        {/* 5. 行程列表区块 */}
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
                  params: { id, traceId: requestId } // 导航参数携带 Trace ID
                })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}