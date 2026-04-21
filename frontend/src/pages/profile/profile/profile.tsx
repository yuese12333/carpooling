/**
 * @file profile.tsx
 * @description 个人中心主页面。
 */

import React, { useEffect, useMemo } from "react";
import { ScrollView, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // UI 规范修复
import { useProfilePage } from "@/hooks/use-profile-form"; // 修正 Hook 引用名
import { useEnvStore } from "@/store/env-store";
import logger from "@/utils/logger";
import styles from "./profile.style";
import { menuData, badgeData } from "./profile-config";

import { ProfileHeader } from "./components/profile-header";
import { AchievementWall } from "./components/achievement-wall";
import { VehicleCard } from "./components/vehicle-card";
import { MenuSection } from "./components/menu-section";

const APP_VERSION = "v2.1.0";

/**
 * 个人中心入口组件
 * @returns {JSX.Element} 页面渲染树
 */
export default function ProfilePage() {
  /**
   * RequestId 生成与初始化规则：
   * 模块级同步初始化：作为个人中心业务流起点，显式从 Store 或 Context 获取。
   * 禁止隐式读取：此处获取后通过参数显式向下透传。
   */
  const requestId = useMemo(() => {
    return useEnvStore.getState().currentRequestId || `REQ-${Date.now()}`;
  }, []);

  // 显式透传 requestId 至 Hook 层
  const {
    profileData,
    displaySavings,
    badges,
    loading,
    handleMenuClick,
    handleEditAvatar,
    handleEditCar
  } = useProfilePage(requestId);

  /**
   * 页面生命周期日志记录
   * 职责分层：Page 层负责业务起点的 info 日志
   */
  useEffect(() => {
    try {
      logger.info({
        module: 'profile-page',
        operate: 'page-enter',
        params: { version: APP_VERSION, loading },
        result: 'success',
        requestId: requestId // 显式注入
      });
    } catch (error) {
      // 关键逻辑异常捕获
      console.error("Tracing log failed", error);
    }
  }, [requestId, loading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. 头部用户信息区 - 显式注入交互回调与数据 */}
        <ProfileHeader
          name={profileData.name}
          avatar={profileData.avatar}
          verified={profileData.verified}
          trips={profileData.trips}
          rating={profileData.rating}
          savings={displaySavings}
          onEditAvatar={handleEditAvatar}
        />

        <ScrollView style={styles.mainContent}>
          {/* 2. 成就勋章墙 - 纯展示组件不感知 requestId */}
          <AchievementWall
            badges={badges || badgeData}
          />

          {/* 3. 车辆信息卡片 */}
          <VehicleCard
            brand={profileData.car}
            color={profileData.carColor}
            plate={profileData.carPlate}
            onEdit={handleEditCar}
          />

          {/* 4. 功能菜单组 - 业务交互日志由 handleMenuClick 闭包内的 requestId 覆盖 */}
          <MenuSection
            menuData={menuData}
            onItemClick={handleMenuClick}
          />

          <Text style={styles.versionText}>拼车出行 {APP_VERSION}</Text>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}