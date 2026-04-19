/**
 * @file find-ride.tsx
 * @description 找拼车主页面。
 * 核心架构：采用受控组件模式，集成 Hook 逻辑抽象与全局链路追踪审计。
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from 'expo-router';
import { ArrowLeft, SlidersHorizontal } from "lucide-react-native";

// 导入样式与常量
import styles, { COLORS } from "./find-ride.style";

// 导入业务逻辑 Hook
import { useFindRideForm } from "../../hooks/use-find-ride-form";

// 导入子组件
import { SearchBar } from "./components/search-bar";
import { FilterTabs } from "./components/filter-tabs";
import { SortPanel } from "./components/sort-panel";
import { RideCard } from "./components/ride-card";

// 导入路由与工具规范
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/** 排序选项配置 */
const SORT_OPTIONS = ["最快出发", "价格最低", "评分最高", "距离最近"] as const;

/** 过滤标签配置 */
const FILTER_TAGS = [
  { label: "今天", value: "today" },
  { label: "明天", value: "tomorrow" },
  { label: "女司机", value: "female_driver" },
  { label: "空调", value: "ac" },
  { label: "免费等待", value: "free_wait" },
  { label: "准时出发", value: "on_time" },
];

/**
 * 找拼车主页面组件
 * @returns {JSX.Element}
 */
export default function FindRidePage() {
  const router = useRouter();

  // 从自定义 Hook 中解构状态和操作方法
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
  } = useFindRideForm();

  /**
   * 页面生命周期审计：记录入口日志并消费 RequestId
   */
  useEffect(() => {
    const requestId = useEnvStore.getState().currentRequestId;
    logger.info({
      module: 'page.findRide',
      operate: 'initPage',
      params: {
        initialFrom: searchFrom,
        initialTo: searchTo
      } as unknown as Record<string, unknown>,
      result: 'FindRide page initialized',
      requestId: requestId
    });
  }, []);

  /**
   * 增强型返回处理：注入交互日志
   */
  const handleBackPress = (): void => {
    const requestId = useEnvStore.getState().currentRequestId;
    logger.info({
      module: 'page.findRide',
      operate: 'navigateBack',
      params: undefined,
      result: 'User triggered back navigation',
      requestId: requestId
    });
    router.back();
  };

  /**
   * 增强型排序切换：注入交互日志
   */
  const handleToggleSort = (): void => {
    const requestId = useEnvStore.getState().currentRequestId;
    logger.info({
      module: 'page.findRide',
      operate: 'toggleSortPanel',
      params: { currentVisible: isSortDropdownVisible } as unknown as Record<string, unknown>,
      result: `Sort panel set to ${!isSortDropdownVisible}`,
      requestId: requestId
    });
    toggleSortDropdown();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 头部区域：包含导航、搜索和过滤 */}
      <View style={styles.header}>
        {/* 顶部导航栏 */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            accessibilityLabel="返回"
          >
            <ArrowLeft size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>找拼车</Text>

          <TouchableOpacity
            onPress={handleToggleSort}
            style={styles.iconButton}
            accessibilityLabel="排序筛选"
          >
            <SlidersHorizontal size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 搜索组件：受控组件模式 */}
        <SearchBar
          from={searchFrom}
          to={searchTo}
          onFromChange={setSearchFrom}
          onToChange={setSearchTo}
          onSearch={handleSearch}
        />

        {/* 过滤标签组件 */}
        <FilterTabs
          tags={FILTER_TAGS}
          activeFilters={activeFilters}
          onToggle={handleToggleFilter}
        />
      </View>

      {/* 条件渲染：排序下拉面板 */}
      {isSortDropdownVisible && (
        <SortPanel
          options={SORT_OPTIONS}
          currentSort={sortBy}
          onSelect={handleSelectSort}
        />
      )}

      {/* 列表滚动区域 */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultCount}>
          {loading ? "正在搜索行程..." : `共找到 ${filteredRides.length} 个行程`}
        </Text>

        {filteredRides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onPress={() => {
              const requestId = useEnvStore.getState().currentRequestId;
              logger.info({
                module: 'page.findRide',
                operate: 'selectRide',
                params: { rideId: ride.id } as unknown as Record<string, unknown>,
                result: 'Navigating to ride detail',
                requestId: requestId
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
            <Text style={{ color: COLORS.textLight }}>未找到匹配行程，请尝试更改搜索条件</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}