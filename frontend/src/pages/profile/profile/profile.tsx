/**
 * @file profile.tsx
 * @description 个人中心主页面。修复了车辆数据状态的映射逻辑，并遵循严谨的全链路追踪规范。
 */

import React, { useEffect, useMemo } from "react";
import { ScrollView, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfilePage } from "@/hooks/use-profile-form"; // 确保引用重命名后的 Hook
import logger, { generateRequestId } from "@/utils/logger";
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
   * RequestId 独立化原则：
   * 页面级 requestId 必须使用 useMemo 配合 generateRequestId() 独立生成。
   * 严禁复用全局 Store 或隐式读取。
   */
  const requestId = useMemo(() => generateRequestId(), []);

  // 从 Hook 中解构出 profileData 与独立维护的 carData
  const {
    profileData,
    carData,      // 对应 Hook 中的 carData 状态
    displaySavings,
    badges,
    loading,
    handleMenuClick,
    handleEditAvatar,
    handleEditCar
  } = useProfilePage(requestId);

  /**
   * 页面生命周期日志记录
   */
  useEffect(() => {
    logger.info({
      module: 'profile-page',
      operate: 'page-enter',
      params: { version: APP_VERSION, loading: !!loading },
      result: 'success',
      requestId: requestId
    });
  }, [requestId, loading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* 规范修复：ScrollView 必须添加 keyboardShouldPersistTaps="handled" */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. 头部用户信息区 - 基于 profileData 渲染 */}
        {profileData && (
          <ProfileHeader
            name={profileData.name}
            avatar={profileData.avatar}
            verified={profileData.verified}
            trips={profileData.trips}
            rating={profileData.rating}
            savings={displaySavings}
            onEditAvatar={handleEditAvatar}
          />
        )}

        <ScrollView
          style={styles.mainContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 2. 成就勋章墙 */}
          <AchievementWall
            badges={badges || badgeData}
          />

          {/* 3. 车辆信息卡片 */}
          {carData && (
            <VehicleCard
              brand={carData.brand || '--'}
              color={carData.color || '--'}
              plate={carData.carPlate || '未绑定'}
              onEdit={handleEditCar}
            />
          )}

          {/* 4. 功能菜单组 */}
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