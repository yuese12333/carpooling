/**
 * @file offer-ride.tsx
 * @description 驾驶员发布拼车行程页面。
 * 遵循生命周期隔离原则，显式注入 requestId 链路，采用标准化日志记录规范。
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// 业务子组件
import { RouteSection } from "./components/route-section";
import { DateTimeSection } from "./components/date-time-section";
import { SeatPriceSection } from "./components/seat-price-section";
import { NotesSection } from "./components/notes-section";
import { Button } from "@/components/button";

// 样式与工具
import styles from "./offer-ride.style";
import { COLORS } from "@/pages/style"
import { useOfferRideForm } from "@/hooks/use-offer-ride-form";
import logger, { generateRequestId } from '@/utils/logger';

const MODULE_NAME = 'OFFER_RIDE_PAGE';

export default function OfferRidePage() {
  const router = useRouter();

  /**
   * [规范修复] 显式初始化 RequestId
   * 遵循生命周期隔离：在 Page 入口处同步生成/获取本次业务流 ID
   */
  const businessRequestId = useMemo(() => generateRequestId(), []);

  /**
   * [规范修复] 将 requestId 显式注入 Hook
   */
  const { state, actions } = useOfferRideForm(businessRequestId);

  /**
   * 页面初始化链路追踪 - 显式注入 requestId
   */
  useEffect(() => {
    logger.info({
      module: MODULE_NAME,
      operate: 'PAGE_ENTER',
      requestId: businessRequestId,
      params: {
        timestamp: Date.now(),
        platform: Platform.OS,
        screen: 'OfferRide'
      },
      result: 'SUCCESS'
    });
  }, [businessRequestId]);

  /**
   * 处理返回交互逻辑
   */
  const handleBack = (): void => {
    logger.info({
      module: MODULE_NAME,
      operate: 'NAVIGATE_BACK',
      requestId: businessRequestId,
      params: { from: 'OFFER_RIDE' }
    });
    router.back();
  };

  /**
   * 处理最终发布行程逻辑
   */
  const handlePublish = async (): Promise<void> => {
    logger.info({
      module: MODULE_NAME,
      operate: 'TRIGGER_PUBLISH_RIDE',
      requestId: businessRequestId,
      params: {
        hasDeparture: !!state.departureLocation,
        hasDestination: !!state.destinationLocation,
        seatCount: state.availableSeats
      }
    });

    try {
      await actions.handlePublishRide();
    } catch (error) {
      logger.error({
        module: MODULE_NAME,
        operate: 'PUBLISH_RIDE_FAILED',
        requestId: businessRequestId,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_SUBMISSION_ERROR',
        params: undefined // 显式使用 undefined 替代 null
      });
    }
  };

  /**
   * 原生时间选择器变更回调
   */
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (event.type === 'dismissed') {
      logger.info({
        module: MODULE_NAME,
        operate: 'TIME_PICK_CANCEL',
        requestId: businessRequestId,
        params: { eventType: event.type }
      });
      actions.hideTimePicker();
      return;
    }

    if (selectedDate) {
      logger.info({
        module: MODULE_NAME,
        operate: 'TIME_PICK_CONFIRM',
        requestId: businessRequestId,
        params: {
          eventType: event.type,
          selectedTime: selectedDate.toISOString()
        }
      });
      actions.handleTimeConfirm(selectedDate);
    }

    if (Platform.OS === 'android') {
      actions.hideTimePicker();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 头部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布行程</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* 1. 路线模块 - 显式传递 requestId */}
        <RouteSection
          requestId={businessRequestId}
          departure={state.departureLocation}
          destination={state.destinationLocation}
          waypointStops={state.waypointStops}
          newStopInput={state.newStopInput}
          onUpdateDeparture={actions.setDepartureLocation}
          onUpdateDestination={actions.setDestinationLocation}
          onUpdateNewStop={actions.setNewStopInput}
          onAddStop={actions.handleAddStop}
          onRemoveStop={actions.handleRemoveStop}
        />

        {/* 2. 时间日期模块 - 显式传递 requestId */}
        <DateTimeSection
          requestId={businessRequestId}
          selectedDate={state.selectedDateObj}
          selectedTime={state.selectedTime}
          isCalendarVisible={state.isCalendarVisible}
          isRecurring={state.isRecurringMode}
          dateLabel={actions.getDateLabel(state.selectedDateObj)}
          onToggleCalendar={() => actions.setIsCalendarVisible(!state.isCalendarVisible)}
          onShowTimePicker={actions.showTimePicker}
          onDateSelect={(date: Date) => {
            actions.setSelectedDateObj(date);
            logger.info({
              module: MODULE_NAME,
              operate: 'SET_DATE_STATE',
              requestId: businessRequestId,
              params: { targetDate: date.toISOString() }
            });
          }}
          onRecurringChange={actions.setIsRecurringMode}
        />

        {/* 3. 座位价格模块 - 显式传递 requestId */}
        <SeatPriceSection
          requestId={businessRequestId}
          seats={state.availableSeats}
          price={state.pricePerPerson}
          onUpdateSeats={actions.setAvailableSeats}
          onUpdatePrice={actions.setPricePerPerson}
        />

        {/* 4. 备注标签模块 - 显式传递 requestId */}
        <NotesSection
          requestId={businessRequestId}
          notes={state.additionalNotes}
          tags={state.presetTags}
          onUpdateNotes={actions.setAdditionalNotes}
          onAddTag={actions.appendNoteTag}
        />

        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* 5. 原生时间选择器 */}
      {state.isTimePickerVisible && (
        <DateTimePicker
          value={state.selectedDateObj instanceof Date ? state.selectedDateObj : new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <View style={styles.footer}>
        {state.isPublishingSuccess ? (
          <View style={[styles.successBtn, { backgroundColor: COLORS.primary }]}>
            <Check size={20} color="white" style={styles.successIcon} />
            <Text style={styles.publishBtnText}>发布成功！</Text>
          </View>
        ) : (
          <Button
            onPress={handlePublish}
            disabled={!state.departureLocation || !state.destinationLocation}
            // 动态切换背景色
            style={[
              styles.publishBtn,
              {
                backgroundColor: (state.departureLocation && state.destinationLocation)
                  ? COLORS.primary
                  : COLORS.textPlaceholder
              }
            ]}
          >
            <Text style={[
              styles.publishBtnText,
              // 如果禁用状态下文字颜色也需要变，可以在这里加逻辑
              !(state.departureLocation && state.destinationLocation) && styles.disabledText
            ]}>
              发布行程
            </Text>
          </Button>
        )}
      </View>
    </SafeAreaView >
  );
}