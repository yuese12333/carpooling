/**
 * @file find-ride.tsx
 * @description 找拼车主页面。
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { ArrowLeft, SlidersHorizontal } from "lucide-react-native";

// 导入样式与常量
import styles from "./find-ride.style";
import { COLORS } from '@/pages/style';

// 导入业务逻辑 Hook
import { useFindRideForm } from "../../hooks/use-find-ride-form";
import { RIDE_SORT_OPTIONS, RIDE_FILTER_TAGS } from "@/api/find-ride-api";

// 导入子组件
import { SearchBar } from "./components/search-bar";
import { FilterTabs } from "./components/filter-tabs";
import { SortPanel } from "./components/sort-panel";
import { RideCard } from "./components/ride-card";

// 导入路由与工具规范
import { ROUTES } from '@/router/paths';
import logger, { generateRequestId } from '@/utils/logger';

/** 排序选项配置 */
const SORT_OPTIONS = RIDE_SORT_OPTIONS;

/** 过滤标签配置 */
const FILTER_TAGS = RIDE_FILTER_TAGS;

/**
 * 找拼车主页面组件
 * @returns {JSX.Element}
 */
export default function FindRidePage() {
  const router = useRouter();
  const requestId = useMemo(() => generateRequestId(), []);

  // 从自定义 Hook 中解构状态和操作方法，显式注入 requestId
  const {
    searchFrom,
    searchTo,
    sortBy,
    activeFilters,
    isSortDropdownVisible,
    loading,
    filteredRides,
    setSearchFrom,
    setSearchTo,
    handleSearch,
    handleToggleFilter,
    handleSelectSort,
    toggleSortDropdown
  } = useFindRideForm(requestId);

  /**
   * 页面生命周期审计：记录入口日志
   */
  useEffect(() => {
    logger.info({
      module: 'page.findRide',
      operate: 'initPage',
      params: {
        initialFrom: searchFrom,
        initialTo: searchTo
      },
      result: 'FindRide page initialized',
      requestId: requestId,
      error: undefined,
      errorType: undefined
    });
  }, [requestId, searchFrom, searchTo]);

  /**
   * 增强型返回处理
   */
  const handleBackPress = (): void => {
    logger.info({
      module: 'page.findRide',
      operate: 'navigateBack',
      params: undefined,
      result: 'User triggered back navigation',
      requestId: requestId,
      error: undefined,
      errorType: undefined
    });
    router.back();
  };

  /**
   * 增强型排序切换
   */
  const handleToggleSort = (): void => {
    logger.info({
      module: 'page.findRide',
      operate: 'toggleSortPanel',
      params: { currentVisible: isSortDropdownVisible },
      result: `Sort panel visibility toggled to ${!isSortDropdownVisible}`,
      requestId: requestId,
      error: undefined,
      errorType: undefined
    });
    toggleSortDropdown();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* 头部区域 */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            accessibilityLabel="返回"
          >
            <ArrowLeft size={20} color={COLORS.textSub} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>找拼车</Text>

          <TouchableOpacity
            onPress={handleToggleSort}
            style={styles.iconButton}
            accessibilityLabel="排序筛选"
          >
            <SlidersHorizontal size={18} color={COLORS.textSub} />
          </TouchableOpacity>
        </View>

        {/* 搜索组件：参数化注入 requestId (假设子组件已适配 props 接收) */}
        <SearchBar
          from={searchFrom}
          to={searchTo}
          onFromChange={setSearchFrom}
          onToChange={setSearchTo}
          onSearch={handleSearch}
          requestId={requestId}
        />

        {/* 过滤标签组件 */}
        <FilterTabs
          tags={FILTER_TAGS}
          activeFilters={activeFilters}
          onToggle={handleToggleFilter}
          requestId={requestId}
        />
      </View>

      {/* 条件渲染：排序下拉面板 */}
      {isSortDropdownVisible && (
        <SortPanel
          options={SORT_OPTIONS}
          currentSort={sortBy}
          onSelect={handleSelectSort}
          requestId={requestId}
        />
      )}

      {/* 列表滚动区域 */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.resultCount}>
          {loading && filteredRides.length === 0
            ? "正在搜索行程..."
            : loading
              ? "正在刷新..."
              : `共找到 ${filteredRides.length} 个行程`}
        </Text>

        {filteredRides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            requestId={requestId}
            onPress={() => {
              logger.info({
                module: 'page.findRide',
                operate: 'selectRide',
                params: { rideId: ride.id },
                result: 'Navigating to ride detail',
                requestId: requestId,
                error: undefined,
                errorType: undefined
              });
              router.push({
                pathname: ROUTES.RIDE.DETAIL,
                params: { id: ride.id }
              });
            }}
          />
        ))}

        {/* 列表为空时的占位提示 */}
        {!loading && filteredRides.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: COLORS.textMuted }}>
              未找到匹配行程，请尝试更改搜索条件
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}